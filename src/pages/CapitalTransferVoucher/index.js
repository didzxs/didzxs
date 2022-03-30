/**
 * 资金转账单
 */

import React, { useEffect, useState } from 'react';
import { Icon, Popconfirm, Divider, message, Button, Input, InputNumber, Select } from 'antd';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import Template from '../Template';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Util from '../../utils/Util';

let f1;
const CapitalTransferVoucher = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [accountList, setAccountList] = useState([]);

  let [accountItemList, setAccountItemList] = useState([{}]);

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
          res.data.accountItemList.map(item => {
            item.amount = item.amount / 100;
          })
          setAccountItemList(res.data.accountItemList);
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

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setAccountItemList([{}]);
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
      val.sort = {operated_at: 1, sn_self: 2}[sorter.columnKey];
      val.orderBy = {ascend: 1, descend: 2}[sorter.order];
    }
    return val;
  }

  let handleSaveData = (val) => {
    if (!accountItemList.length) {
      message.warning('至少保存一条有效分录数据！');
      return false;
    }

    let rules = {outAccountId: '转出账户', inAccountId: '转入账户', amount: '金额'};
    for(let i = 0; i < accountItemList.length; i++) {
      for(let key in rules) {
        if(!accountItemList[i][key] && accountItemList[i][key] != 0) {
          message.error(key == 'amount' ? '请填写金额' : `请选择${rules[key]}`);
          return false;
        }
      }
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }
    val.type = 3; // 资金转账单
    val.operatedAt && (val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD'));

    val.totalAmount = 0;

    let list = [...accountItemList];
    list.map(item => {
      item.amount && (item.amount = Util.toFixed0(item.amount * 100));
      val.totalAmount += item.amount;
      accountList.map(account => {
        if(account.value == item.outAccountId) {
          item.outAccountName = account.label;
        }
        if(account.value == item.inAccountId) {
          item.inAccountName = account.label;
        }
      })

      delete item.key;
      delete item.num;
    })
    val.accountItemList = list;

    return val;
  }

  let onAddItem = () => {
    let list = [...accountItemList];
    list.push({});
    setAccountItemList(list);
  }

  let onDeleteItem = (index) => {
    let list = [...accountItemList];
    if(list.length == 1) {
      return message.warning('至少保存一条有效分录数据！');
    }
    list.splice(index, 1);
    setAccountItemList(list);
  }

  let onSelectChange = (index, type, val) => {
    let list = [...accountItemList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
      }
    })
    setAccountItemList(list);
  }

  let onInputNumChange = (index, type, val) => {
    if((type == 'amount') && !(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(val))) {
      // 最多保留2位小数
      message.warning('最多保留2位小数！');
      return;
    }

    let list = [...accountItemList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
      }
    })
    setAccountItemList(list);
  }

  let onInputChange = (index, type, e) => {
    let list = [...accountItemList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = e.target.value;
      }
    })
    setAccountItemList(list);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
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
    }, {
      type: 'select',
      label: '收款账户',
      paramName: 'inAccountId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(accountList, 'value', 'label', true, true),
      },
    }, {
      type: 'select',
      label: '付款账户',
      paramName: 'outAccountId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(accountList, 'value', 'label', true, true)
      },
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
      title: '转出账户',
      dataIndex: 'out_account',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        let arr = record.items.split(',');
        let outAccounts = [];
        arr.map(item => {
          let a = item.split('|');
          outAccounts.push(a[1]);
        })

        return <>
          {
            outAccounts.map((item, index) => (
              <div key={index} title={item} style={columnStyle}>{item}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '转入账户',
      dataIndex: 'in_account',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        let arr = record.items.split(',');
        let outAccounts = [];
        arr.map(item => {
          let a = item.split('|');
          outAccounts.push(a[0]);
        })

        return <>
          {
            outAccounts.map((item, index) => (
              <div key={index} title={item} style={columnStyle}>{item}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '金额',
      dataIndex: 'amount',
      align: 'center',
      width: 100,
      render: (text, record, index) => {
        let arr = record.items.split(',');
        let outAccounts = [];
        arr.map(item => {
          let a = item.split('|');
          outAccounts.push(a[2]);
        })

        return <>
          {
            outAccounts.map((item, index) => (
              <div key={index} style={{...columnStyle, width: '80px'}}>{item / 100}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '合计金额',
      dataIndex: 'total_amount',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '制单人', dataIndex: 'creator_name', align: 'center', width: 120 },
    { title: '审核人', dataIndex: 'checker_name', align: 'center', width: 120 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 220 },
    { title: '打印次数', dataIndex: 'comment21', align: 'center', width: 100 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
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
    {
      title: <><span style={{ color: 'red' }}>*</span>转出账户</>,
      dataIndex: 'outAccountId',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <Select value={text} onChange={onSelectChange.bind(this, index, 'outAccountId')} disabled={disabled} showSearch>
          {
            accountList.map(item => (
              <Select.Option value={item.value} key={item.value} disabled={item.disabled}>{item.label}</Select.Option>
            ))
          }
        </Select>
      )
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>转入账户</>,
      dataIndex: 'inAccountId',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <Select value={text} onChange={onSelectChange.bind(this, index, 'inAccountId')} disabled={disabled}>
          {
            accountList.map(item => (
              <Select.Option value={item.value} key={item.value} disabled={item.disabled}>{item.label}</Select.Option>
            ))
          }
        </Select>
      )
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>金额</>,
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'amount')} disabled={disabled} />
      )
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
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index, 'comment')} disabled={disabled} />
      )
    },
    ...(
      !disabled &&
      [{
        title: '操作',
        dataIndex: 'id',
        align: 'center',
        width: 100,
        render: (text, record, index) => (
          <a style={{color: 'red'}} onClick={onDeleteItem.bind(this, index)}>删除</a>
        )
      }] || []
    ),
  ];

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  let modalItems = [
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
          dataSource={PublicService.transformArrayData(accountItemList, true, true)}
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
    startTime: moment().format('YYYY-MM-01'),
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
    modalCancel,
    tableProps: {
      scroll: {x: 'max-content'}
    },
    modalBtnList,
    modalProps,
    searchApi: { url: '/api/accountF/listZZ', params: { ...basicParams } },
    addApi: { url: '/api/accountF/', method: 'POST' },
    editApi: { url: '/api/accountF/', method: 'PUT' },
    exportApi: { url: '/api/accountF/exportZZ', params: { ...basicParams } }
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default CapitalTransferVoucher;
