/**
 * 付款单弹窗
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { message } from 'antd';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const SKDModal = (props) => {
  let { modalShow, onSelectedRow, modalClose, params = {} } = props;

  let [supplierList, setSupplierList] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    // 供应商
    request({ url: '/api/supplier/list', method: 'GET', params: { page: 1, pageSize: 100000 } })
    .then(res => {
      if (res && res.retcode == 0) {
        let list = [];
        res.page.list.map(item => {
          list.push({
            value: item.id,
            label: item.name,
          })
        })
        setSupplierList(list);
      }
    })
  }, [])

  useEffect(() => {
    onSearch(pageIndex);
  }, [pageIndex, searchParams])

  const onSearchClick = (val) => {
    setPageIndex(1);
    if(val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    setSearchParams(val);
  }

  const onSearch = (page = 1) => {
    setTableLoading(true);
    setPageIndex(page);
    // type：2付款单  checkStatus：1已审核  verifyStatus：-1待核销
    request({ url: '/api/accountF/list', method: 'GET', params: { page, pageSize, type: 2, checkStatus: 1, verifyStatus: -1, ...params, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          setTableData(res.page.list);
          setPageTotal(res.page.totalPage * res.page.pageSize);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      })
  }

  const onModalSave = () => {
    onSelectedRow(selectedRows);
    modalClose(false);
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'input',
      label: '关键字搜索',
      paramName: 'search',
      placeholder: '请输入单据号或备注关键字'
    }, 
    // {
    //   type: 'select',
    //   label: '供应商',
    //   paramName: 'organId',
    //   itemProps: {
    //     options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
    //   }
    // }
  ];

  let columns = [
    { title: '源单编号', dataIndex: 'sn_self', align: 'center', width: 120, sorter: true },
    {
      title: '业务类别',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      render: (text) => ('付款')
    },
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '供应商名称', dataIndex: 'organ_name', align: 'center', width: 100 },
    {
      title: '单据金额',
      dataIndex: 'total_amount',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '已核销金额',
      dataIndex: 'verify_amount',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '未核销金额',
      dataIndex: 'a',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return (record.total_amount - record.verify_amount) / 100;
      }
    },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 200 },
  ];

  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  let modalItems = [
    {
      type: 'blank',
      content: <div>
        <Filtrate items={searchItems} onSearch={onSearchClick} />
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          rowSelection={rowSelection}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content', y: 475 }}
          rowKey='id'
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={onSearch}
          onShowSizeChange={onSearch}
        />
      </div>,
      span: 24,
    }
  ];
  return (
    <FormModal
      visible={modalShow}
      items={modalItems}
      title={'选择单子'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default SKDModal;