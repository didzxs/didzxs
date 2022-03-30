/**
 * 工程订单
 *
 * 会员创建工程订单
 * 工程中心可修改托管合同金额、处理状态；处理状态只能由未处理改为已处理
 * 会员只能查自己的单子
 * 工程中心角色可查看所有单子，工程中心下属的四个部门根据项目类型查看对应单子
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import useQiniuToken from '../MyHooks/useQiniuToken';
import Template from '../Template';
import PublicService from '../../services/PublicService';

let myForm, f1;
const ProjectOrder = () => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let token = useQiniuToken();

  let [roleList, setRoleList] = useState([]);
  let [kefuList, setKefuList] = useState([]); // 客服
  let [salesList, setSalesList] = useState([]); // 销售
  let [memberList, setMemberList] = useState([]); // 会员

  let [modalType, setModalType] = useState();
  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});

  let [projContract, setProjContract] = useState([]);
  let [tuoguanContract, setTuoguanContract] = useState([]);
  let [imgList, setImgList] = useState([]);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        console.log('res', res)
        if (res && res.retcode == 0) {
          setRoleList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        if(item.name == 'kefu') {
          getSelectList(item.id, setKefuList);
        }
        if(item.name == 'xiaoshou') {
          getSelectList(item.id, setSalesList);
        }
        if(item.name == 'huiyuan') {
          getSelectList(item.id, setMemberList);
        }
      })
    }
  }, [roleList])

  const getSelectList = (roleId, setType) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {page: 1, pageSize: 100000, roleId}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name
            })
          })

          setType(list);
        }
      })
  }

  // 获取详情
  const getDetail = (id) => {
    request({url: `/api/order/project/info?id=${id}`, method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);

          let projContract = [], tuoguanContract = [], imgList = [];
          res.data.proj_contract && (projContract = [{url: res.data.proj_contract, name: '文件', uid: 0, index: 0, type: 'projContract'}]);
          res.data.tuoguan_contract && (tuoguanContract = [{url: res.data.tuoguan_contract, name: '文件', uid: 0, index: 0, type: 'tuoguanContract'}]);

          let imgs = res.data.attachs && res.data.attachs.split(',') || [];
          imgs.length &&
          imgs.map((item, index) => {
            imgList.push({url: item, name: '文件', uid: index, index, type: 'imgList'});
          })

          setProjContract(projContract);
          setTuoguanContract(tuoguanContract);
          setImgList(imgList);

          myForm.props.form.setFieldsValue({
            projContract,
            tuoguanContract,
            attachs: imgList,
          })
        }
      })
  }

  const onDelete = (id) => {
    request({ url: '/api/order/project', method: 'DELETE', params: { projectId: id } })
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
    getDetail(record.id);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const handleSearchData = (val) => {
    if(val.time) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD HH:mm:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD HH:mm:59');

      delete val.time;
    }

    return val;
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
    setProjContract([]);
    setTuoguanContract([]);
    setImgList([]);
  }

  let handleSaveData = (val) => {
    // 工程人员修改工程金额，处理状态
    if (modalVal.id && (userType == 'gongcheng' || userType.indexOf('gc') > -1)) {
      let data = {
        id: modalVal.id,
        checked: val.checked,
        projFee: (val.projFee * 100).toFixed(0),
      };
      return data;
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }

    val.projFee && (val.projFee = (val.projFee * 100).toFixed(0));
    val.contractFee && (val.contractFee = (val.contractFee * 100).toFixed(0));

    if(projContract[0]) {
      val.projContract = projContract[0].url;
    } else {
      delete val.projContract;
    }
    if(tuoguanContract[0]) {
      val.tuoguanContract = tuoguanContract[0].url;
    } else {
      delete val.tuoguanContract;
    }

    let imgs = [];
    imgList.map(item => {
      imgs.push(item.url);
    })
    val.attachs = imgs.join(',');

    console.log(val.time);
    if(val.time && val.time.length) {
      val.startedAt = moment(val.time[0]).format('YYYY-MM-DD HH:mm:00');
      val.endedAt = moment(val.time[1]).format('YYYY-MM-DD HH:mm:59');
    }
    delete val.time;

    return val;
  }

  const onSuccess = (type, data) => {
    let fileType = {projContract, tuoguanContract, imgList};
    let newFileList = [...fileType[type]];

    if(type == 'projContract' || type == 'tuoguanContract') {
      newFileList[0] = {url: config.viewImgUrl + data.key, name: '文件', ...data, uid: 0, index: 0, type};

      myForm.props.form.setFieldsValue({
        [type]: newFileList
      })

      type == 'projContract' && setProjContract(newFileList);
      type == 'tuoguanContract' && setTuoguanContract(newFileList);
    } else if(type == 'imgList') {
      newFileList.push({url: config.viewImgUrl + data.key, name: '文件', ...data, uid: newFileList.length, index: newFileList.length, type});

      newFileList.map((item, index) => {
        item.uid = index;
        item.index = index;
      })

      myForm.props.form.setFieldsValue({
        attachs: newFileList
      })

      setImgList(newFileList);
    }
  }

  const onRemove = (type, setType, file) => {
    let fileType = {projContract, tuoguanContract, imgList};
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
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true)
        },
      }] || []
    ),
    ...(
      userType != 'huiyuan' &&
      [{
        type: 'select',
        label: '会员',
        paramName: 'memberId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true),
          showSearch: true,
        },
      }] || []
    ),
    {
      type: 'select',
      label: '客服',
      paramName: 'kefuId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(kefuList, 'value', 'label', true)
      },
    },
    {
      type: 'rangePicker',
      label: '时间',
      paramName: 'time',
      itemProps: {
        showTime: {format: 'HH:mm'},
        format: 'YYYY-MM-DD HH:mm'
      },
    }, {
      type: 'select',
      label: '处理状态',
      paramName: 'checked',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '工程中心已处理' },
          { value: 0, label: '工程中心未处理' },
        ]
      },
    }, {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '订单编号、项目名称'
    },
    ...(
      (userType == 'admin' || userType == 'gongcheng' || userType == 'caiwu' || userType == 'huiyuan') &&
      [
        {
          type: 'select',
          label: '项目类型',
          paramName: 'category',
          itemProps: {
            options: [
              { value: 1, label: '维保' },
              { value: 2, label: '维修' },
              { value: 3, label: '检测评估' },
              { value: 4, label: '智慧消防' },
              { value: 5, label: '工程项目托管' },
              { value: 6, label: '维保勘查' },
              { value: 7, label: '工程勘察' },
              { value: 8, label: '排查' },
              { value: 9, label: '图纸设计' },
              { value: 10, label: '图审' },
              { value: 11, label: '报建' },
              { value: 12, label: '验收' },
              { value: 13, label: '标书' },
              { value: 14, label: '预结算流程' },
            ]
          }
        }
      ] || []
    ),
    ...(
      userType == 'gc_weibao' &&
      [
        {
          type: 'select',
          label: '项目类型',
          paramName: 'category',
          itemProps: {
            options: [
              { value: 1, label: '维保' },
              { value: 2, label: '维修' },
              { value: 3, label: '检测评估' },
              { value: 6, label: '维保勘查' },
              { value: 8, label: '排查' },
            ]
          }
        }
      ] || []
    ),
    ...(
      userType == 'gc_zhihuixiaofang' &&
      [
        {
          type: 'select',
          label: '项目类型',
          paramName: 'category',
          itemProps: {
            options: [
              { value: 4, label: '智慧消防' },
            ]
          }
        }
      ] || []
    ),
    ...(
      userType == 'gc_gongcheng' &&
      [
        {
          type: 'select',
          label: '项目类型',
          paramName: 'category',
          itemProps: {
            options: [
              { value: 5, label: '工程项目托管' },
              { value: 7, label: '工程勘察' },
              { value: 9, label: '图纸设计' },
              { value: 10, label: '图审' },
              { value: 11, label: '报建' },
              { value: 12, label: '验收' },
            ]
          }
        }
      ] || []
    ),
    ...(
      userType == 'gc_chengben' &&
      [
        {
          type: 'select',
          label: '项目类型',
          paramName: 'category',
          itemProps: {
            options: [
              { value: 13, label: '标书' },
              { value: 14, label: '预结算流程' },
            ]
          }
        }
      ] || []
    ),
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '项目名称', dataIndex: 'proj_name', align: 'center', width: 100 },
    { title: '项目编号', dataIndex: 'self_sn', align: 'center', width: 120 },
    {
      title: '项目类型',
      dataIndex: 'proj_category',
      align: 'center',
      width: 120,
      render: (text) => {
        return {1: '维保', 2: '维修', 3: '检测评估', 4: '智慧消防', 5: '工程项目托管', 6: '维保勘查', 7: '工程勘察', 8: '排查', 9: '图纸设计', 10: '图审', 11: '报建', 12: '验收', 13: '标书', 14: '预结算流程'}[text]
      }
    },
    { title: '联系人姓名', dataIndex: 'contact_name', align: 'center', width: 100 },
    { title: '联系人电话', dataIndex: 'contact_mobile', align: 'center', width: 100 },
    { title: '项目地址', dataIndex: 'proj_address', align: 'center', width: 100 },
    {
      title: '甲方合同金额',
      dataIndex: 'contract_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : 0
      )
    },
    {
      title: '托管合同金额',
      dataIndex: 'proj_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : 0
      )
    },
    {
      title: '合同起止时间',
      dataIndex: 'started_at',
      align: 'center',
      width: 160,
      render: (text, record) => (
        text && record.ended_at && moment(text).format('YYYY-MM-DD HH:mm') + '~' + moment(record.ended_at).format('YYYY-MM-DD HH:mm')
      )
    },
    { title: '会员姓名', dataIndex: 'member_name', align: 'center', width: 100 },
    { title: '销售姓名', dataIndex: 'sales_name', align: 'center', width: 100 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (text, record) => (
        <>
          {
            (userType == 'huiyuan' || userType == 'caiwu' || ((userType == 'gongcheng' || userType.indexOf('gc') > - 1) && !!record.checked)) &&
            <>
              <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
              <Divider type='vertical' />
            </>
          }
          {
            ((userType == 'gongcheng' || userType.indexOf('gc') > -1 || userType == 'huiyuan') && !record.checked) &&
            <>
              <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
              <Divider type='vertical' />
            </>
          }
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
    labelCol: 5,
    wrapperCol: 19,
  };

  let disabled = modalType == '编辑' && !!modalVal.checked || userType == 'gongcheng' || userType.indexOf('gc') > -1;

  let modalItems = [
    {
      type: 'input',
      label: '项目名称',
      paramName: 'projName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.proj_name,
      disabled,
      ...colConfig
    },
    ...(
      modalType != '新增' &&
      [{
        type: 'input',
        label: '项目编号',
        paramName: 'self_sn',
        initialValue: detail.self_sn,
        disabled: true,
        ...colConfig
      }] || []
    ),
    {
      type: 'input',
      label: '联系人姓名',
      paramName: 'contactName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.contact_name,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '联系人电话',
      paramName: 'contactMobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.contact_mobile,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '项目地址',
      paramName: 'projAddress',
      rules: [{ ...config.reg.required }],
      initialValue: detail.proj_address,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '项目类型',
      paramName: 'projCategory',
      itemProps: {
        options: [
          { value: 1, label: '维保' },
          { value: 2, label: '维修' },
          { value: 3, label: '检测评估' },
          { value: 4, label: '智慧消防' },
          { value: 5, label: '工程项目托管' },
          { value: 6, label: '维保勘查' },
          { value: 7, label: '工程勘察' },
          { value: 8, label: '排查' },
          { value: 9, label: '图纸设计' },
          { value: 10, label: '图审' },
          { value: 11, label: '报建' },
          { value: 12, label: '验收' },
          { value: 13, label: '标书' },
          { value: 14, label: '预结算流程' },
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.proj_category,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '托管合同金额',
      paramName: 'projFee',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }, { ...config.reg.price }],
      initialValue: detail.proj_fee ? detail.proj_fee / 100 : detail.proj_fee,
      disabled: !!detail.checked,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'number',
      label: '甲方合同金额',
      paramName: 'contractFee',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }, { ...config.reg.price }],
      initialValue: detail.contract_fee ? detail.contract_fee / 100 : detail.contract_fee,
      disabled,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'input',
      label: '项目工程量',
      paramName: 'projHeavy',
      rules: [{ ...config.reg.required }],
      initialValue: detail.proj_heavy,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '是否开票',
      paramName: 'receiptStatus',
      itemProps: {
        options: [
          { value: -1, label: '开票' },
          { value: -2, label: '不开票' },
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.receipt_status,
      disabled,
      ...colConfig
    },
    ...(
      ((userType == 'gongcheng' || userType.indexOf('gc') > -1) && modalType == '编辑' || modalType == '查看') &&
      [
        {
          type: 'select',
          label: '处理状态',
          paramName: 'checked',
          itemProps: {
            options: [
              { value: 1, label: '已处理' },
              { value: 0, label: '未处理' },
            ]
          },
          initialValue: detail.checked,
          disabled: !!detail.checked,
          ...colConfig,
        }, {
          type: 'blank',
          content: ''
        }
      ] || []
    ),
    {
      type: 'blank',
      content: '',
      span: 24,
    },
    {
      type: 'fileUpload',
      label: '甲方合同',
      paramName: 'projContract',
      data: {token},
      uploadButtonShow: !projContract.length,
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'projContract'),
        onRemove: onRemove.bind(this, 'projContract', setProjContract),
      },
      disabled,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'fileUpload',
      label: '托管合同',
      paramName: 'tuoguanContract',
      data: {token},
      uploadButtonShow: !tuoguanContract.length,
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'tuoguanContract'),
        onRemove: onRemove.bind(this, 'tuoguanContract', setTuoguanContract),
      },
      disabled,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'blank',
      content: <div style={{marginBottom: '15px'}}><span style={{color: 'red'}}>* </span>图纸、工程量清单、标书、招标文件等 :</div>,
      span: 24
    }, {
      type: 'blank',
      content: '',
      span: 3
    }, {
      type: 'fileUpload',
      label: '',
      paramName: 'attachs',
      data: {token},
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'imgList'),
        onRemove: onRemove.bind(this, 'imgList', setImgList),
      },
      disabled,
      span: 21,
      wrapperCol: 24
    }, {
      type: 'textArea',
      label: '项目工程量备注',
      paramName: 'comment',
      rules: [{ ...config.reg.required }],
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 4,
      wrapperCol: 20,
    }, {
      type: 'rangePicker',
      label: '合同起止时间',
      paramName: 'time',
      itemProps: {
        showTime: {format: 'HH:mm'},
        format: 'YYYY-MM-DD HH:mm'
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.started_at && detail.ended_at && [moment(detail.started_at), moment(detail.ended_at)],
      disabled,
      labelCol: 6,
      wrapperCol: 18,
    },
    ...(
      detail.kefu_id &&
      [
        {
          type: 'select',
          label: '客服',
          paramName: 'kefuId',
          itemProps: {
            options: kefuList
          },
          initialValue: detail.kefu_id,
          disabled: true,
          ...colConfig,
        }
      ] || []
    )
  ];

  let basicParams = {};
  if(userType == 'huiyuan') {
    basicParams.memberId = userId;
  }
  if(userType == 'gc_weibao') {
    basicParams.category = '1,2,3,6,8';
  }
  if(userType == 'gc_zhihuixiaofang') {
    basicParams.category = '4';
  }
  if(userType == 'gc_gongcheng') {
    basicParams.category = '5,7,9,10,11,12';
  }
  if(userType == 'gc_chengben') {
    basicParams.category = '13,14';
  }
  if(userType == 'xiaoshou') {
    basicParams.salesId = userId;
  }

  let params = {
    searchItems,
    columns,
    modalItems,
    addBtnShow: userType == 'huiyuan',
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    handleSearchData: handleSearchData,
    getModalFormHanld: getModalFormHanld,
    getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/order/project/list', params: basicParams },
    addApi: { url: '/api/order/project/create', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/order/project', method: 'PUT' },
    exportApi: { url: '/api/order/project/export', params: basicParams }
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default ProjectOrder;
