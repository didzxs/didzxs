/**
 * 采购订单弹窗
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const OrderModal = (props) => {
  let { modalShow, onSelectedRow, modalClose, params = {} } = props;

  let basicParams = params;

  let [supplierList, setSupplierList] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [sorterParams, setSorterParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    // 供应商
    request({ url: '/api/supplier/list', method: 'GET', params: { page: 1, pageSize: 100000, status: 1 } })
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
    onSearch();
  }, [searchParams, sorterParams])

  const onSearchClick = (val) => {
    if(val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    setSearchParams(val);
  }

  const onTableChange = (pagination, filters, sorter) => {
    let val = {};
    if(sorter.order) {
      val.sort = {snSelf: 1, billDate: 2, billAmount: 3}[sorter.columnKey];
      val.orderBy = {ascend: 1, descend: 2}[sorter.order];
    }
    setSorterParams(val);
  }

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/accountF/listNeedPayO', method: 'GET', params: { ...basicParams, ...searchParams, ...sorterParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            if(item.type == 2) {
              item.billAmount = 0 - item.billAmount;
              item.payed = 0 - item.payed;
            }
          })
          setTableData(res.data);
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
    }, 
    // {
    //   type: 'select',
    //   label: '供应商',
    //   paramName: 'supplierId',
    //   itemProps: {
    //     options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
    //   }
    // }
  ];

  let columns = [
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120, sorter: true },
    {
      title: '业务类别',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      render: (text) => (
        {1: '采购', 2: '采购退款'}[text]
      )
    },
    { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120, sorter: true },
    { title: '供应商名称', dataIndex: 'supplier_name', align: 'center', width: 120 },
    {
      title: '单据金额',
      dataIndex: 'billAmount',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text, record) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '已核销金额',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text, record) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '未核销金额',
      dataIndex: 'a',
      align: 'center',
      width: 120,
      render: (text, record) => (
        (record.billAmount - record.payed) / 100
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
          pagination={true}
          rowSelection={rowSelection}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content', y: 475 }}
          onChange={onTableChange}
          rowKey='id'
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