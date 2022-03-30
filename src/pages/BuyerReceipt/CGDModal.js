/**
 * 采购单弹窗接口
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

const CGDModal = (props) => {
  let { modalShow, onSelectedRow, modalClose, params = {} } = props;

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

  let [orderType, setOrderType] = useState(1);

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
      val.sort = { operated_at: 1, gouhuo_fee: 2 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    setSorterParams(val);
  }

  const onSearch = (page = 1) => {
    setTableLoading(true);
    setPageIndex(page);
    // receiptStatus: -3 查非全部开票
    request({ url: '/api/caigou/list', method: 'GET', params: { page, pageSize, ...searchParams, ...sorterParams, ...basicParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            if (item.sn_self.indexOf('CGT') > -1) {
              
            }
          })
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

  const onTypeChange = (val) => {
    setOrderType(val);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '采购单' },
          { value: 2, label: '采购退货单' },
        ],
        onChange: onTypeChange
      },
      initialValue: 1,
    }, {
      type: 'input',
      label: '关键字搜索',
      paramName: 'search',
      placeholder: '请输入单据号或备注关键字'
    }
  ];

  let columns = [
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 120 },
    { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 120 },
    { title: '数量', dataIndex: 'number', align: 'center', width: 100 },
    {
      title: orderType == 1 ? '购货金额' : '退货金额',
      dataIndex: 'gouhuo_fee',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: orderType == 1 ? '已付款' : '已退款',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: orderType == 1 ? '付款状态' : '退款状态',
      dataIndex: 'pay_status',
      align: 'center',
      width: 120,
      render: (text) => (
        orderType == 1 ?
        {0: '未付款', 1: '部分付款', 2: '已付款'}[text] :
        {0: '未退款', 1: '部分退款', 2: '已退款'}[text]
      )
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
      title={'选择采购单'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default CGDModal;