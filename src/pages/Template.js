/**
 * 模版
 */

import React, { Component } from 'react';
import { message, Modal } from 'antd';
import config from '../config';
import request from '../utils/request';
import Filtrate from '../components/common/Filtrate';
import Container from '../components/common/Container';
import MyTable from '../components/common/MyTable';
import MyPagination from '../components/common/MyPagination';
import FormModal from '../components/common/FormModal';
import PublicService from '../services/PublicService';
import Download from '../utils/Download';

class Template extends Component {
  state = {
    pageIndex: 1,
    pageSize: config.pageSize,
    pageTotal: 0,
    tableData: [],
    tableLoading: false,

    searchParams: {},
    sorterParams: {},
    modalShow: false,
    modalVal: {}
  }

  componentDidMount() {
    let { searchApi = {} } = this.props;
    if(searchApi.delayed) {
      return;
    }
    this.onSearch(1);
  }

  onSearch = (page = 1) => {
    let { searchApi = {} } = this.props;
    let { searchParams, sorterParams, pageSize } = this.state;

    this.setState({
      pageIndex: page,
    })

    let basicParams = {
      page,
      pageSize,
    }
    if(searchApi.pageType == 1) {
      basicParams = {
        current: page,
        size: pageSize,
      }
    }

    request({url: searchApi.url || '', method: 'GET', params: {...basicParams, ...searchApi.params, ...searchParams, ...sorterParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          if(this.props.handleTableData) {
            res = this.props.handleTableData(res) || res;
          }
          this.setState({
            tableData: res.page.list || res.page.data,
            pageTotal: res.page.totalCount,
          })
        }
      })
  }

  onSearchClick = (val) => {
    if(this.props.handleSearchData) {
      val = this.props.handleSearchData(val);
    }
    this.setState({
      searchParams: val,
    }, () => {
      this.onSearch(1);
    })
  }

  // 查询栏渲染
  renderFiltrate = () => {
    const { searchItems, searchProps = {} } = this.props;
    return (
      <Filtrate items={searchItems} onSearch={this.onSearchClick} {...searchProps} />
    )
  }

  onDelete = () => {

  }

  onExport = () => {
    let { searchParams, sorterParams, pageIndex, pageSize } = this.state;
    let { exportApi, onExport } = this.props;

    if(onExport) {
      onExport();
      return;
    }

    Download(exportApi.url, {
      page: pageIndex,
      pageSize,
      ...exportApi.params,
      ...searchParams,
      ...sorterParams,
    });
  }

  // 处理表格排序数据
  onTableChang = (pagination, filters, sorter) => {
    if(this.props.handleSorter) {
      let val = this.props.handleSorter(sorter);
      this.setState({
        sorterParams: val
      }, () => {
        this.onSearch();
      })
    }
  }

  // 清除列表勾选状态
  selectedRowEmpty = () => {
    this.setState({
      selectedRowKeys: [],
      selectedRows: [],
    })
  }

  // 表格渲染
  renderTable = () => {
    const t = this;
    const { pageIndex, pageSize, pageTotal, tableLoading, selectedRowKeys, tableData } = t.state;
    const { columns, headerShow = true, addBtnShow = true, editBtnShow = true, deleteBtnShow = true, exportBtnShow = true, rowSelectionShow = true, extraBtn, exportApi = {}, importApi = {}, templateUrl, conheightAuto = true, containerStyle, rowKey, tableProps = {} } = t.props;
    // 删除按钮点击
    const deleteBtn = () => {
      const t = this;
      const {selectedRows = []} = t.state;
      if (!selectedRows.length) {
        return message.warning("请选择要删除的数据！");
      }

      Modal.confirm({
        title: '提示',
        content: '是否删除当前勾选的数据?',
        okText: '确认',
        cancelText: '取消',
        onOk: () => onDelete({ids: PublicService.getDataByKey(selectedRows, "id")})
      });
    };

    // 删除事件
    const onDelete = (val) => {
      console.log("val:", val);
      const hide = message.loading('删除中...', 0);
      setTimeout(() => {
        message.success("删除成功！");
        hide();
        this.onSearch();
      }, 1000)
    };


    let rowSelection = rowSelectionShow ? {
      rowSelection: {
        columnWidth: 40,
        selectedRowKeys: selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.setState({ selectedRowKeys, selectedRows });
        },
      }
    } : {};

    let otherProps = {};
    if(rowKey) {
      otherProps.rowKey = rowKey;
    }
    return (
      <Container
        heightAuto={conheightAuto}
        style={containerStyle}
        headerShow={headerShow}
        addBtn={addBtnShow && t.onModalShow.bind(t, "新增", {})}
        editBtn={editBtnShow && (() => message.success("编辑"))}
        deleteBtn={deleteBtnShow && deleteBtn}
        exportBtn={exportBtnShow && t.onExport}
        exportBtnText={exportBtnShow && exportApi.btnText}
        importBtnShow={importApi && importApi.show}
        importBtnUrl={importApi && importApi.url}
        importBtnText={importApi.btnText}
        importProps={{
          name: importApi.name,
          data: importApi.data,
        }}
        templateUrl={templateUrl}
        upSuccess={t.onSearch}
        extraBtn={extraBtn}
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          {...rowSelection}
          dataSource={PublicService.transformArrayData(tableData, true, true, pageIndex, pageSize)}
          scroll={{x: 'max-content'}}
          onChange={t.onTableChang}
          {...otherProps}
          {...tableProps}
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={this.onSearch}
          onShowSizeChange={this.onSearch}
        />
      </Container>
    );
  };

  onModalSave = (val) => {
    let { modalTitle, pageIndex } = this.state;
    let { addApi = {}, editApi = {}, savePageStay = false } = this.props;
    let data = val;
    if(this.props.handleSaveData) {
      data = this.props.handleSaveData(val);
    }

    if(data == false) {
      return;
    }

    let reqObj = {
      url: addApi.url,
      method: 'POST',
    }
    if(addApi.dataType == 'form') {
      reqObj.form = {...addApi.params, ...data};
    } else {
      reqObj.data = {...addApi.params, ...data};
    }
    if(modalTitle == '编辑') {
      reqObj = {
        url: editApi.url,
        method: editApi.method,
      }
      if(editApi.dataType == 'form') {
        reqObj.form = {...editApi.params, ...data};
      } else {
        reqObj.data = {...editApi.params, ...data};
      }
    }

    if(this.props.handleSaveRequest) {
      let obj = this.props.handleSaveRequest(modalTitle);
      if(obj) {
        if(obj.dataType == 'form') {
          obj.form = data;
        } else {
          obj.data = data;
        }
        delete obj.dataType;
        reqObj = obj;
      }
    }

    this.setState({modalBtnLoading: true});
    request(reqObj)
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('保存成功');
          if(savePageStay) {
            this.onSearch(pageIndex);
          } else {
            this.onSearch(1);
          }
          this.modalCancel();
          this.setState({
            selectedRowKeys: [],
            selectedRows: [],
          })
        } else {
          message.error(res.msg || res.message);
        }
        this.setState({modalBtnLoading: false});
      })
  }

  onModalShow = (type, record, callback) => {
    this.setState({
      modalShow: true,
      modalTitle: type,
      modalVal: record,
    }, () => {
      this.props.getModalFormHanld && this.props.getModalFormHanld(this.myForm);
      setTimeout(() => {
        callback && typeof callback == 'function' && callback(this.myForm);
      })
    })
    this.props.getModalType && this.props.getModalType(type);
  }

  modalCancel = () => {
    this.setState({
      modalShow: false,
      modalVal: {},
    })
    this.props.modalCancel && this.props.modalCancel();
  }

  renderModal = () => {
    const t = this;
    const { modalShow } = t.state;
    if (modalShow) {
      const { modalTitle, modalBtnLoading, modalVal = {} } = t.state;
      let { modalItems, modalWidth, modalBtnList = [], modalProps = {} } = t.props;
      let disabled = modalTitle === "查看";

      return (
        <FormModal
          width={modalWidth}
          visible={modalShow}
          items={modalItems}
          modalBtnLoading={modalBtnLoading}
          wrappedComponentRef={ref => this.myForm = ref}
          title={modalTitle}
          disabled={disabled}
          disabledType='readOnly'
          footerShow={!disabled}
          onModalSave={t.onModalSave}
          onCancel={t.modalCancel}
          buttonList={modalBtnList}
          {...modalProps}
        />
      )
    }
  }

  render() {
    let t = this;
    let { filterShow = true } = t.props;
    return (
      <div>
        {filterShow && t.renderFiltrate()}
        {t.renderTable()}
        {t.renderModal()}
      </div>
    );
  }
}

export default Template;
