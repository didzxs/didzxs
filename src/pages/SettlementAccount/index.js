/**
 * 结算账户
 */
import React, { useState } from 'react';
import { Icon, Popconfirm, Divider, message } from 'antd';
import config from '../../config';
import request from '../../utils/request';
import Template from '../Template';

let f1, myForm;
const SettlementAccount = () => {
  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();

  // 期初审核
  const onAudit = (id) => {
    request({url: '/api/account/beginCheck', method: 'POST', form: {id}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('审核成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onDelete = (id) => {
    request({url: `/api/account/${id}`, method: 'DELETE'})
      .then(res => {
        if(res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const modalCancel = () => {
    setModalVal({});
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const getModalType = (type) => {
    setModalType(type);
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }
    val.initialAmount && (val.initialAmount = (val.initialAmount * 100).toFixed(0));
    val.currentAmount && (val.currentAmount = (val.currentAmount * 100).toFixed(0));
    // 期初审核过后修改不能再传
    if (modalVal.beginCheck) {
      delete val.initialAmount;
      delete val.currentAmount;
    }

    return val;
  }

  const onAmountChange = (val) => {
    myForm && myForm.props.form.setFieldsValue({
      currentAmount: val
    })
  }

  let searchItems = [
    {
      type: 'input',
      label: '账户名称',
      paramName: 'searchName',
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '启动' },
          { value: 0, label: '禁用' },
        ]
      },
    }, {
      type: 'select',
      label: '审核状态',
      paramName: 'beginCheck',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未审核' },
          { value: 1, label: '已审核' },
        ]
      },
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '账户名称', dataIndex: 'name', align: 'center', width: 100 },
    {
      title: '期初金额',
      dataIndex: 'initialAmount',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '当前余额',
      dataIndex: 'currentAmount',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 200 },
    {
      title: '是否为默认账户',
      dataIndex: 'isDefault',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '否', 1: '是'}[text]
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          <Divider type='vertical'/>
          {
            record.beginCheck ?
            '已审核' :
            <Popconfirm
              title="是否审核这条数据?"
              onConfirm={onAudit.bind(this, text)}
              icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}>
              <a>审核</a>
            </Popconfirm>
          }
          <Divider type='vertical'/>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  let modalItems = [
    {
      type: 'input',
      label: '账户名称',
      paramName: 'name',
      rules: [{ ...config.reg.required }],
      initialValue: modalVal.name,
      ...colConfig
    }, {
      type: 'number',
      label: '期初金额',
      paramName: 'initialAmount',
      itemProps: {
        formatter: value => `${value}元`,
        onChange: onAmountChange
      },
      initialValue: modalVal.initialAmount ? modalVal.initialAmount / 100 : modalVal.initialAmount,
      disabled: !!modalVal.beginCheck,
      ...colConfig
    }, {
      type: 'number',
      label: '当前余额',
      paramName: 'currentAmount',
      itemProps: {
        formatter: value => `${value}元`,
        min: -Infinity
      },
      initialValue: modalVal.currentAmount ? modalVal.currentAmount / 100 : modalVal.currentAmount,
      disabled: true,
      ...colConfig
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: modalVal.comment,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'radio',
      label: '是否设置为默认',
      paramName: 'isDefault',
      itemProps: {
        options: [
          { value: 0, label: '不为默认' },
          { value: 1, label: '设置为默认' },
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: modalVal.isDefault,
      labelCol: 7,
      wrapperCol: 17
    },
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    getModalType,
    modalCancel,
    getModalFormHanld,
    handleSaveData: handleSaveData,
    searchApi: { url: '/api/account/list' },
    addApi: { url: '/api/account', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/account', method: 'PUT' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default SettlementAccount;
