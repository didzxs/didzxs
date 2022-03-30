/**
 * 核销单
 */

import React, { useEffect, useState } from 'react';
import { Icon, Popconfirm, Divider, message, Button, InputNumber } from 'antd';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import Template from '../Template';
import MyTable from '../../components/common/MyTable';
import SupplierModal from '../Modal/SupplierModal';
import PublicService from '../../services/PublicService';
import SKDModal from './SKDModal';
import FKDModal from './FKDModal';
import XHDModal from '../Receipt/OrderModal';
import CGDModal from '../PaymentOrder/OrderModal';
import Util from '../../utils/Util';

let f1, myForm;
const VerificationSheet = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [memberList, setMemberList] = useState([]);

  let [orderType, setOrderType] = useState(1);

  let [modalType, setModalType] = useState();

  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [SKDModalShow, setSKDModalShow] = useState(false); // 收款单
  let [FKDModalShow, setFKDModalShow] = useState(false); // 付款单
  let [CGDModalShow, setCGDModalShow] = useState(false); // 采购单
  let [XHDModalShow, setXHDModalShow] = useState(false); // 销货单

  let [organId, setOrganId] = useState();
  let [selectedSupplier, setSelectedSupplier] = useState({});
  let [accountVerifyUpList, setAccountVerifyUpList] = useState([]);
  let [accountVerifyDownList, setAccountVerifyDownList] = useState([]);
  let [accountVerifyUpTotal, setAccountVerifyUpTotal] = useState({});
  let [accountVerifyDownTotal, setAccountVerifyDownTotal] = useState({});

  let [sourceListStatus, setSourceListStatus] = useState(1);

  useEffect(() => {
    // 会员
    request({url: '/api/user/getMembers/', method: 'GET', params: {page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
              disabled: !item.begin_check,
            })
          })
          setMemberList(list);
        }
      })
  }, [])

  const getDetail = (id) => {
    request({ url: `/api/accountV/info?id=${id}` })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
          setOrderType(res.data.type);
          setOrganId(res.data.memberId);
          setSelectedSupplier({id: res.data.supplierId});
          setSourceListStatus(res.data.accountVerifyDownList.length ? 1 : 0);
          if (res.data.accountVerifyUpList) {
            res.data.accountVerifyUpList.map(item => {
              item.id = item.billId;
              item.snSelf = item.billSn;
              item.billDate = item.operatedAt;
              item.totalAmount = Util.toFixed2(item.totalAmount / 100);
            })
            setAccountVerifyUpList(res.data.accountVerifyUpList);
          }
          if (res.data.accountVerifyDownList) {
            res.data.accountVerifyDownList.map(item => {
              item.id = item.billId;
              item.snSelf = item.billSn;
              item.billDate = item.operatedAt;
              item.totalAmount = Util.toFixed2(item.totalAmount / 100);
            })
            setAccountVerifyDownList(res.data.accountVerifyDownList);
          }
        }
      })
  }

  const onDelete = (id) => {
    request({ url: `/api/accountV/${id}`, method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 审核/反审核
  const onAudit = (type, id) => {
    request({ url: `/api/accountV/check/${modalVal.id || id}`, method: 'PUT', params: { type } })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          getDetail(modalVal.id);
          f1.onSearch();
        } else {
          message.error(res.msg);
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
    if(type == '新增') {
      setSourceListStatus(1);
    }
  }

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setSelectedSupplier({});
    setAccountVerifyUpList([]);
    setAccountVerifyDownList([]);
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
      val.sort = { operated_at: 1, sn_self: 2, total_amount: 3 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  const handleTableData = (res) => {
    let total = {
      operated_at: '合计：',
      total_amount: res.summary.totalAmount,
      verify_amount: res.summary.verifyAmount,
    };
    res.page.list.push(total);
  }

  let handleSaveData = (val) => {
    if (!accountVerifyUpList.length) {
      message.warning(`请选择${{1: '预收', 2: '预付'}[orderType]}单据`);
      return false;
    }
    if (!accountVerifyDownList.length && sourceListStatus == 1) {
      message.warning(`请选择${{1: '应收', 2: '应付'}[orderType]}单据`);
      return false;
    }

    let upAmount = 0, downAmount = 0;
    accountVerifyUpList.map(item => {
      upAmount += item.totalAmount * 100;
    })
    accountVerifyDownList.map(item => {
      downAmount += item.totalAmount * 100;
    })
    upAmount = Util.toFixed2(upAmount);
    downAmount = Util.toFixed2(downAmount);
    if(upAmount != downAmount && sourceListStatus == 1) {
      message.warning('请确保本次核销金额上下保持一致！');
      return false;
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }

    val.type = orderType; // 1:预收冲应收 2:预付冲应付

    if(val.memberId) {
      memberList.map(item => {
        if(item.value == val.memberId) {
          val.memberName = item.label;
        }
      })
    }
    if(val.supplierName) {
      val.supplierId = selectedSupplier.id;
    }
    val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD');

    val.totalAmount = upAmount;

    let rules = {totalAmount: '本次核销金额'};
    let list = [...accountVerifyUpList], newList = [];
    list.map(item => {
      newList.push({
        billId: item.id,
        billSn: item.snSelf,
        totalAmount: Util.toFixed0(item.totalAmount * 100),
      })
    })
    val.accountVerifyUpList = newList;

    for(let i = 0; i < newList.length; i++) {
      for(let key in rules) {
        if(!newList[i][key] && newList[i][key] != 0) {
          message.error(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    let list1 = [...accountVerifyDownList], newList1 = [];
    list1.map(item => {
      newList1.push({
        billId: item.id,
        billSn: item.snSelf,
        totalAmount: Util.toFixed0(item.totalAmount * 100),
      })
    })
    val.accountVerifyDownList = newList1;
    for(let i = 0; i < newList1.length; i++) {
      for(let key in rules) {
        if(!newList1[i][key] && newList1[i][key] != 0) {
          message.error(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    return val;
  }

  let onOtherModalShow = (setType) => {
    if(typeof setType == 'function') {
      setType(true);
    } else {
      if(setType == 'up') {
        if(orderType == 1) {
          setSKDModalShow(true);
        } else if(orderType == 2) {
          setFKDModalShow(true);
        }
      } else {
        if(orderType == 1) {
          setXHDModalShow(true);
        } else if(orderType == 2) {
          setCGDModalShow(true);
        }
      }
    }
  }

  // 选择供应商
  const onSelectedSupplier = (item) => {
    setSelectedSupplier(item);
    myForm && myForm.props.form.setFieldsValue({
      supplierName: item.name
    })
  }

  const onOrderSelected = (type, list) => {
    let upList = [...accountVerifyUpList], downList = [...accountVerifyDownList];
    // 预收冲应收
    if(orderType == 1) {
      if(type == 'SKD') {
        console.log(list, 6666666);
        list.map(item => {
          item.snSelf = item.sn_self;
          item.billDate = item.operated_at;
          item.billAmount = item.total_amount;
          item.payed = item.verify_amount;
        })
        let newList = upList.concat(list);
        newList.map((item, index) => {
          item.key = index;
        })
        setAccountVerifyUpList(newList);
      } else if(type == 'XHD') {
        console.log(list, 55555);
        let newList = downList.concat(list);
        newList.map((item, index) => {
          item.key = index;
        })
        setAccountVerifyDownList(newList);
      }
    }
    // 预付冲应付
    if(orderType == 2) {
      if(type == 'FKD') {
        list.map(item => {
          item.snSelf = item.sn_self;
          item.billDate = item.operated_at;
          item.billAmount = item.total_amount;
          item.payed = item.verify_amount;
        })
        let newList = upList.concat(list);
        newList.map((item, index) => {
          item.key = index;
        })
        setAccountVerifyUpList(newList);
      } else if(type == 'CGD') {
        let newList = downList.concat(list);
        newList.map((item, index) => {
          item.key = index;
        })
        setAccountVerifyDownList(newList);
      }
    }
  }

  useEffect(() => {
    let obj = {
      snSelf: '合计：',
      billAmount: 0,
      payed: 0,
      totalAmount: 0,
      type: 'total',
      key: 'total',
    };

    let billAmount = 0, payed = 0, totalAmount = 0;
    accountVerifyUpList.map(item => {
      billAmount += item.billAmount * 1;
      payed += item.payed * 1;
      totalAmount += item.totalAmount * 1 || 0;
    })
    obj.billAmount = Util.toFixed2(billAmount);
    obj.payed = Util.toFixed2(payed);
    obj.totalAmount = Util.toFixed2(totalAmount);

    setAccountVerifyUpTotal(obj);
  }, [accountVerifyUpList])

  useEffect(() => {
    let obj = {
      snSelf: '合计：',
      billAmount: 0,
      payed: 0,
      totalAmount: 0,
      type: 'total',
      key: 'total',
    };

    let billAmount = 0, payed = 0, totalAmount = 0;
    accountVerifyDownList.map(item => {
      billAmount += item.billAmount * 1;
      payed += item.payed * 1;
      totalAmount += item.totalAmount * 1 || 0;
    })
    obj.billAmount = Util.toFixed2(billAmount);
    obj.payed = Util.toFixed2(payed);
    obj.totalAmount = Util.toFixed2(totalAmount);

    setAccountVerifyDownTotal(obj);
  }, [accountVerifyDownList])

  let onTypeChange = (val) => {
    setOrderType(val);
    setAccountVerifyUpList([]);
    setAccountVerifyDownList([]);
  }

  let onDeleteItem = (index, type) => {
    let list = [...{up: accountVerifyUpList, down: accountVerifyDownList}[type]];
    list.splice(index, 1);
    if(type == 'up') {
      setAccountVerifyUpList(list);
    } else {
      setAccountVerifyDownList(list);
    }
  }

  let onInputNumChange = (index, listType, type, val) => {
    if ((type == 'totalAmount') && !(/(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0){1}$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('请最多保留2位小数！');
    }

    let list = [...{up: accountVerifyUpList, down: accountVerifyDownList}[listType]];
    list.map((item, i) => {
      if (i == index) {
        console.log((item.billAmount - item.payed) / 100, 666666)
        if(type == 'totalAmount') {
          if(item.billAmount < 0 && val > 0) {
            return message.warning('请填写小于0的数字！');
          }
          if(item.billAmount > 0 && val < 0) {
            return message.warning('请填写大于0的数字！');
          }
          if(Math.abs(val) > Util.toFixed2(Math.abs((item.billAmount - item.payed) / 100))) {
            item[type] = Util.toFixed2((item.billAmount - item.payed) / 100);
            return message.warning('核销金额不能多于未核销金额！');
          }
        }
        item[type] = val;
      }
    })
    if (listType == 'up') {
      setAccountVerifyUpList(list);
    } else {
      setAccountVerifyDownList(list);
    }
  }

  // 已选择客户
  const onOrganChange = (val) => {
    setOrganId(val);
    setAccountVerifyUpList([]);
    setAccountVerifyDownList([]);
  }

  // 有无源单
  const sourceListStatusChange = (e) => {
    setSourceListStatus(e.target.value);

    if(e.target.value == 0) {
      setAccountVerifyDownList([]);
      setAccountVerifyDownTotal({});
    }
  }

  let searchItems = [
    {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '预收冲应收' },
          { value: 2, label: '预付冲应付' },
          // { value: 3, label: '应收冲应付' },
        ]
      },
    }, {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '审核状态',
      paramName: 'checkStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '已审核' },
          { value: 0, label: '未审核' },
        ]
      },
    }, {
      type: 'input',
      label: '关键字查询',
      paramName: 'search',
      placeholder: '请输入单据号或备注关键字'
    },
  ];

  let columnStyle = {
    margin: '0 auto',
    padding: '5px 0',
    borderBottom: '1px solid #e8e8e8',
    width: '100px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }
  let columns = [
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 160, sorter: true },
    {
      title: '业务类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      render: (text) => (
        {1: '预收冲应收', 2: '预付冲应付', 3: '应收冲应付'}[text]
      )
    },
    { title: '客户名称', dataIndex: 'member_name', align: 'center', width: 100 },
    { title: '供应商名称', dataIndex: 'supplier_name', align: 'center', width: 100 },
    {
      title: '核销金额',
      dataIndex: 'total_amount',
      align: 'center',
      width: 100,
      sorter: true,
      render: (text) => (
        text ? Util.toFixed2(text / 100) : text
      )
    },
    { title: '制单人', dataIndex: 'creator_name', align: 'center', width: 100 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (text, record) => (
        record.id &&
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          {
            (userType == 'caiwu' || userType == 'caiwu_cn') &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否审核改数据?"
                onConfirm={onAudit.bind(this, record.check_status == 1 ? 0 : 1, record.id)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>{record.check_status == 1 ? '反审核' : '审核'}</a>
              </Popconfirm>
            </>
          }
          <Divider type='vertical' />
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let disabled = !!detail.checkStatus;
  let modalColumns = [
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120 },
    {
      title: '业务类别',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      render: (text, record) => {
        if(record.snSelf.indexOf('SKD') > -1) {
          return '收款';
        }
        if(record.snSelf.indexOf('FKD') > -1) {
          return '付款';
        }
      }
    },
    { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120 },
    {
      title: '单据金额',
      dataIndex: 'billAmount',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return text ? Util.toFixed2(text / 100) : text;
      }
    },
    {
      title: '已核销金额',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return text ? Util.toFixed2(text / 100) : text;
      }
    },
    {
      title: '未核销金额',
      dataIndex: 'a',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return Util.toFixed2((record.billAmount - record.payed) / 100);
      }
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>本次核销金额</>,
      dataIndex: 'totalAmount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          let obj = {};
          if (record.billAmount < 0) {
            obj.max = 0;
          } else {
            obj.min = 0;
          }
          return <InputNumber value={text} {...obj} onChange={onInputNumChange.bind(this, index, 'up', 'totalAmount')} disabled={disabled} />
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record, index) => {
        return record.type != 'total' && <a onClick={onDeleteItem.bind(this, index, 'up')} style={{ color: 'red' }}>删除</a>
      }
    },
  ];

  let modalColumns1 = [
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120 },
    {
      title: '业务类别',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      render: (text, record) => (
        record.snSelf.indexOf('CGD') > -1 ? '采购' : record.snSelf.indexOf('CGT') > -1 ? '采购退单' : ''
      )
    },
    { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120 },
    {
      title: '单据金额',
      dataIndex: 'billAmount',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return text ? Util.toFixed2(text / 100) : text;
      }
    },
    {
      title: '已核销金额',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return text ? Util.toFixed2(text / 100) : text;
      }
    },
    {
      title: '未核销金额',
      dataIndex: 'a',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return Util.toFixed2((record.billAmount - record.payed) / 100);
      }
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>本次核销金额</>,
      dataIndex: 'totalAmount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          let obj = {};
          if (record.billAmount < 0) {
            obj.max = 0;
          } else {
            obj.min = 0;
          }
          return <InputNumber value={text} {...obj} onChange={onInputNumChange.bind(this, index, 'down', 'totalAmount')} disabled={disabled} />
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record, index) => {
        return record.type != 'total' && <a onClick={onDeleteItem.bind(this, index, 'down')} style={{ color: 'red' }}>删除</a>
      }
    },
  ];


  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  let modalItems = [
    {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '预收冲应收' },
          { value: 2, label: '预付冲应付' },
          // { value: 3, label: '应收冲应付' },
        ],
        onSelect: onTypeChange
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.type || orderType,
      disabled,
      ...colConfig
    },
    ...(
      (orderType == 1 || orderType == 3) &&
      [{
        type: 'select',
        label: '客户',
        paramName: 'memberId',
        itemProps: {
          options: memberList,
          showSearch: true,
          onChange: onOrganChange
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.memberId,
        disabled,
        ...colConfig
      }] || []
    ),
    ...(
      (orderType == 2 || orderType == 3) &&
      [{
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
      )] || []
    ), {
      type: 'datePicker',
      label: '单据日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: detail.operatedAt && moment(detail.operatedAt) || moment(),
      disabled,
      ...colConfig
    }, {
      type: 'radio',
      label: `有无${{1: '应收', 2: '应付', 3: '应付'}[orderType]}源单`,
      paramName: 'sourceListStatus',
      itemProps: {
        options: [
          { value: 0, label: '无源单' },
          { value: 1, label: '有源单' },
        ],
        onChange: sourceListStatusChange
      },
      rules: [{ ...config.reg.required }],
      initialValue: modalType == '新增' || (detail.accountVerifyDownList && detail.accountVerifyDownList.length) ? 1 : 0,
      disabled,
      ...colConfig
    }, {
      type: 'blank',
      content: <div style={{ position: 'relative' }}>
        {detail.checkStatus && <img src={require('../../assets/audit.png')} style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-70%)' }} /> || ''}
      </div>,
      span: 24,
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 25px 20px' }}>
        {!disabled && <Button onClick={() => {
          if(orderType == 1) {
            if(!organId) {
              return message.warning('请先选择客户！');
            }
          } else if(orderType == 2) {
            if(!selectedSupplier.id) {
              return message.warning('请先选择供应商！');
            }
          }
          onOtherModalShow('up')
        }}>+ 选择{{1: '预收', 2: '预付', 3: '应收'}[orderType]}单据</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData([...accountVerifyUpList, accountVerifyUpTotal], true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    },
    ...(
      sourceListStatus == 1 &&
      [{
        type: 'blank',
        content: <div style={{ padding: '10px 0 25px 20px' }}>
          {!disabled && <Button onClick={() => {
            if(orderType == 1) {
              if(!organId) {
                return message.warning('请先选择客户！');
              }
            } else if(orderType == 2) {
              if(!selectedSupplier.id) {
                return message.warning('请先选择供应商！');
              }
            }
            onOtherModalShow('down');
          }}>+ 选择{{1: '应收', 2: '应付', 3: '应付'}[orderType]}单据</Button>}<p></p>
          <MyTable
            heightAuto={true}
            columns={modalColumns1}
            pagination={false}
            dataSource={PublicService.transformArrayData([...accountVerifyDownList, accountVerifyDownTotal], true, true)}
            scroll={{ x: 'max-content' }}
          />
        </div>,
        span: 24,
      }] || []
    ), {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    },
  ];

  // 弹窗按钮
  let modalBtnList = [];
  if (detail.checkStatus == 0) {
    modalBtnList = [{ title: '审核', onClick: onAudit.bind(this, 1), type: 'primary' }];
  } else if (detail.checkStatus == 1) {
    modalBtnList = [{ title: '反审核', onClick: onAudit.bind(this, 2), type: 'primary' }];
  }
  let modalProps = {};
  if (detail.checkStatus) {
    modalProps.saveBtn = false;
  }

  let basicParams = {
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD')
  }

  let params = {
    modalWidth: 1000,
    searchItems,
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    handleSearchData,
    handleSorter,
    getModalFormHanld,
    getModalType,
    modalCancel,
    handleTableData,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    modalBtnList,
    modalProps,
    searchApi: { url: '/api/accountV/list', params: { ...basicParams } },
    addApi: { url: '/api/accountV/', method: 'POST' },
    editApi: { url: '/api/accountV/', method: 'PUT' },
    exportApi: { url: '/api/accountV/export', params: { ...basicParams } }
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
      {/* 收款单 */}
      {
        SKDModalShow &&
        <SKDModal
          modalShow={SKDModalShow}
          params={{
            organId: organId
          }}
          onSelectedRow={onOrderSelected.bind(this, 'SKD')}
          modalClose={setSKDModalShow}
        />
      }
      {/* 付款单 */}
      {
        FKDModalShow &&
        <FKDModal
          modalShow={FKDModalShow}
          params={{
            organId: selectedSupplier.id
          }}
          onSelectedRow={onOrderSelected.bind(this, 'FKD')}
          modalClose={setFKDModalShow}
        />
      }
      {/* 销货单 */}
      {
        XHDModalShow &&
        <XHDModal
          modalShow={XHDModalShow}
          params={{
            memberId: organId
          }}
          onSelectedRow={onOrderSelected.bind(this, 'XHD')}
          modalClose={setXHDModalShow}
        />
      }
      {/* 采购单 */}
      {
        CGDModalShow &&
        <CGDModal
          modalShow={CGDModalShow}
          params={{
            supplierId: selectedSupplier.id
          }}
          onSelectedRow={onOrderSelected.bind(this, 'CGD')}
          modalClose={setCGDModalShow}
        />
      }
    </div>
  );
}

export default VerificationSheet;
