/**
 * 客户留言
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Template from '../Template';

let f1;
const CustomerMessage = () => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});

  let [positionList, setPositionList] = useState([]);

  useEffect(() => {
    request({url: '/api/open/listPosition', method: 'GET', params: {page: 1, pageSize: 100000, status: 1}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.title
            })
          })
          setPositionList(list);
        }
      })
  }, [])

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  let handleSaveData = (val) => {
    let data = {};
    if (modalVal.id) {
      data.id = modalVal.id;
    }
    data.status = val.status;
    data.reply = val.reply;

    return data;
  }

  let searchItems = [
    {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '已沟通' },
          { value: 0, label: '待沟通' },
        ]
      },
      initialValue: 0,
    },
    ...(
      userType == 'hr' &&
      [{
        type: 'select',
        label: '职位',
        paramName: 'pid',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(positionList, 'value', 'label', true, true)
        },
      }] || []
    ),
  ];

  let typeName = userType == 'hr' ? '应聘者' : '客户';
  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: `${typeName}姓名`, dataIndex: 'username', align: 'center', width: 100 },
    { title: `${typeName}邮箱`, dataIndex: 'email', align: 'center', width: 110 },
    { title: '联系电话', dataIndex: 'contact', align: 'center', width: 100 },
    { title: userType == 'hr' ? '应聘者留言' : '客户留言', dataIndex: 'content', align: 'center', width: 280 },
    {
      title: '留言时间',
      dataIndex: 'created_at',
      align: 'center',
      width: 120,
      render: (text) => (
        moment(text).format('YYYY-MM-DD HH:mm')
      )
    },
    { title: `${userType == 'hr' ? '人事' : '客服'}备注`, dataIndex: 'reply', align: 'center', width: 280 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 90,
      render: (text, record) => (
        <>
          {
            (userType == 'admin' || userType.indexOf('kefu') > -1 || userType == 'hr') ?
            <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a> :
            <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
          }
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
      label: '客户姓名',
      paramName: 'username',
      disabled: true,
      initialValue: modalVal.username,
      ...colConfig
    }, {
      type: 'input',
      label: '客户邮箱',
      paramName: 'email',
      disabled: true,
      initialValue: modalVal.email,
      ...colConfig
    }, {
      type: 'input',
      label: '联系电话',
      paramName: 'contact',
      disabled: true,
      initialValue: modalVal.contact,
      ...colConfig
    }, {
      type: 'textArea',
      label: '客户留言',
      paramName: 'content',
      disabled: true,
      initialValue: modalVal.content,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'radio',
      label: '沟通状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 0, label: '未沟通' },
          { value: 1, label: '已沟通' },
        ]
      },
      initialValue: modalVal.status,
      ...colConfig
    }, {
      type: 'textArea',
      label: `${userType == 'hr' ? '人事' : '客服'}留言`,
      paramName: 'reply',
      initialValue: modalVal.reply,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    },
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    headerShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    searchApi: { url: '/api/message/getMessages', params: { status: 0 } },
    editApi: { url: '/api/message/update', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default CustomerMessage;