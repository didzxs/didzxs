/**
 * 用户列表
 */

import React, { useState, useEffect } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Template from '../Template';

let myForm, f1;
const UsersList = () => {
  let userType = localStorage.getItem('userType');

  let [roleList, setRoleList] = useState([]);
  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [roleType, setRoleType] = useState();

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        console.log('res', res)
        if(res && res.retcode == 0) {
          let list = []
          res.data.map(item => {
            if(userType == 'admin' && item.name != 'huiyuan' && item.name != 'gongyingshang') {
              list.push({ value: item.id, label: item.description })
            }
            if(userType == 'hr' && item.name != 'admin' && item.name != 'huiyuan' && item.name != 'gongyingshang') {
              list.push({ value: item.id, label: item.description })
            }
          })
          setRoleList(list);
        }
      })
  }, [])

  useEffect(() => {
    if(roleList.length) {
      f1.onSearch();
      setRoleType(roleList[0].value);
    }
  }, [roleList])

  // 人员启用/禁用
  const onUserStatusChange = (status, id) => {
    request({url: '/api/user/setStatus', method: 'POST', form: {id, status}})
      .then(res => {
        if(res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onDelete = (id) => {
    request({url: `/api/user/${id}`, method: 'DELETE'})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const handleSearchData = (val) => {
    setRoleType(val.roleId);
    return val;
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
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
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      let data = {};
      data.id = modalVal.id;
      data.nickName = val.nickname;

      return data;
    }

    return val;
  }

  let searchItems = [
    {
      type: 'select',
      label: '角色类型',
      paramName: 'roleId',
      itemProps: {
        options: roleList
      },
      initialValue: roleList[0] && roleList[0].value,
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '正常' },
          { value: 0, label: '禁用' },
        ]
      },
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '登录用户名', dataIndex: 'username', align: 'center', width: 300 },
    { title: '用户名称', dataIndex: 'nick_name', align: 'center', width: 300 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          <Divider type='vertical' />
          {
            record.status == 1 ?
            <Popconfirm
              title="是否禁用该用户?"
              onConfirm={onUserStatusChange.bind(this, 0, text)}
              icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
              <a style={{ color: 'red' }}>禁用</a>
            </Popconfirm>
            :
            <a onClick={onUserStatusChange.bind(this, 1, text)}>启用</a>
          }
          <Divider type='vertical' />
          <Popconfirm
            title="是否删除该用户?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19,
  };

  let modalItems = [
    {
      type: 'input',
      label: '登录用户名',
      paramName: 'username',
      rules: [{ ...config.reg.required }],
      initialValue: modalVal.username,
      disabled: modalType == '编辑',
      ...colConfig
    }, 
    ...(
      modalType == '新增' &&
      [{
        type: 'input',
        label: '密码',
        paramName: 'password',
        initialValue: modalVal.password,
        ...colConfig
      }] || []
    ),
    {
      type: 'input',
      label: '真实姓名',
      paramName: 'nickname',
      initialValue: modalVal.nick_name,
      ...colConfig
    }, {
      type: 'select',
      label: '角色',
      paramName: 'roleId',
      itemProps: {
        options: roleList
      },
      rules: [{ ...config.reg.required }],
      initialValue: roleType,
      disabled: modalType == '编辑',
      ...colConfig
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
    handleSearchData: handleSearchData,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/role/getRoleUsers/', params: { roleId: roleList[0] && roleList[0].value }, delayed: true },
    addApi: { url: '/api/user/create', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/user/update', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default UsersList;