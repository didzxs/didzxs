/**
 * 会员列表
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import useQiniuToken from '../MyHooks/useQiniuToken';
import Util from '../../utils/Util';
import PublicService from '../../services/PublicService';
import Template from '../Template';

let myForm, f1;
const MemberList = () => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let token = useQiniuToken();

  let [roleList, setRoleList] = useState([]);
  let [salesList, setSalesList] = useState([]);
  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});

  let [zhizhao, setZhizhao] = useState([]);
  let [idFront, setIdFront] = useState([]);
  let [idBack, setIdBack] = useState([]);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        console.log('res', res)
        if(res && res.retcode == 0) {
          let list = []
          res.data.map(item => {
            list.push({ value: item.id, label: item.description, ...item })
          })
          setRoleList(list);
        }
      })
  }, [])

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        if(item.name == 'xiaoshou') {
          getSalesmanList(item.id);
        }
      })
    }
  }, [roleList])

  const getSalesmanList = (id) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {roleId: id, page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name })
          })
          setSalesList(list);
        }
      })
  }

  const getDetail = (id, modalType) => {
    request({url: `/api/user/memberInfo/?uid=${id}`, method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);

          let zhizhao = [], idFront = [], idBack = [];
          res.data.zhizhao && (zhizhao = [{url: res.data.zhizhao, uid: 0, index: 0, type: 'zhizhao'}]);
          res.data.id_front && (idFront = [{url: res.data.id_front, uid: 0, index: 0, type: 'idFront'}]);
          res.data.id_back && (idBack = [{url: res.data.id_back, uid: 0, index: 0, type: 'idBack'}]);

          setZhizhao(zhizhao);
          setIdFront(idFront);
          setIdBack(idBack);

          if(modalType != '绑定销售') {
            myForm.props.form.setFieldsValue({
              zhizhao,
              idFront,
              idBack,
            })
          }
        }
      })
  }

  // 禁用
  const onForbidden = (id) => {
    request({url: '/api/user/setStatus', method: 'POST', form: {id, status: 0}})
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
    request({url: `/api/user/deleteMember/${id}`, method: 'DELETE'})
      .then(res => {
        if(res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 销售主管审核会员账期
  const onAudit = (record) => {
    request({url: '/api/user/checkMember', method: 'POST', form: {id: record.id || modalVal.id}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
          f1.modalCancel();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 财务审核期初应收
  const onAuditQC = (id) => {
    request({url: '/api/user/member/beginCheck', method: 'POST', form: {id}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('审核成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);
    getDetail(record.id, type);
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
    setZhizhao([]);
    setIdFront([]);
    setIdBack([]);
  }

  let handleSaveData = (val) => {
    if(modalType == '绑定销售') {
      onBindSale(val);
      return false;
    }
    if(val.yearProjPart || val.yearWeibaoPart || val.yearQicaiPart) {
      if(val.yearProjPart + val.yearWeibaoPart + val.yearQicaiPart != 100) {
        message.error('工程占比、维保占比、器材占比总和应为100%');
        return false;
      }
    }

    if (modalVal.id) {
      val.userId = modalVal.id;
      val.nickName = val.nickname;
    }

    roleList.map(item => {
      if(item.name == 'huiyuan') {
        val.roleId = item.value;
      }
    })

    val.zhizhao = zhizhao[0] ? zhizhao[0].url : '';
    val.idFront = idFront[0] ? idFront[0].url : '';
    val.idBack = idBack[0] ? idBack[0].url : '';

    val.preBalance && (val.preBalance = (val.preBalance * 100).toFixed(0));
    val.yearTotal && (val.yearTotal = (val.yearTotal * 100).toFixed(0));
    val.yearProjCorp && (val.yearProjCorp = (val.yearProjCorp * 100).toFixed(0));
    val.yearWeibaoCorp && (val.yearWeibaoCorp = (val.yearWeibaoCorp * 100).toFixed(0));
    val.yearQicaiCorp && (val.yearQicaiCorp = (val.yearQicaiCorp * 100).toFixed(0));
    val.beginNeedGet && (val.beginNeedGet = (val.beginNeedGet * 100).toFixed(0));
    val.beginNeedReceipt && (val.beginNeedReceipt = (val.beginNeedReceipt * 100).toFixed(0));

    // 期初审核过后修改不能再传
    if (modalVal.begin_check) {
      delete val.beginNeedGet;
      delete val.beginNeedReceipt;
    }

    return val;
  }

  // 绑定销售
  const onBindSale = (val) => {
    request({url: '/api/user/member/changeSale', method: 'POST', form: {...val, memberId: detail.user_id}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
          f1.modalCancel();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onSuccess = (type, data) => {
    let fileType = {zhizhao, idFront, idBack};
    let newFileList = [...fileType[type]];

    newFileList[0] = {url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type};

    myForm.props.form.setFieldsValue({
      [type]: newFileList
    })

    type == 'zhizhao' && setZhizhao(newFileList);
    type == 'idFront' && setIdFront(newFileList);
    type == 'idBack' && setIdBack(newFileList);
  }

  const onRemove = (type, setType, file) => {
    let fileType = {zhizhao, idFront, idBack};
    let newFileList = [...fileType[type]];
    newFileList.splice(file.index, 1);
    setType(newFileList);
  }

  let searchItems = [
    ...(
      userType != 'xiaoshou' &&
      [{
        type: 'select',
        label: '销售',
        paramName: 'salesId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
        },
      }] || []
    ), {
      type: 'input',
      label: '会员名',
      paramName: 'search',
    },
    {
      type: 'select',
      label: '账期审核状态',
      paramName: 'checked',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未审核' },
          { value: 1, label: '已审核' },
        ]
      }
    },
    {
      type: 'select',
      label: '期初审核状态',
      paramName: 'beginCheck',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未审核' },
          { value: 1, label: '已审核' },
        ]
      }
    }
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 40 },
    { title: '会员姓名', dataIndex: 'nick_name', align: 'center', width: 500 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          {
            // 销售编辑基本信息 || 销售主管编辑基础信息/审核过的账期信息 || 财务编辑未审核的期初应收
            (userType == 'xiaoshou' || userType == 'xiaoshou_mgr' || (userType == 'caiwu' && !record.begin_check)) ?
            <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a> :
            <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
          }
          {
            userType == 'xiaoshou_mgr' && !record.checked &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否审核该用户?"
                onConfirm={onAudit.bind(this, record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>审核账期</a>
              </Popconfirm>
            </>
          }
          {
            userType == 'xiaoshou_mgr' &&
            <>
              <Divider type='vertical' />
              <a onClick={onModalShow.bind(this, "绑定销售", record)}>绑定销售</a>
            </>
          }
          {
            userType == 'caiwu' &&
            <>
              <Divider type='vertical' />
              {
                record.begin_check ?
                '期初已审核' :
                <Popconfirm
                  title="是否审核该用户?"
                  onConfirm={onAuditQC.bind(this, text)}
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                  <a>审核期初</a>
                </Popconfirm>
              }
            </>
          }
          {/* {
            userType == 'admin' &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否禁用该用户?"
                onConfirm={onForbidden.bind(this, text)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a style={{ color: 'red' }}>禁用</a>
              </Popconfirm>
            </>
          } */}
          {
            userType == 'xiaoshou_mgr' &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否删除该用户?"
                onConfirm={onDelete.bind(this, text)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a style={{ color: 'red' }}>删除</a>
              </Popconfirm>
            </>
          }
        </>
      )
    },
  ];

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19,
  };

  let disabled = userType == 'caiwu'; // 财务只能编辑期初
  let modalItems = [
    {
      type: 'input',
      label: '登录用户名',
      paramName: 'username',
      rules: [{ ...config.reg.required }],
      initialValue: detail.username,
      disabled: modalType == '编辑',
      ...colConfig
    },
    ...(
      modalType == '新增' &&
      [{
        type: 'input',
        label: '密码',
        paramName: 'password',
        rules: [{ ...config.reg.required }],
        initialValue: detail.password,
        ...colConfig
      }] || []
    ), {
      type: 'input',
      label: '真实姓名',
      paramName: 'nickname',
      rules: [{ ...config.reg.required }],
      initialValue: detail.nick_name,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '办公名称',
      paramName: 'firm',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.firm,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '办公地址',
      paramName: 'office',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.office,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '身份证号码',
      paramName: 'idNumber',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.id_number,
      disabled,
      ...colConfig
    }, {
      type: 'blank',
      content: '',
      span: 24,
    }, {
      type: 'imgUpload',
      label: '营业执照',
      paramName: 'zhizhao',
      // required: true,
      data: {token},
      uploadButtonShow: !zhizhao.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'zhizhao'),
        onRemove: onRemove.bind(this, 'zhizhao', setZhizhao),
      },
      disabled,
      span: 8,
      labelCol: 6,
      wrapperCol: 24,
    }, {
      type: 'imgUpload',
      label: '身份证正面',
      paramName: 'idFront',
      // required: true,
      data: {token},
      uploadButtonShow: !idFront.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'idFront'),
        onRemove: onRemove.bind(this, 'idFront', setIdFront),
      },
      disabled,
      span: 8,
      labelCol: 8,
      wrapperCol: 24,
    }, {
      type: 'imgUpload',
      label: '身份证背面',
      paramName: 'idBack',
      // required: true,
      data: {token},
      uploadButtonShow: !idBack.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'idBack'),
        onRemove: onRemove.bind(this, 'idBack', setIdBack),
      },
      disabled,
      span: 8,
      labelCol: 8,
      wrapperCol: 24,
    }, {
      type: 'input',
      label: '规模描述',
      paramName: 'guimo',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.guimo,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }, {
      type: 'input',
      label: '资产描述',
      paramName: 'zichan',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.zichan,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }, {
      type: 'input',
      label: '备注内容',
      paramName: 'comment',
      // rules: [{ ...config.reg.required }],
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }, {
      type: 'number',
      label: '账期',
      paramName: 'preBalance',
      itemProps: {
        formatter: value => `${value}元`
      },
      // rules: [{ ...config.reg.required }],
      initialValue: detail.pre_balance ? Util.toFixed2(detail.pre_balance / 100) : detail.pre_balance,
      disabled: modalType != '新增' && (!detail.checked && userType == 'xiaoshou_mgr' || userType != 'xiaoshou_mgr'), // 销售新增时可以填写账期信息，销售主管可以编辑已审核会员的账期信息
      ...colConfig
    }, {
      type: 'number',
      label: '账期的周期',
      paramName: 'months',
      itemProps: {
        formatter: value => `${value}月`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long }],
      initialValue: detail.months,
      disabled: modalType != '新增' && (!detail.checked && userType == 'xiaoshou_mgr' || userType != 'xiaoshou_mgr'),
      ...colConfig
    }, {
      type: 'input',
      label: '电话',
      paramName: 'mobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.mobile,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '年业务量',
      paramName: 'yearTotal',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long2 }],
      initialValue: detail.year_total ? Util.toFixed2(detail.year_total / 100) : detail.year_total,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '工程占比',
      paramName: 'yearProjPart',
      itemProps: {
        formatter: value => `${value}%`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long }],
      initialValue: detail.year_proj_part,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '维保占比',
      paramName: 'yearWeibaoPart',
      itemProps: {
        formatter: value => `${value}%`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long }],
      initialValue: detail.year_weibao_part,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '器材占比',
      paramName: 'yearQicaiPart',
      itemProps: {
        formatter: value => `${value}%`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long }],
      initialValue: detail.year_qicai_part,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '年工程可合作金额',
      paramName: 'yearProjCorp',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long2 }],
      initialValue: detail.year_proj_corp ? Util.toFixed2(detail.year_proj_corp / 100) : detail.year_proj_corp,
      disabled,
      labelCol: 8,
      wrapperCol: 16,
    }, {
      type: 'number',
      label: '年维保可合作金额',
      paramName: 'yearWeibaoCorp',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long2 }],
      initialValue: detail.year_weibao_corp ? Util.toFixed2(detail.year_weibao_corp / 100) : detail.year_weibao_corp,
      disabled,
      labelCol: 8,
      wrapperCol: 16,
    }, {
      type: 'number',
      label: '年器材可合作金额',
      paramName: 'yearQicaiCorp',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [/*{ ...config.reg.required }, */{ ...config.reg.long2 }],
      initialValue: detail.year_qicai_corp ? Util.toFixed2(detail.year_qicai_corp / 100) : detail.year_qicai_corp,
      disabled,
      labelCol: 8,
      wrapperCol: 16,
    }, {
      type: 'number',
      label: '期初应收',
      paramName: 'beginNeedGet',
      itemProps: {
        formatter: value => `${value}元`,
      },
      rules: [{ ...config.reg.along2 }],
      initialValue: detail.begin_need_get ? Util.toFixed2(detail.begin_need_get / 100) : detail.begin_need_get,
      disabled: modalType != '新增' && (userType != 'caiwu' || userType == 'caiwu' && !!detail.begin_check),
      ...colConfig
    }, {
      type: 'number',
      label: '期初剩余应开发票',
      paramName: 'beginNeedReceipt',
      itemProps: {
        formatter: value => `${value}元`,
      },
      rules: [{ ...config.reg.along2 }],
      initialValue: detail.begin_need_receipt ? Util.toFixed2(detail.begin_need_receipt / 100) : detail.begin_need_receipt,
      disabled: modalType != '新增' && (userType != 'caiwu' || userType == 'caiwu' && !!detail.begin_check),
      labelCol: 8,
      wrapperCol: 16,
    }
  ];

  if(userType == 'xiaoshou_mgr' && modalType == '绑定销售') {
    modalItems = [
      {
        type: 'select',
        label: '销售',
        paramName: 'salesId',
        itemProps: {
          options: salesList,
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.sales_id,
        span: 24
      }
    ];
  }

  // 弹窗按钮
  let modalBtnList = [];
  if (detail.checked == 0 && userType == 'xiaoshou_mgr') {
    modalBtnList = [{ title: '审核', onClick: onAudit, type: 'primary' }];
  }
  // if (detail.begin_check == 0 && userType == 'caiwu') {
  //   modalBtnList = [{ title: '期初审核', onClick: onAuditQC, type: 'primary' }];
  // }

  let basicParams = {};
  // 销售只能查看自己创建的会员
  if(userType == 'xiaoshou') {
    basicParams.salesId = userId;
  }

  let params = {
    searchItems,
    columns,
    modalWidth: modalType == '绑定销售' && '550px',
    modalItems,
    headerShow: userType == 'xiaoshou' || userType == 'xiaoshou_mgr',
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: true,
    rowSelectionShow: false,
    modalBtnList,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/user/getMembers/', params: basicParams },
    addApi: { url: '/api/user/createMember', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/user/updateMember', method: 'POST', dataType: 'form' },
    exportApi: { url: '/api/user/exportMembers', method: 'GET', params: { ...basicParams }, btnText: '导出' }, // 导出会员列表
    importApi: {url: '/api/user/importMember', show: userType == 'xiaoshou'},
    templateUrl: config.viewImgUrl + 'import_member.xls'
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default MemberList;
