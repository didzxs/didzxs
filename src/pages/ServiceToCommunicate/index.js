/**
 * 客服待沟通列表
 */

import React, { useState, useEffect } from 'react';
import Template from '../Template';
import moment from 'moment';
import request from '../../utils/request';

let f1;
const ServiceToCommunicate = () => {

  let [kefuList, setKefuList] = useState([]);

  let [modalVal, setModalVal] = useState({});

  useEffect(() => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: 4 }})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setKefuList(list);
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
    data.kefuId = val.kefuId;

    return data;
  }

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '客户姓名', dataIndex: 'username', align: 'center', width: 80 },
    { title: '客户邮箱', dataIndex: 'email', align: 'center', width: 120 },
    { title: '联系电话', dataIndex: 'contact', align: 'center', width: 120 },
    { title: '客户留言', dataIndex: 'content', align: 'center', width: 260 },
    {
      title: '留言时间',
      dataIndex: 'created_at',
      align: 'center',
      width: 120,
      render: (text) => (
        moment(text).format('YYYY-MM-DD HH:mm')
      )
    },
    {
      title: '留言类型',
      dataIndex: 'pid',
      align: 'center',
      width: 120,
      render: (text) => text ? '应聘留言' : '客户留言'
    },
    {
      title: '是否分配给会员',
      dataIndex: 'handler',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? '已分配' : '未分配'
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 90,
      render: (text, record) => (
        <>
          {
            record.pid ?
            <a onClick={onModalShow.bind(this, "查看", record)}>查看</a> :
            <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
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
      type: 'select',
      label: '分配给客服',
      paramName: 'kefuId',
      itemProps: {
        options: kefuList
      },
      initialValue: modalVal.handler,
      ...colConfig
    },
  ];

  let params = {
    columns,
    modalItems,
    headerShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    filterShow: false,
    handleSaveData: handleSaveData,
    searchApi: { url: '/api/message/getMessages', params: { status: 0 } },
    editApi: { url: '/api/message/assignKefu', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default ServiceToCommunicate;