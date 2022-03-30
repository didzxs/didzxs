/**
 * 人才招聘
 */

import React, { useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import Template from '../Template';

let f1;
const TalentRecruitment = () => {

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  const onDelete = (id) => {
    request({ url: '/api/position/delete', method: 'POST', form: { id } })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const getDetail = (id) => {
    request({url: '/api/open/getPosition', method: 'GET', params: {id}})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);

    getDetail(record.id);
  }

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }

    return val;
  }

  let searchItems = [
    {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '已发布' },
          { value: 0, label: '未发布' },
        ]
      },
      initialValue: 1,
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '标题', dataIndex: 'title', align: 'center', width: 100 },
    { title: '岗位描述', dataIndex: 'content', align: 'center', width: 300 },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      align: 'center',
      width: 120,
      render: (text) => (
        moment(text).format('YYYY-MM-DD HH:mm')
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
      type: 'input',
      label: '岗位标题',
      paramName: 'title',
      rules: [{ ...config.reg.required }],
      initialValue: detail.title,
      ...colConfig
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '已发布' },
          { value: 0, label: '未发布' },
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.status,
      ...colConfig
    }, {
      type: 'textArea',
      label: '岗位描述',
      paramName: 'content',
      rules: [{ ...config.reg.required }],
      initialValue: detail.content,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
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
    handleSaveData: handleSaveData,
    modalCancel: modalCancel,
    searchApi: {url: '/api/open/listPosition', params: {status: 1}},
    addApi: { url: '/api/position/add', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/position/update', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default TalentRecruitment;