/**
 * 付款单列表
 */

import React, { useEffect, useState } from 'react';
import { Button, Divider, Icon, Input, InputNumber, message, Popconfirm, Select } from 'antd';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import MyTable from '../../components/common/MyTable';
import SupplierModal from '../Modal/SupplierModal';
import OrderModal from './OrderModal';
import PublicService from '../../services/PublicService';
import Util from '../../utils/Util';
import Template from '../Template';
import styles from '../../less/default.less';

let f1, myForm;
const PaymentOrder = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [accountList, setAccountList] = useState([]); // 结算账户列表

  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [orderModalShow, setOrderModalShow] = useState(false);

  let [modalType, setModalType] = useState();

  let [selectedSupplier, setSelectedSupplier] = useState({});
  let [selectedOrder, setSelectedOrder] = useState([]);
  let [accountItemList, setAccountItemList] = useState([{}]);

  let [selectedOrderTotal, setSelectedOrderTotal] = useState({});
  let [accountItemListTotal, setAccountItemListTotal] = useState({});

  useEffect(() => {
    // 账户列表
    request({ url: '/api/account/list', method: 'GET', params: { page: 1, pageSize: 100000, status: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.name,
              disabled: !item.beginCheck,
            })
          })
          setAccountList(list);
        }
      })
  }, [])

  const getDetail = (id) => {
    request({ url: `/api/accountF/info?id=${id}` })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
          setSelectedSupplier({id: res.data.organId});
          res.data.accountItemList.map(item => {
            item.amount = Util.toFixed2(item.amount / 100);
          })
          setAccountItemList(res.data.accountItemList);

          if (res.data.accountDetailList) {
            res.data.accountDetailList.map(item => {
              item.id = item.billId;
              item.snSelf = item.billSn;
              item.billDate = item.operatedAt;
              item.totalAmount = Util.toFixed2(item.totalAmount / 100);
            })
            setSelectedOrder(res.data.accountDetailList);
          }
        }
      })
  }

  const onDelete = (id) => {
    request({ url: `/api/accountF/${id}`, method: 'DELETE' })
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
    request({ url: `/api/accountF/check/${modalVal.id || id}`, method: 'PUT', params: { type } })
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
    setDetail({});
    setSelectedSupplier({});
    setAccountItemList([{}]);
    setSelectedOrder([]);
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
    if(sorter.order) {
      val.sort = {operated_at: 1, sn_self: 2, total_amount: 3, verify_amount: 4}[sorter.columnKey];
      val.orderBy = {ascend: 1, descend: 2}[sorter.order];
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
    // 判断付款金额是否大于核销金额
    let fkSum = 0, hxSum = 0;
    accountItemList.map(item => {
      fkSum += item.amount;
    });
    selectedOrder.map(item => {
      hxSum += item.totalAmount;
    });
    if (fkSum < hxSum) {
      message.warning('付款金额不能小于核销金额！');
      return false;
    }
    let rules = { outAccountId: '结算账户', amount: '付款金额' };
    for (let i = 0; i < accountItemList.length; i++) {
      for (let key in rules) {
        if (!accountItemList[i][key] && accountItemList[i][key] != 0) {
          message.error(key == 'amount' ? '请填写付款金额' : `请选择${rules[key]}`);
          return false;
        }
      }
    }
    let rules1 = { totalAmount: '本次核销金额' };
    for (let i = 0; i < selectedOrder.length; i++) {
      for (let key in rules1) {
        if (!selectedOrder[i][key] && selectedOrder[i][key] != 0) {
          message.error(`请填写${rules1[key]}`);
          return false;
        }
      }
    }

    let list = [...accountItemList];
    list.map(item => {
      item.amount && (item.amount = Util.toFixed0(item.amount * 100));
      accountList.map(account => {
        if (account.value == item.outAccountId) {
          item.outAccountName = account.label;
        }
      });

      delete item.key;
      delete item.num;
    });

    let list1 = [...selectedOrder], newList = [];
    list1.map(item => {
      newList.push({
        billId: item.id,
        billSn: item.snSelf,
        totalAmount: Util.toFixed0(item.totalAmount * 100)
      });
    });
    let data = {
      type: 2,
      organId: selectedSupplier.id || detail.organId,
      operatedAt: val.operatedAt ? moment(val.operatedAt).format('YYYY-MM-DD') : null,
      totalAmount: Util.toFixed0(fkSum * 100),
      accountItemList: list,
      accountDetailList: newList,
      organName: val.organName || ''
    };

    if (modalVal.id) {
      data['id'] = modalVal.id;
    }
    return data;
  };

  let onOtherModalShow = (setType) => {
    setType(true);
  }

  // 选择供应商
  const onSelectedSupplier = (item) => {
    setSelectedSupplier(item);
    setSelectedOrder([]);
    myForm && myForm.props.form.setFieldsValue({
      organName: item.name
    })
  }

  // 选择采购单
  const onSelectedOrder = (list) => {
    let selectedList = [...selectedOrder];
    let newList = selectedList.concat(list);
    newList.map((item, index) => {
      item.key = index;
    })
    setSelectedOrder(newList);
  }

  useEffect(() => {
    let obj = { ...accountItemListTotal };
    obj.outAccountId = '合计：';
    obj.type = 'total';
    obj.key = 'total';

    let amount = 0;
    accountItemList.map(item => {
      amount += item.amount || 0;
    })
    obj.amount = Util.toFixed2(amount);

    setAccountItemListTotal(obj);
  }, [accountItemList])

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
    selectedOrder.map(item => {
      billAmount += item.billAmount * 1;
      payed += item.payed * 1;
      totalAmount += item.totalAmount * 1 || 0;
    })
    obj.billAmount = Util.toFixed2(billAmount);
    obj.payed = Util.toFixed2(payed);
    obj.totalAmount = Util.toFixed2(totalAmount);

    setSelectedOrderTotal(obj);
  }, [selectedOrder])

  let onAddItem = () => {
    let list = [...accountItemList];
    list.push({});
    list.map((item, index) => {
      item.key = index;
    })
    setAccountItemList(list);
  }

  let onDeleteItem = (index, type) => {
    let list = [...{ accountItem: accountItemList, orderItem: selectedOrder }[type]];
    if (type == 'accountItem' && list.length == 1) {
      return message.warning('至少保存一条有效分录数据！');
    }
    list.splice(index, 1);

    if (type == 'accountItem') {
      setAccountItemList(list);
    } else {
      setSelectedOrder(list);
    }
  }

  let onSelectChange = (index, listType, type, val) => {
    let list = [...{ accountItem: accountItemList }[listType]];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
      }
    })
    if (listType == 'accountItem') {
      setAccountItemList(list);
    } else {
      setSelectedOrder(list);
    }
  }
  // 0, 'orderItem', 'totalAmount'
  // 0，'accountItem', 'amount'
  let onInputNumChange = (index, listType, type, val) => {
    if ((type == 'amount' || type == 'totalAmount') && !(/(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0){1}$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('请最多保留2位小数！');
    }
    let list = [...{ accountItem: accountItemList, orderItem: selectedOrder }[listType]];
    if (Array.isArray(list) && list.length > index) {
      let item = list[index];
      if (type == 'totalAmount' && (Math.abs(val) > Util.toFixed2(Math.abs((item.billAmount - item.payed) / 100)))) {
        item[type] = Util.toFixed2((item.billAmount - item.payed) / 100);
        return message.warning('核销金额不能多于未核销金额！');
      }
      item[type] = val;
      list[index] = item;
    }
    // list.map((item, i) => {
    //   if (i == index) {
    //     if (type == 'totalAmount') {
    //       // if (item.billAmount < 0 && val > 0) {
    //       //   return message.warning('请填写小于0的数字！');
    //       // } else if (item.billAmount > 0 && val < 0) {
    //       //   return message.warning('请填写大于0的数字！');
    //       // }
    //       if (Math.abs(val) > Util.toFixed2(Math.abs((item.billAmount - item.payed) / 100))) {
    //         item[type] = Util.toFixed2((item.billAmount - item.payed) / 100);
    //         return message.warning('核销金额不能多于未核销金额！');
    //       }
    //     }
    //     item[type] = val;
    //   }
    // })
    if (listType == 'accountItem') {
      setAccountItemList(list);
    } else {
      setSelectedOrder(list);
    }
  };

  let onInputChange = (index, listType, type, e) => {
    let list = [...{ accountItem: accountItemList }[listType]];
    list.map((item, i) => {
      if (i == index) {
        item[type] = e.target.value;
      }
    })
    if (listType == 'accountItem') {
      setAccountItemList(list);
    } else {
      setSelectedOrder(list);
    }
  }

  let searchItems = [
    {
      type: 'select',
      label: '核销状态',
      paramName: 'verifyStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未核销' },
          { value: 1, label: '部分核销' },
          { value: 2, label: '全部核销' },
          { value: -1, label: '待核销' },
        ]
      },
    }, {
      type: 'rangePicker',
      label: '单据时间',
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
      paramName: 'search'
    }
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
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 150, sorter: true },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 150, sorter: true },
    { title: '供应商', dataIndex: 'organ_name', align: 'center', width: 100 },
    {
      title: '结算账户',
      dataIndex: 'accounts',
      align: 'center',
      width: 120,
      render: (text, record) => {
        let accounts = [];
        if(record.items) {
          let arr = record.items.split(',');
          arr.map(item => {
            let a = item.split('|');
            accounts.push(a[1]);
          })
        }
        return <>
          {
            accounts.map((item, index) => (
              <div key={index} title={item} style={columnStyle}>{item}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '付款金额',
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        let accounts = [];
        if(record.items) {
          let arr = record.items.split(',');
          arr.map(item => {
            let a = item.split('|');
            accounts.push(a[2]);
          })
        }
        return <>
          {
            accounts.map((item, index) => (
              <div key={index} style={{...columnStyle, width: '80px'}}>{item / 100}</div>
            ))
          }
        </>;
      }
    },
    // {
    //   title: '收款方式',
    //   dataIndex: 'currentAmount',
    //   align: 'center',
    //   width: 100,
    //   render: (text) => (
    //     text ? text / 100 : text
    //   )
    // },
    // { title: '结算号', dataIndex: 'comment1', align: 'center', width: 150 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 200 },
    {
      title: '付款合计',
      dataIndex: 'total_amount',
      align: 'center',
      width: 100,
      sorter: true,
      render: (text) => (
        text ? Util.toFixed2(text / 100) : text
      )
    },
    {
      title: '已核销金额',
      dataIndex: 'verify_amount',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? Util.toFixed2(text / 100) : text
      )
    },
    // {
    //   title: '整单折扣',
    //   dataIndex: 'currentAmount3',
    //   align: 'center',
    //   width: 100,
    //   render: (text) => (
    //     text ? text / 100 : text
    //   )
    // },
    // {
    //   title: '本次预付款',
    //   dataIndex: 'currentAmount4',
    //   align: 'center',
    //   width: 100,
    //   render: (text) => (
    //     text ? text / 100 : text
    //   )
    // },
    {
      title: '核销状态',
      dataIndex: 'verify_status',
      align: 'center',
      width: 120,
      render: (text) => {
        const status = { 0: '未核销', 1: '部分核销', 2: '全部核销' };
        const _styles = [
          { backgroundColor: '#52c41a' },
          { backgroundColor: '#faad14' },
          { backgroundColor: '#f5222d' },
        ];
        return (
          <div className={styles['write_off_status']} style={{..._styles[text]}}>{status[text]}</div>
        )
      }
    },
    { title: '制单人', dataIndex: 'creator_name', align: 'center', width: 100 },
    { title: '审核人', dataIndex: 'checker_name', align: 'center', width: 100 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 160,
      render: (text, record) => (
        record.id ?
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
        </> : <></>
      )
    },
  ];

  let disabled = !!detail.checkStatus;
  let modalColumns = [
    {
      title: <><span style={{ color: 'red' }}>*</span>结算账户</>,
      dataIndex: 'outAccountId',
      align: 'center',
      width: 140,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <Select value={text} onChange={onSelectChange.bind(this, index, 'accountItem', 'outAccountId')} disabled={disabled}>
            {
              accountList.map(item => (
                <Select.Option value={item.value} key={item.value} disabled={item.disabled}>{item.label}</Select.Option>
              ))
            }
          </Select>
        }
      }
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>付款金额</>,
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'accountItem', 'amount')} disabled={disabled} style={{ width: '100%' }} />
        }
      }
    },
    // {
    //   title: '结算方式',
    //   dataIndex: 'comment2',
    //   align: 'center',
    //   width: 120,
    //   render: (text, record, index) => (
    //     <Input value={text} onChange={onInputChange.bind(this, index, 'comment')} disabled={disabled} />
    //   )
    // },
    // {
    //   title: '结算号',
    //   dataIndex: 'comment3',
    //   align: 'center',
    //   width: 140,
    //   render: (text, record, index) => (
    //     <Input value={text} onChange={onInputChange.bind(this, index, 'comment')} disabled={disabled} />
    //   )
    // },
    {
      title: '备注',
      dataIndex: 'comment',
      align: 'center',
      width: 140,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <Input value={text} onChange={onInputChange.bind(this, index, 'accountItem', 'comment')} disabled={disabled} />
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record, index) => (
        record.type != 'total' && <a onClick={onDeleteItem.bind(this, index, 'accountItem')} style={{ color: 'red' }}>删除</a>
      )
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
          // if (record.billAmount < 0) {
          //   obj.max = 0;
          // } else {
          //   obj.min = 0;
          // }
          return <InputNumber value={text} {...obj} onChange={onInputNumChange.bind(this, index, 'orderItem', 'totalAmount')} disabled={disabled} />
        }
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record, index) => {
        return record.type != 'total' && <a onClick={onDeleteItem.bind(this, index, 'orderItem')} style={{ color: 'red' }}>删除</a>
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
      label: '供应商',
      paramName: 'organName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.organName,
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
    ),
    {
      type: 'datePicker',
      label: '单据日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: detail.operatedAt && moment(detail.operatedAt) || moment(),
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
        {!disabled && <Button onClick={onAddItem}>+ 新增</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData([...accountItemList, accountItemListTotal], true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 25px 20px' }}>
        {!disabled && <Button onClick={() => {
          if(selectedSupplier.id) {
            onOtherModalShow(setOrderModalShow)
          } else {
            return message.warning('请先选择供应商！');
          }
        }}>+ 选择源单</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns1}
          pagination={false}
          dataSource={PublicService.transformArrayData([...selectedOrder, selectedOrderTotal], true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    }, {
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
    type: 2, // 2:付款单
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
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
    getModalFormHanld,
    getModalType,
    handleSorter,
    handleTableData,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    modalBtnList,
    modalProps,
    searchApi: { url: '/api/accountF/list', params: { ...basicParams } },
    addApi: { url: '/api/accountF/', method: 'POST' },
    editApi: { url: '/api/accountF', method: 'PUT' },
    exportApi: { url: '/api/accountF/export', params: { ...basicParams } }
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
      {
        orderModalShow &&
        <OrderModal
          modalShow={orderModalShow}
          params={{
            supplierId: selectedSupplier.id
          }}
          onSelectedRow={onSelectedOrder}
          modalClose={setOrderModalShow}
        />
      }
    </div>
  );
}

export default PaymentOrder;
