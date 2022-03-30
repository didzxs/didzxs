/**
 * 计量单位
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Template from '../Template';

let myForm, f1;
const UnitOfMeasurement = () => {
  
  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});
  let [unitType, setUnitType] = useState(1);
  let [basicUnit, setBasicUnit] = useState();
  let [otherUnit, setOtherUnit] = useState();
  let [ratio, setRatio] = useState();

  const getDetail = (id) => {
    request({url: `/api/unit/info?id=${id}`, method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);
          setUnitType(res.data.type);
          setBasicUnit(res.data.basicUnit);
          setOtherUnit(res.data.otherUnit);
          setRatio(res.data.ratio);
        }
      })
  }

  const onDelete = (id) => {
    request({url: `/api/unit/${id}`, method: 'DELETE'})
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
    setBasicUnit();
    setOtherUnit();
    setRatio();
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }
    return val;
  }

  const onTypeChange = (val) => {
    setUnitType(val);
  }

  useEffect(() => {
    if(basicUnit || otherUnit || ratio) {
      myForm &&
      myForm.props.form.setFieldsValue({
        name: `${basicUnit}(${ratio && ratio || ''}${otherUnit && otherUnit || ''})`
      })
    }
  }, [basicUnit, otherUnit, ratio])

  const onInputChange = (type, setType, e) => {
    if(type == 'ratio') {
      setType(e);
    } else {
      setType(e.target.value);
    }
  }

  let searchItems = [
    {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '启用' },
          { value: 0, label: '禁用' },
        ]
      },
      initialValue: 1
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 40 },
    { title: '计量单位名称', dataIndex: 'name', align: 'center', width: 100 },
    { title: '基本单位', dataIndex: 'basic_unit', align: 'center', width: 100 },
    { title: '副单位', dataIndex: 'other_unit', align: 'center', width: 100 },
    { title: '比例', dataIndex: 'ratio', align: 'center', width: 100 },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 100,
      render: (text) => (
        {1: '单计量单位', 2: '多计量单位'}[text]
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
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

  let modalItems = [
    {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '单计量单位' },
          { value: 2, label: '多计量单位' },
        ],
        onChange: onTypeChange
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.type || unitType,
      ...colConfig
    }, {
      type: 'input',
      label: '计量单位名称',
      paramName: 'name',
      rules: [{ ...config.reg.required }],
      initialValue: detail.name,
      disabled: unitType == 2,
      labelCol: 7,
      wrapperCol: 17,
    }, 
    ...(
      unitType == 2 &&
      [{
        type: 'input',
        label: '基本单位',
        paramName: 'basicUnit',
        itemProps: {
          onChange: onInputChange.bind(this, 'basicUnit', setBasicUnit)
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.basicUnit,
        ...colConfig
      }, {
        type: 'input',
        label: '副单位',
        paramName: 'otherUnit',
        itemProps: {
          onChange: onInputChange.bind(this, 'otherUnit', setOtherUnit)
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.otherUnit,
        ...colConfig
      }, {
        type: 'number',
        label: '比例',
        paramName: 'ratio',
        itemProps: {
          onChange: onInputChange.bind(this, 'ratio', setRatio)
        },
        rules: [{ ...config.reg.required }, { ...config.reg.positiveInteger }],
        placeholder: '请输入比例(基本单位:副单位=1:x)',
        initialValue: detail.ratio,
        ...colConfig
      }] || []
    ),
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
          ...colConfig
        }
      ] || []
    )
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/unit/list' },
    addApi: { url: '/api/unit', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/unit', method: 'PUT' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default UnitOfMeasurement;