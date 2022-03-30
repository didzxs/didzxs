/**
 * 工程订单弹窗
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const OrderModal = (props) => {
  let { modalShow, onSelectedRow, modalClose, params = {}, selectType = 'multiple' } = props; // selectType: multiple 多选。 multiple-choice 单选

  let basicParams = params;

  let [tableData, setTableData] = useState([]);
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01 00:00:00'),
    endTime: moment().format('YYYY-MM-DD 23:59:59'),
  });
  let [pageIndex, setPageIndex] = useState(1);
  let [pageSize] = useState(10);
  let [pageTotal, setPageTotal] = useState(0);
  let [sorterParams, setSorterParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    onSearch();
  }, [pageIndex, searchParams, sorterParams])

  const onSearchClick = (val) => {
    setPageIndex(1);
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD 00:00:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD 23:59:59');
    }
    delete val.time;
    setSearchParams(val);
  }

  const onTableChange = (pagination, filters, sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { snSelf: 1, billDate: 2, billAmount: 3 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    setSorterParams(val);
  }

  const onSearch = (page = 1) => {
    setTableLoading(true);
    setPageIndex(page);
    request({ url: '/api/order/project/list', method: 'GET', params: { page, pageSize, type: 3, ...searchParams, ...sorterParams, ...basicParams } })
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
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'input',
      label: '关键字搜索',
      paramName: 'search',
      placeholder: '请输入单据号或备注关键字'
    }
  ];

  let columns = [
    { title: '项目名称', dataIndex: 'proj_name', align: 'center', width: 100 },
    { title: '项目编号', dataIndex: 'self_sn', align: 'center', width: 120 },
    {
      title: '甲方合同金额',
      dataIndex: 'contract_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : 0
      )
    },
    {
      title: '托管合同金额',
      dataIndex: 'proj_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : 0
      )
    },
    {
      title: '合同起止时间',
      dataIndex: 'started_at',
      align: 'center',
      width: 160,
      render: (text, record) => (
        text && record.ended_at && moment(text).format('YYYY-MM-DD HH:mm') + '~' + moment(record.ended_at).format('YYYY-MM-DD HH:mm')
      )
    },
  ];


  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      if (selectType == 'multiple') {
        setSelectedRowKeys(selectedRowKeys);
        setSelectedRows(selectedRows);
      } else {
        setSelectedRowKeys([selectedRowKeys[selectedRowKeys.length - 1]]);
        setSelectedRows([selectedRows[selectedRowKeys.length - 1]]);
      }
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
          pagination={true}
          rowSelection={rowSelection}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content', y: 475 }}
          onChange={onTableChange}
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
      title={'选择工程单'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default OrderModal;