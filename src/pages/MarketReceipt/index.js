/**
 * 销售开票
 */

import React, { useEffect, useState } from 'react';
import { message, Button, InputNumber, Divider } from 'antd';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import Template from '../Template';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import XHDModal from './XHDModal';
import GCDModal from './GCDModal';
import Util from '../../utils/Util';

let f1, myForm;
const MarketReceipt = () => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [memberList, setMemberList] = useState([]);

  let [modalType, setModalType] = useState();

  let [orderCategory, setOrderCategory] = useState(1);
  let [GCDCategory, setGCDCategory] = useState();
  let [XHDModalShow, setXHDModalShow] = useState(false); // 销货单
  let [GCDModalShow, setGCDModalShow] = useState(false); // 工程单

  let [receiptList, setReceiptList] = useState([]);
  let [receiptTotal, setReceiptTotal] = useState({});

  let [receiptType, setReceiptType] = useState(1);

  useEffect(() => {
    request({ url: '/api/user/getMembers', method: 'GET', params: { page: 1, pageSize: 100000, status: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              label: item.nick_name,
              value: item.id,
            })
          })
          setMemberList(list);
        }
      })
  }, [])

  const getDetail = (id) => {
    request({ url: `/api/saleReceipt/info?id=${id}` })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
          if (res.data.saleReceiptDetailList) {
            res.data.saleReceiptDetailList.map(item => {
              item.id = item.billId;
              item.snSelf = item.billSn;
              item.payed = item.pay_status;
              item.amount = item.amount / 100;
              item.tax = item.tax / 100;
            })
            setReceiptList(res.data.saleReceiptDetailList);
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
      val.sort = { operated_at: 1, id: 2, total_amount: 3 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  let handleSaveData = (val) => {
    // 财务确认销售开票
    if (modalType == '编辑') {
      let data = {
        id: modalVal.id,
        receiptSn: val.receiptSn,
        operatedAt: moment(val.operatedAt).format('YYYY-MM-DD'),
        shippingSn: val.shippingSn,
        comment: val.comment,
      };
      return data;
    }

    if (!receiptList.length) {
      message.warning(`请选择销货单据`);
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

    val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD');
    val.orderType = orderCategory;
    val.totalAmount = Util.toFixed0(val.totalAmount * 100);
    val.totalTax = Util.toFixed0(val.totalTax * 100);

    let list = [...receiptList], newList = [];
    list.map(item => {
      newList.push({
        billId: item.id || item.oid,
        billSn: item.snSelf,
        amount: Util.toFixed0(item.amount * 100),
        tax: Util.toFixed0(item.tax * 100),
      })
    })
    val.saleReceiptDetailList = newList;
    return val;
  }

  let onOtherModalShow = (setType) => {
    setType(true);
  }

  const onOrderSelected = (list) => {
    let cList = [...receiptList];
    if(orderCategory == 1) {
      cList.push(...list);
      cList.map(item => {
        item.snSelf = item.om.ordersn;
        item.billDate = item.om.ctime;
        item.billAmount = item.total;
      })
    } else {
      cList = list;
      cList.map(item => {
        item.snSelf = item.self_sn;
        item.billAmount = item.contract_fee;
        item.time = item.started_at + '~' + item.ended_at;
      })
    }
    // 本条税金默认为订单总额
    list.map(item => {
      item.amount = item.billAmount / 100 || 0;
      // item.tax = (item.amount * 0.1).toFixed(2) * 1;
      // item.tax = 0;
      if(orderCategory == 1) {
        item.tax = 0; // 材料类税金 =（本次开票金额-订单金额）* 0.13
      } else {
        item.tax = 0; // 工程类要求按高开11%计算，额度内不计算
      }
    })
    setReceiptList(list);
  }

  useEffect(() => {
    let obj = {
      snSelf: '合计：',
      amount: 0,
      tax: 0,
      type: 'total',
      key: 'total',
    };

    if(receiptList.length) {
      receiptList.map(item => {
        obj.amount += item.amount || 0;
        obj.tax += item.tax * 1 || 0;
      })

      myForm &&
      myForm.props.form.setFieldsValue({
        totalAmount: obj.amount,
        totalTax: obj.tax,
      })
    }

    setReceiptTotal(obj);
  }, [receiptList])

  let onDeleteItem = (index) => {
    let list = [...receiptList];
    list.splice(index, 1);
    setReceiptList(list);
  }

  let onInputNumChange = (index, record, type, val) => {
    if ((type == 'amount') && !(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('最多保留2位小数！');
    }

    if ((type == 'amount') && val * 100 > record.billAmount * 3) {
      val = record.billAmount * 3 / 100;
      message.warning('开票金额不能大于订单金额的三倍！');
    }

    let list = [...receiptList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
        if(type == 'amount') {
          // if(val * 100 <= record.billAmount) {
          //   // item.tax = (val * 0.1).toFixed(2);
          //   item.tax = 0;
          // } else {
          //   // item.tax = (record.billAmount / 100 * 0.1 + (val - record.billAmount / 100) * 0.13).toFixed(2);
          //   if(orderCategory == 1) {
          //     item.tax = ((val - record.billAmount / 100) * 0.13).toFixed(2); // 材料开票13%
          //   } else {
          //     item.tax = ((val - record.billAmount / 100) * 0.11).toFixed(2); // 工程开票11%
          //   }
          // }
          if(orderCategory == 1) {
            if(val > record.billAmount / 100) { // 税金 =（本次开票金额-订单金额）* 0.13
              item.tax = ((val - record.billAmount / 100) * 0.13).toFixed(2);
            } else {
              item.tax = 0;
            }
          } else {
            if(val > record.billAmount / 100) { // 工程类要求按高开11%计算，额度内不计算
              item.tax = ((val - record.billAmount / 100) * 0.11).toFixed(2); // 工程类要求按高开11%计算，额度内不计算
            } else {
              item.tax = 0;
            }
          }
        }
      }
    })
    setReceiptList(list);
  }

  // 发票类型 1:纸质发票 2:电子发票
  let onReceiptTypeChange = (val) => {
    setReceiptType(val);
  }

  // 开票类型 1:材料单 2/3:工程单
  const onOrderCategoryChange = (val) => {
    if(val == 1) {
      setOrderCategory(1);
    } else {
      setOrderCategory(2);
      setGCDCategory(val == 2 ? 1 : 2);
    }
    setReceiptList([]);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    },
    ...(
      userType != 'huiyuan' &&
      [{
        type: 'select',
        label: '会员',
        paramName: 'memberId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true),
          showSearch: true,
        },
      }] || []
    ),
    {
      type: 'select',
      label: '是否确认开票',
      paramName: 'checked',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未开票' },
          { value: 1, label: '已开票' },
        ]
      },
    }, {
      type: 'input',
      label: '关键字查询',
      paramName: 'search',
      placeholder: '请输入会员名称或备注关键字'
    },
  ];

  let columns = [
    { title: '开票日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '单据id', dataIndex: 'id', align: 'center', width: 120, sorter: true },
    { title: '发票号', dataIndex: 'receipt_sn', align: 'center', width: 140 },
    { title: '会员名', dataIndex: 'member_name', align: 'center', width: 100 },
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
    {
      title: '税金',
      dataIndex: 'total_tax',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '开票抬头', dataIndex: 'taitou', align: 'center', width: 100 },
    {
      title: '是否确认开票',
      dataIndex: 'checked',
      align: 'center',
      width: 140,
      render: (text) => (
        {0: '未开票', 1: '已开票'}[text]
      )
    },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 160 },
    {
      title: '操作',
      dataIndex: 'handle',
      align: 'center',
      width: 100,
      render: (text, record) => (
        record.id &&
        <>
          <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
          {
            (userType == 'caiwu' || userType == 'caiwu_cn') &&
            <>
              <Divider type='vertical'/>
            <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
            </>
          }
        </>
      )
    },
  ];

  let disabled = modalType == '查看' || userType != 'huiyuan';
  let modalColumns = [
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120 },
    // ...(
    //   disabled &&
    //   [
    //     { title: '源单id', dataIndex: 'id', align: 'center', width: 120 },
    //   ] || []
    // ),
    ...(
      !disabled && orderCategory == 1 &&
      [
        { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120 },
        {
          title: '单据金额',
          dataIndex: 'billAmount',
          align: 'center',
          width: 120,
          render: (text) => (
            text ? (text / 100).toFixed(2) : text
          )
        },
      ] || []
    ),
    ...(
      !disabled && orderCategory == 2 &&
      [
        { title: '项目名称', dataIndex: 'proj_name', align: 'center', width: 120 },
        { title: '合同起止时间', dataIndex: 'time', align: 'center', width: 120 },
        {
          title: '单据金额',
          dataIndex: 'billAmount',
          align: 'center',
          width: 120,
          render: (text) => (
            text ? (text / 100).toFixed(2) : text
          )
        },
      ] || []
    ),
    {
      title: <><span style={{ color: 'red' }}>*</span>本次开票金额</>,
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, record, 'amount')} disabled={disabled} />
        }
      }
    },
    {
      title: '本条税金',
      dataIndex: 'tax',
      align: 'center',
      width: 120,
      render: (text) => {
        return text;
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
      type: 'input',
      label: '开票抬头',
      paramName: 'taitou',
      initialValue: detail.taitou,
      rules: [{ ...config.reg.required }],
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '税务号',
      paramName: 'tax',
      initialValue: detail.tax,
      rules: [{ ...config.reg.required }],
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '公司地址',
      paramName: 'firmAddr',
      initialValue: detail.firmAddr,
      rules: [{ ...config.reg.required }],
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '发票邮寄地址',
      paramName: 'shippingAddr',
      initialValue: detail.shippingAddr,
      rules: [receiptType == 1 ? { ...config.reg.required } : {}],
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '发票类型',
      paramName: 'receiptE',
      itemProps: {
        options: [
          { value: 1, label: '增值税专用发票' },
          { value: 2, label: '增值税普通发票' },
        ],
        onChange: onReceiptTypeChange
      },
      initialValue: detail.receiptE || receiptType,
      rules: [{ ...config.reg.required }],
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '联系电话',
      paramName: 'receiptMobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.receiptMobile,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '电子邮箱',
      paramName: 'receiptMail',
      rules: [{ ...config.reg.email }, receiptType == 2 ? { ...config.reg.required } : {}],
      initialValue: detail.receiptMail,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '开户行',
      paramName: 'bankName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.bankName,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '银行账号',
      paramName: 'bankNumber',
      rules: [{ ...config.reg.required }],
      initialValue: detail.bankNumber,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '开票种类',
      paramName: 'category',
      itemProps: {
        options: [
          { value: 1, label: '材料' },
          { value: 2, label: '工程施工' },
          { value: 3, label: '维保' },
        ],
        onChange: onOrderCategoryChange
      },
      initialValue: detail.category || 1,
      rules: [{ ...config.reg.required }],
      disabled,
      ...colConfig
    },
    // {
    //   type: 'select',
    //   label: '源单类型',
    //   paramName: 'orderType',
    //   itemProps: {
    //     options: [
    //       { value: 1, label: '材料订单' },
    //       { value: 2, label: '工程订单' },
    //     ],
    //   },
    //   initialValue: detail.orderType || 1,
    //   rules: [{ ...config.reg.required }],
    //   disabled,
    //   ...colConfig
    // },
    {
      type: 'number',
      label: '发票总金额',
      paramName: 'totalAmount',
      initialValue: detail.totalAmount,
      disabled: true,
      ...colConfig
    }, {
      type: 'number',
      label: '税金总额',
      paramName: 'totalTax',
      initialValue: detail.totalTax,
      disabled: true,
      ...colConfig
    },
    ...(
      (userType == 'caiwu' || userType == 'caiwu_cn' || detail.checked) &&
      [
        {
          type: 'blank',
          content: '',
          span: 24,
        }, {
          type: 'datePicker',
          label: '开票日期',
          paramName: 'operatedAt',
          rules: [{ ...config.reg.required }],
          initialValue: detail.operatedAt && moment(detail.operatedAt) || null,
          disabled: userType != 'caiwu',
          ...colConfig
        }, {
          type: 'input',
          label: '发票号',
          paramName: 'receiptSn',
          rules: [{ ...config.reg.required }],
          initialValue: detail.receiptSn,
          disabled: userType != 'caiwu' && userType != 'caiwu_cn',
          ...colConfig
        }, {
          type: 'input',
          label: '快递编号',
          paramName: 'shippingSn',
          initialValue: detail.shippingSn,
          disabled: userType != 'caiwu' && userType != 'caiwu_cn',
          ...colConfig
        }, {
          type: 'textArea',
          label: '备注',
          paramName: 'comment',
          initialValue: detail.comment,
          disabled: userType != 'caiwu' && userType != 'caiwu_cn',
          span: 24,
          labelCol: 3,
          wrapperCol: 21,
        }
      ] || []
    ),
    {
      type: 'blank',
      content: <div style={{ padding: '10px 0 25px 20px' }}>
        {!disabled && <Button onClick={onOtherModalShow.bind(this, orderCategory == 1 ? setXHDModalShow : setGCDModalShow)}>+ 选择{orderCategory == 1 ? '材料' : '工程'}单据</Button>}<p></p>
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
  if(userType == 'huiyuan') { // 会员只能查看自己的开票记录
    basicParams.memberId = userId;
  }

  let params = {
    modalWidth: 1000,
    searchItems,
    columns,
    modalItems,
    headerShow: userType == 'huiyuan',
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
    searchApi: { url: '/api/saleReceipt/list', params: { ...basicParams } },
    addApi: { url: '/api/saleReceipt/apply', method: 'POST' },
    editApi: { url: '/api/saleReceipt/check', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />

      {/* 销货单(材料订单) */}
      {
        XHDModalShow &&
        <XHDModal
          modalShow={XHDModalShow}
          params={{
            huiyuan_id: userId,
            type: -3, // 所有已支付订单
            receiptStatus: -3 // 查所有能开票
          }}
          onSelectedRow={onOrderSelected}
          modalClose={setXHDModalShow}
        />
      }
      {
        GCDModalShow &&
        <GCDModal
          modalShow={GCDModalShow}
          params={{
            memberId: userType == 'huiyuan' ? userId : undefined,
            category: GCDCategory == 1 ? '2,5': '1,3,4,6,7,8,9,10,11,12,13,14', // 2,5:工程项目托管,维修
            receiptStatus: -3 // 查所有能开票
          }}
          selectType='multiple-choice'
          onSelectedRow={onOrderSelected}
          modalClose={setGCDModalShow}
        />
      }
    </div>
  );
}

export default MarketReceipt;
