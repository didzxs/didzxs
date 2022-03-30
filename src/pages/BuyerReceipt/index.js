/**
 * 采购开票
 */

import React, { useEffect, useState } from 'react';
import { message, Button, InputNumber } from 'antd';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import MyTable from '../../components/common/MyTable';
import SupplierModal from '../Modal/SupplierModal';
import CGDModal from './CGDModal';
import PublicService from '../../services/PublicService';
import Template from '../Template';
import Util from '../../utils/Util';

let f1, myForm;
const BuyerReceipt = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [supplierList, setSupplierList] = useState([]);

  let [modalType, setModalType] = useState();

  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [CGDModalShow, setCGDModalShow] = useState(false); // 采购单

  let [selectedSupplier, setSelectedSupplier] = useState({});
  let [receiptList, setReceiptList] = useState([]);

  let [receiptTotal, setReceiptTotal] = useState({});

  useEffect(() => {
    request({ url: '/api/supplier/list', method: 'GET', params: { page: 1, pageSize: 100000, status: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              label: item.name,
              value: item.id,
            })
          })
          setSupplierList(list);
        }
      })
  }, [])

  const getDetail = (id) => {
    request({ url: `/api/caigouReceipt/info?id=${id}` })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
          if (res.list) {
            res.list.map(item => {
              item.id = item.billId;
              item.billDate = item.operated_at;
              item.snSelf = item.bill_sn;
              item.payed = item.pay_status;
              item.amount = item.amount / 100;
              if(item.bill_sn.indexOf('CGT') > -1) { // 采购退货单显示负数
                item.billAmount = 0 - item.billAmount;
              } else {
                item.billAmount = item.billAmount;
              }
            })
            setReceiptList(res.list);
          }
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    getDetail(record.id);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const getModalType = (type) => {
    setModalType(type);
  }

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setSelectedSupplier({});
    setReceiptList([]);
  }

  const handleSearchData = (val) => {
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    return val;
  }

  // 处理表格排序数据
  const handleSorter = (sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { operated_at: 1, receipt_sn: 2, total_amount: 3 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  let handleSaveData = (val) => {
    if (!receiptList.length) {
      message.warning(`请选择采购单据`);
      return false;
    }
    let rules = { amount: '本次开票金额' };
    for (let i = 0; i < receiptList.length; i++) {
      for (let key in rules) {
        if (!receiptList[i][key] && receiptList[i][key] != 0) {
          message.error(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }

    if (val.supplierName) {
      val.supplierId = selectedSupplier.id;
    }
    val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD');
    val.totalAmount = Util.toFixed0(val.totalAmount * 100);

    let list = [...receiptList], newList = [];
    list.map(item => {
      newList.push({
        billId: item.id,
        billSn: item.snSelf,
        amount: Util.toFixed0(item.amount * 100),
      })
    })
    val.caigouReceiptDetailList = newList;
    return val;
  }

  let onOtherModalShow = (setType, type) => {
    if(type == 'CGDModalShow' && !selectedSupplier.id) {
      return message.warning('请先选择供应商！');
    }
    setType(true);
  }

  // 选择供应商
  const onSelectedSupplier = (item) => {
    setSelectedSupplier(item);
    myForm && myForm.props.form.setFieldsValue({
      supplierName: item.name
    })
  }

  const onOrderSelected = (list) => {
    let cList = [...receiptList];
    cList.push(...list);
    cList.map((item, index) => {
      item.key = index;
      item.billDate = item.operated_at;
      item.snSelf = item.sn_self;
      if(item.snSelf.indexOf('CGT') > -1) {
        item.billAmount = 0 - item.gouhuo_fee;
      } else {
        item.billAmount = item.gouhuo_fee;
      }
    })
    setReceiptList(cList);
  }

  useEffect(() => {
    let obj = {
      snSelf: '合计：',
      amount: 0,
      type: 'total',
      key: 'total',
    };

    receiptList.map(item => {
      obj.amount += item.amount * 1 || 0;
    })

    myForm &&
    myForm.props.form.setFieldsValue({
      totalAmount: obj.amount
    })

    setReceiptTotal(obj);
  }, [receiptList])

  let onDeleteItem = (index) => {
    let list = [...receiptList];
    list.splice(index, 1);
    setReceiptList(list);
  }

  let onInputNumChange = (index, record, type, val) => {
    if ((type == 'amount') && !(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(Math.abs(val)))) {
      // 最多保留2位小数
      return message.warning('最多保留2位小数！');
    }

    if ((type == 'amount') && Math.abs(val * 100) > Math.abs(record.billAmount)) {
      val = record.billAmount / 100;
      message.warning('开票金额不能大于订单金额！');
    }

    let list = [...receiptList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
      }
    })
    setReceiptList(list);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '供应商',
      paramName: 'supplierId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
      },
    }, {
      type: 'input',
      label: '关键字查询',
      paramName: 'search',
      placeholder: '请输入供应商名称或备注关键字'
    },
  ];

  let columns = [
    { title: '开票日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '发票编号', dataIndex: 'receipt_sn', align: 'center', width: 140/*, sorter: true*/ },
    { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 100 },
    {
      title: '开票总额',
      dataIndex: 'total_amount',
      align: 'center',
      sorter: true,
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '开票抬头', dataIndex: 'taitou', align: 'center', width: 100 },
    { title: '开票人', dataIndex: 'creator_name', align: 'center', width: 100 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 160 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (text, record) => (
        record.id &&
        <>
          <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
        </>
      )
    },
  ];

  let disabled = modalType == '查看';
  let modalColumns = [
    { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120 },
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120 },
    {
      title: '金额',
      dataIndex: 'billAmount',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    ...(
      disabled &&
      [
        { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 120 },
      ] || []
    ),
    // { title: '税额', dataIndex: 'snSelf', align: 'center', width: 120 },
    {
      title: '付款状态',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text, record) => (
        record.snSelf.indexOf('CGT') > -1 ?
        { 0: '未退款', 1: '部分退款', 2: '已退款' }[text] :
        { 0: '未付款', 1: '部分付款', 2: '已付款' }[text]
      )
    },
    // { title: '价税合计', dataIndex: 'snSelf', align: 'center', width: 120 },
    // {
    //   title: '已开票金额',
    //   dataIndex: 'billAmount',
    //   align: 'center',
    //   width: 120,
    //   render: (text, record) => {
    //     return text ? text / 100 : text;
    //   }
    // },
    // {
    //   title: '未开票金额',
    //   dataIndex: 'a',
    //   align: 'center',
    //   width: 120,
    //   render: (text, record) => {
    //     return (record.billAmount - record.payed) / 100;
    //   }
    // },
    {
      title: <><span style={{ color: 'red' }}>*</span>本次开票金额</>,
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          let obj = {};
          if(record.billAmount > 0) {
            obj.min = 0;
          } else {
            obj.max = 0;
          }
          return <InputNumber value={text} {...obj} onChange={onInputNumChange.bind(this, index, record, 'amount')} disabled={disabled} />
        }
      }
    },
    ...(
      !disabled &&
      [{
        title: '操作',
        dataIndex: 'id',
        align: 'center',
        width: 80,
        render: (text, record, index) => {
          return record.type != 'total' && <a onClick={onDeleteItem.bind(this, index)} style={{ color: 'red' }}>删除</a>
        }
      }] || []
    ),
  ];

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  let modalItems = [
    {
      type: 'select',
      label: '供应商',
      paramName: 'supplierName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.supplierName,
      disabled: true,
      ...(
        modalType == '新增' ? {
          span: 9,
          labelCol: 8,
          wrapperCol: 16,
        } : colConfig
      ),
    },
    ...(
      modalType == '新增' &&
      [{
        type: 'blank',
        label: '',
        content: <div style={{ marginTop: '-12px' }}>
          <Button onClick={onOtherModalShow.bind(this, setSupplierModalShow)}>选择</Button>
        </div>,
        span: 3,
      }] || []
    ), {
      type: 'datePicker',
      label: '开票日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: detail.operatedAt && moment(detail.operatedAt) || moment(),
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '发票编号',
      paramName: 'receiptSn',
      initialValue: detail.receiptSn,
      placeholder: '多张发票用","分隔',
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '发票抬头',
      paramName: 'taitou',
      initialValue: detail.taitou,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '发票总金额',
      paramName: 'totalAmount',
      itemProps: {
        min: -Infinity,
        max: Infinity
      },
      initialValue: detail.totalAmount,
      disabled: true,
      ...colConfig
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 25px 20px' }}>
        {!disabled && <Button onClick={onOtherModalShow.bind(this, setCGDModalShow, 'CGDModalShow')}>+ 选择采购单据</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData([...receiptList, receiptTotal], true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    },
  ];

  let basicParams = {
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD')
  }

  let params = {
    modalWidth: 1000,
    searchItems,
    headerShow: userType == 'caigou',
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    handleSearchData,
    handleSorter,
    getModalFormHanld,
    getModalType,
    modalCancel,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    searchApi: { url: '/api/caigouReceipt/list', params: { ...basicParams } },
    addApi: { url: '/api/caigouReceipt', method: 'POST' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
      {
        supplierModalShow &&
        <SupplierModal
          modalShow={supplierModalShow}
          onSelectedSupplier={onSelectedSupplier}
          modalClose={setSupplierModalShow}
        />
      }

      {/* 采购单 */}
      {
        CGDModalShow &&
        <CGDModal
          modalShow={CGDModalShow}
          params={{
            supplierId: selectedSupplier.id,
            receiptStatus: -3 // 查非全部开票
          }}
          onSelectedRow={onOrderSelected}
          modalClose={setCGDModalShow}
        />
      }
    </div>
  );
}

export default BuyerReceipt;
