/**
 * 供应商管理
 */

import React, { useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Util from '../../utils/Util';
import Template from '../Template';

let myForm, f1;
const SupplierManagement = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});

  const getDetail = (id) => {
    request({ url: `/api/supplier/info?id=${id}`, method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
        }
      })
  }

  // 财务审核期初
  const onAudit = (id) => {
    request({url: '/api/supplier/beginCheck', method: 'POST', form: {id}})
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
    request({ url: `/api/supplier/${id}`, method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
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
    getDetail(record.id);
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
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }
    val.beginNeedPay = Util.toFixed0(val.beginNeedPay * 100);
    val.allNeedPay = Util.toFixed0(val.allNeedPay * 100);

    // 期初审核过后修改不能再传
    if (modalVal.begin_check) {
      delete val.beginNeedPay;
      delete val.allNeedPay;
    }
    return val;
  }

  let searchItems = [
    {
      type: 'input',
      label: '供应商名称',
      paramName: 'searchName',
    }, {
      type: 'input',
      label: '联系人姓名',
      paramName: 'searchContactName',
    }, {
      type: 'input',
      label: '联系人电话',
      paramName: 'searchContactMobile',
    }, {
      type: 'select',
      label: '启用状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '启用' },
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
          { value: 1, label: '已审核' },
          { value: 0, label: '未审核' },
        ]
      },
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 40 },
    { title: '供应商名称', dataIndex: 'name', align: 'center', width: 100 },
    { title: '联系人姓名', dataIndex: 'contact_name', align: 'center', width: 100 },
    { title: '联系人手机号', dataIndex: 'contact_mobile', align: 'center', width: 120 },
    { title: '邮箱', dataIndex: 'email', align: 'center', width: 120 },
    { title: '联系地址', dataIndex: 'address', align: 'center', width: 120 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 150 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          {
            userType == 'caiwu' && record.begin_check ?
            <a onClick={onModalShow.bind(this, "查看", record)}>查看</a> :
            <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          }
          {
            userType == 'caiwu' &&
            <>
              <Divider type='vertical' />
              {
                record.begin_check ?
                '已审核'
                :
                <Popconfirm
                  title="是否审核该供应商?"
                  onConfirm={onAudit.bind(this, text)}
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                  <a>审核</a>
                </Popconfirm>
              }
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

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  let disabled = userType == 'caiwu'; // 财务只能编辑期初应付
  let modalItems = [
    {
      type: 'input',
      label: '供应商名称',
      paramName: 'name',
      rules: [{ ...config.reg.required }],
      initialValue: detail.name,
      disabled,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'input',
      label: '联系人姓名',
      paramName: 'contactName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.contactName,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '联系人手机号',
      paramName: 'contactMobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.contactMobile,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '邮箱',
      paramName: 'email',
      rules: [{ ...config.reg.email }],
      initialValue: detail.email,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '联系地址',
      paramName: 'address',
      initialValue: detail.address,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }, {
      type: 'number',
      label: '期初应付',
      paramName: 'beginNeedPay',
      itemProps: {
        formatter: value => `${value}元`,
        onChange: (val) => {
          myForm.props.form.setFieldsValue({
            allNeedPay: val
          })
        }
      },
      rules: [{ ...config.reg.required }, { ...config.reg.along2 }],
      initialValue: detail.beginNeedPay && Util.toFixed2(detail.beginNeedPay / 100) || detail.beginNeedPay,
      disabled: modalType != '新增' && (userType != 'caiwu' || userType == 'caiwu' && !!detail.beginCheck),
      ...colConfig
    }, {
      type: 'number',
      label: '累计应付',
      paramName: 'allNeedPay',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.allNeedPay && Util.toFixed2(detail.allNeedPay / 100) || detail.allNeedPay,
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
      wrapperCol: 21,
    },
    ...(
      modalType == '编辑' &&
      [
        {
          type: 'select',
          label: '状态',
          paramName: 'status',
          itemProps: {
            options: [
              { value: 1, label: '启用' },
              { value: 0, label: '禁用' },
            ],
          },
          initialValue: detail.status,
          disabled,
          ...colConfig
        }
      ] || []
    )
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    headerShow: userType == 'admin' || userType == 'caigou',
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/supplier/list' },
    addApi: { url: '/api/supplier', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/supplier', method: 'PUT' },
    exportApi: { url: '/api/supplier/export' },
    importApi: {url: '/api/supplier/import'},
    templateUrl: config.viewImgUrl + '%E9%BC%8E%E6%B3%B0%E4%BE%9B%E5%BA%94%E5%95%86%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xls'
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default SupplierManagement;
