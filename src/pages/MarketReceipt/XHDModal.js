/**
 * 材料订单弹窗
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
  let { modalShow, onSelectedRow, modalClose, params = {} } = props;

  let basicParams = params;

  let [tableData, setTableData] = useState([]);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageSize] = useState(10);
  let [pageTotal, setPageTotal] = useState(0);
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01 00:00:00'),
    endTime: moment().format('YYYY-MM-DD 23:59:59'),
  });
  let [sorterParams, setSorterParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    onSearch();
  }, [searchParams, sorterParams, pageIndex])

  const onSearchClick = (val) => {
    setPageIndex(1);
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD 00:00:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD 23:59:59');

      delete val.time;
    }
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

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/order/list', method: 'GET', params: { page: pageIndex, pageSize, ...searchParams, ...sorterParams, ...basicParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            if (item.pay_type == 1 && item.ret_status > 0) {
              item.billAmount = 0 - item.billAmount;
              item.payed = 0 - item.payed;
            }
          })
          setTableData(res.page.list);
          setPageTotal(res.page.totalCount);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      })
  }

  const onPageChange = (page) => {
    setPageIndex(page);
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
    }, 
    // {
    //   type: 'input',
    //   label: '关键字搜索',
    //   paramName: 'search',
    //   placeholder: '请输入单据号或备注关键字'
    // }
  ];

  let columns = [
    {
      title: '订单编号',
      dataIndex: 'om',
      align: 'center',
      width: 150,
      render: (text) => (
        text && text.ordersn
      )
    },
    {
      title: '订单创建时间',
      dataIndex: 'ctime',
      align: 'center',
      width: 150,
      render: (text, record) => (
        record.om && record.om.ctime
      )
    },
    {
      title: '订单总额',
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (text) => (
        text && (text / 100).toFixed(2)
      )
    },
    { title: '总sku数量', dataIndex: 'number', align: 'center', width: 100 },
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
          rowKey='oid'
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </div>,
      span: 24,
    }
  ];
  return (
    <FormModal
      visible={modalShow}
      items={modalItems}
      title={'选择源单'}
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