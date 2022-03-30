/**
 * 意向订单
 *
 * 客服创建意向订单指派给销售主管
 * 销售主管把意向订单分配给销售，销售可把意向订单用户直接发展为会员
 * 销售修改意向订单把意向订单指派给会员
 */

import React, { useEffect, useState } from 'react';
import { Divider, message } from 'antd';
import moment from 'moment';
import request from '../../../utils/request';
import config from '../../../config';
import cityData from '../../listData/cityList.json';
import Template from '../../Template';
import PublicService from '../../../services/PublicService';
import useQiniuToken from '../../MyHooks/useQiniuToken';
import MobileHeader from '../components/MobileHeader';
import Util from '../../../utils/Util';

let myForm, f1;
const IntentionToOrder = (props) => {
  let token = useQiniuToken();

  let assignedStatus = props.location.query.assigned; // 销售查询订单 -1：已分配给会员 -2：未分配给会员

  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let [roleList, setRoleList] = useState([]);
  let [saleMgrList, setSaleMgrList] = useState([]);
  let [salesList, setSalesList] = useState([]);
  let [memberList, setMemberList] = useState([]);
  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});
  let [modalType, setModalType] = useState();

  let [provinceList, setProvinceList] = useState([]);
  let [cityList, setCityList] = useState([]);
  let [countyList, setCountyList] = useState([]);
  let [regionName, setRegionName] = useState({});

  let [zhizhao, setZhizhao] = useState([]);
  let [idFront, setIdFront] = useState([]);
  let [idBack, setIdBack] = useState([]);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        console.log('res', res);
        if (res && res.retcode == 0) {
          let list = [];
          res.data.map(item => {
            list.push({ value: item.id, label: item.description, ...item });
          });
          setRoleList(list);
        }
      });

    getMemberList();

    let provinceList = [];
    cityData.map(item => {
      provinceList.push({ value: item.id, label: item.name, children: item.children });
    });
    setProvinceList(provinceList);
  }, []);

  useEffect(() => {
    if (roleList.length) {
      roleList.map(item => {
        if (item.name == 'xiaoshou-mgr') {
          getSaleMgrList(item.id);
        }
        if (item.name == 'xiaoshou') {
          getSalesmanList(item.id);
        }
      });
    }
  }, [roleList]);

  // 获取销售主管列表
  const getSaleMgrList = (id) => {
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { roleId: id, page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name });
          });
          setSaleMgrList(list);
        }
      });
  };

  // 获取销售列表
  const getSalesmanList = (id) => {
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { roleId: id, page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name });
          });
          setSalesList(list);
        }
      });
  };

  // 获取会员列表
  const getMemberList = () => {
    let basicParams = {};
    if (userType == 'xiaoshou') {
      basicParams.salesId = userId;
    }
    request({ url: '/api/user/getMembers/', method: 'GET', params: { page: 1, pageSize: 100000, ...basicParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name });
          });
          setMemberList(list);
        }
      });
  };

  // 获取详情
  const getDetail = (id) => {
    request({ url: `/api/order/potential/info?id=${id}`, method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
        }
      });
  };

  const onDelete = (id) => {
    request({ url: '', method: 'POST', form: { id } })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      });
  };

  const handleSearchData = (val) => {
    if (userType == 'xiaoshou_mgr' && !val.salesId) { // 销售主管根据订单是否分配给会员筛选
      val.salesId = assignedStatus;
    }
    if (userType == 'xiaoshou' && !val.memberId) { // 销售根据订单是否分配给会员筛选
      val.memberId = assignedStatus;
    }
    if (val.time && val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD 00:00:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD 00:00:00');
    }
    delete val.time;

    return val;
  };

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);
    getDetail(record.id);
  };

  const getModalFormHanld = (form) => {
    myForm = form;
  };

  const getModalType = (type) => {
    setModalType(type);
  };

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setZhizhao([]);
    setIdFront([]);
    setIdBack([]);
  };

  const handleSaveRequest = (modalTitle) => {
    if (modalTitle == '分配给销售') {
      return {
        url: '/api/order/potential/assignSale',
        method: 'POST',
        dataType: 'form'
      };
    }
    if (modalTitle == '发展为会员') {
      return {
        url: '/api/order/potential/gen_member',
        method: 'POST',
        dataType: 'form'
      };
    }
  };

  let handleSaveData = (val) => {
    if (modalType == '分配给销售') {
      val.id = modalVal.id;
      salesList.map(item => {
        if (item.value == val.saleId) {
          val.saleName = item.label;
        }
      });
      return val;
    }
    if (modalType == '编辑' && userType == 'xiaoshou') {
      let data = {};
      data.id = modalVal.id;
      data.current = val.current;
      data.help = val.help;
      data.memberId = val.memberId;
      memberList.map(item => {
        if (item.value == val.memberId) {
          data.memberName = item.label;
        }
      });

      return data;
    }

    if (modalType == '发展为会员') {
      val.id = modalVal.id;

      val.preBalance = Util.toFixed0(val.preBalance * 100);

      // val.estimate && (val.estimate = Util.toFixed0(val.estimate * 100));
      val.yearTotal && (val.yearTotal = Util.toFixed0(val.yearTotal * 100));
      val.yearProjCorp && (val.yearProjCorp = Util.toFixed0(val.yearProjCorp * 100));
      val.yearWeibaoCorp && (val.yearWeibaoCorp = Util.toFixed0(val.yearWeibaoCorp * 100));
      val.yearQicaiCorp && (val.yearQicaiCorp = Util.toFixed0(val.yearQicaiCorp * 100));

      roleList.map(item => {
        if (item.name == 'huiyuan') {
          val.roleId = item.value;
        }
      });
      val.zhizhao = zhizhao[0].url;
      val.idFront = idFront[0].url;
      val.idBack = idBack[0].url;
      return val;
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }

    val.estimate && (val.estimate = Util.toFixed0(val.estimate * 100));

    val.province = regionName.province;
    val.city = regionName.city;
    val.distinct = regionName.distinct;

    saleMgrList.map(item => {
      if (item.value == val.salesMgrId) {
        val.salesMgrName = item.label;
      }
    });
    val.channelName = {
      1: '腾讯新闻',
      2: '新浪',
      3: '搜狐',
      4: '百度百科',
      5: '360百科',
      6: '36氪等线上发稿渠道',
      7: '百家号',
      8: '今日头条',
      9: '钛媒体',
      10: '大鱼号',
      11: '抖音',
      12: '快手',
      13: '小红书',
      14: '视频号',
      15: '公众号',
      16: '其他'
    }[val.channelId];
    val.endedAt = moment(val.endedAt).format('YYYY-MM-DD 23:59:59');

    return val;
  };

  // 选择省获取市列表
  const onProvinceChange = (val, e) => {
    let obj = { ...regionName };
    obj.province = e.props.children;

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      cityId: undefined,
      distinctId: undefined
    });

    setRegionName(obj);
    setCountyList([]);

    for (let i = 0; i < cityData.length; i++) {
      if (cityData[i].id == val) {
        let cityList = [];
        cityData[i].children.map(item => {
          cityList.push({ ...item, value: item.id, label: item.name });
        });
        setCityList(cityList);
        break;
      }
    }
  };

  // 选择市获取区列表
  const onCityChange = (val, e) => {
    let obj = { ...regionName };
    obj.city = e.props.children;
    setRegionName(obj);

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      distinctId: undefined
    });

    for (let i = 0; i < cityData.length; i++) {
      if (cityList[i].id == val) {
        let countyList = [];
        cityList[i].children.map(item => {
          countyList.push({ value: item.id, label: item.name });
        });
        setCountyList(countyList);
        break;
      }
    }
  };

  const onCountyChange = (val, e) => {
    let obj = { ...regionName };
    obj.distinct = e.props.children;
    setRegionName(obj);
  };

  const onSuccess = (type, data) => {
    let fileType = { zhizhao, idFront, idBack };
    let newFileList = [...fileType[type]];

    newFileList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type };

    myForm.props.form.setFieldsValue({
      [type]: newFileList
    });

    type == 'zhizhao' && setZhizhao(newFileList);
    type == 'idFront' && setIdFront(newFileList);
    type == 'idBack' && setIdBack(newFileList);
  };

  const onRemove = (type, setType, file) => {
    let fileType = { zhizhao, idFront, idBack };
    let newFileList = [...fileType[type]];
    newFileList.splice(file.index, 1);
    setType(newFileList);
  };

  let searchItems = [
    ...(
      (userType == 'kefu' || (userType == 'xiaoshou_mgr' && assignedStatus == -1) || userType == 'huiyuan') &&
      [{
        type: 'select',
        label: '销售',
        paramName: 'salesId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true)
        }
      }] || []
    ),
    ...(
      (userType == 'xiaoshou' && assignedStatus == -1) &&
      [{
        type: 'select',
        label: '会员',
        paramName: 'memberId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true),
          showSearch: true
        },
        span: 12
      }] || []
    ),
    // {
    //   type: 'rangePicker',
    //   label: '时间',
    //   paramName: 'time',
    // },
    {
      type: 'select',
      label: '是否成交',
      paramName: 'isDeal',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未成交' },
          { value: 1, label: '已成交' }
        ]
      },
      span: 12
    }
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 50 },
    { title: '客户名称', dataIndex: 'nick_name', align: 'center', width: 100 },
    { title: '手机号', dataIndex: 'mobile', align: 'center', width: 100 },
    { title: '项目名称', dataIndex: 'project_name', align: 'center', width: 120 },
    {
      title: '是否成交',
      dataIndex: 'is_deal',
      align: 'center',
      width: 80,
      render: (text) => (
        { 0: '未成交', 1: '已成交' }[text]
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          {
            // 客服 || 销售主管 || 会员 || 运营主管 || 已分配给会员
            (userType.indexOf('kefu') > -1 || userType == 'xiaoshou_mgr' || userType == 'huiyuan' || userType == 'yunying_mgr' || assignedStatus == -1) &&
            <>
              <a onClick={onModalShow.bind(this, '查看', record)}>查看</a>
            </>
          }
          {
            userType == 'xiaoshou_mgr' && assignedStatus == -2 &&
            <>
              <Divider type="vertical"/>
              <a onClick={onModalShow.bind(this, '分配给销售', record)}>分配给销售</a>
            </>
          }
          {
            userType == 'xiaoshou' && assignedStatus == -2 && // 销售未分配给会员
            <>
              {
                record.membered ?
                  <a onClick={onModalShow.bind(this, '查看', record)}>查看</a> :
                  <a onClick={onModalShow.bind(this, '编辑', record)}>编辑</a>
              }
              <Divider type="vertical"/>
              {
                record.membered ?
                  <span>已发展为会员</span> :
                  <a onClick={onModalShow.bind(this, '发展为会员', record)}>发展为会员</a>
              }
            </>
          }
        </>
      )
    }
  ];

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19
  };

  let disabled = modalType == '查看' || userType != 'kefu';
  let disabled1 = modalType == '查看' || modalType == '编辑'; // 基础信息不可编辑

  let modalItems = [
    {
      type: 'input',
      label: '意向客户名称',
      paramName: 'nick_name',
      rules: [{ ...config.reg.required }],
      initialValue: detail.nick_name,
      disabled: disabled1,
      labelCol: 7,
      wrapperCol: 17
    }, {
      type: 'input',
      label: '手机号',
      paramName: 'mobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone }, { ...config.reg.space }],
      initialValue: detail.mobile,
      disabled: disabled1,
      ...colConfig
    }, {
      type: 'select',
      label: '地区',
      itemProps: {
        options: provinceList,
        onChange: onProvinceChange
      },
      paramName: 'provinceId',
      initialValue: detail.province,
      placeholder: '请选择省',
      rules: [{ ...config.reg.required }],
      disabled: disabled1,
      span: 24,
      labelCol: 3,
      wrapperCol: 10
    }, {
      type: 'select',
      label: '',
      itemProps: {
        options: cityList,
        onChange: onCityChange
      },
      paramName: 'cityId',
      initialValue: detail.city,
      placeholder: '请选择市',
      rules: [{ ...config.reg.required }],
      disabled: disabled1,
      span: 12,
      labelCol: 0,
      wrapperCol: 24
    }, {
      type: 'select',
      label: '',
      itemProps: {
        options: countyList,
        onChange: onCountyChange
      },
      paramName: 'distinctId',
      initialValue: detail.distinctname,
      placeholder: '请选择区',
      rules: [{ ...config.reg.required }],
      disabled: disabled1,
      span: 12,
      labelCol: 0,
      wrapperCol: 24
    }, {
      type: 'select',
      label: '用户来源渠道',
      paramName: 'channelId',
      itemProps: {
        options: [
          { value: 1, label: '腾讯新闻' },
          { value: 2, label: '新浪' },
          { value: 3, label: '搜狐' },
          { value: 4, label: '百度百科' },
          { value: 5, label: '360百科' },
          { value: 6, label: '36氪等线上发稿渠道' },
          { value: 7, label: '百家号' },
          { value: 8, label: '今日头条' },
          { value: 9, label: '钛媒体' },
          { value: 10, label: '大鱼号' },
          { value: 11, label: '抖音' },
          { value: 12, label: '快手' },
          { value: 13, label: '小红书' },
          { value: 14, label: '视频号' },
          { value: 15, label: '公众号' },
          { value: 16, label: '其他' }
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.channel_id,
      disabled,
      labelCol: 7,
      wrapperCol: 17
    }, {
      type: 'input',
      label: '项目名称',
      paramName: 'projectName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.project_name,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '用户意向',
      paramName: 'prefer',
      itemProps: {
        options: [
          { value: 1, label: '会员' },
          { value: 2, label: '终端用户' }
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.prefer,
      disabled,
      ...colConfig
    }, {
      type: 'number',
      label: '预计金额',
      paramName: 'estimate',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }, { ...config.reg.price }],
      initialValue: detail.estimate ? detail.estimate / 100 : detail.estimate,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '项目分类',
      paramName: 'projCategory',
      itemProps: {
        options: [
          { value: 1, label: '住宅小区、丁戊类厂房仓库' },
          { value: 2, label: '商场超市、甲乙类厂房仓库、养老院、医院、幼儿园、KTV、网吧商业场所、星级酒店' },
          { value: 3, label: '公寓写字楼、丙类厂房仓库、图书馆、博物馆、学校、普通酒店旅馆、民宿、体育馆' }
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.proj_category,
      disabled,
      span: 24
    }, {
      type: 'select',
      label: '业务分类',
      paramName: 'servCategory',
      itemProps: {
        options: [
          { value: 1, label: '器材' },
          { value: 2, label: '维保' },
          { value: 3, label: '维修' },
          { value: 4, label: '检测评估' },
          { value: 5, label: '智慧消防' },
          { value: 6, label: '工程项目托管' },
          { value: 7, label: '维保勘查' },
          { value: 8, label: '工程勘察' },
          { value: 9, label: '排查' },
          { value: 10, label: '图纸设计' },
          { value: 11, label: '图审' },
          { value: 12, label: '报建' },
          { value: 13, label: '验收' },
          { value: 14, label: '标书' },
          { value: 15, label: '预结算流程' }
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.serv_category,
      disabled,
      ...colConfig
    }, {
      type: 'datePicker',
      label: '截止日期',
      paramName: 'endedAt',
      rules: [{ ...config.reg.required }],
      initialValue: detail.ended_at && moment(detail.ended_at),
      disabled,
      ...colConfig
    },
    ...(
      userType == 'xiaoshou_mgr' && // 客服经理查看分配人
      [{
        type: 'select',
        label: '分配人',
        paramName: 'kefu_name',
        itemProps: {
          options: []
        },
        initialValue: detail.kefu_name,
        disabled: true,
        ...colConfig
      }] || []
    ),
    ...(
      (userType == 'kefu' || userType == 'xiaoshou') &&
      [{
        type: 'select',
        label: userType == 'kefu' ? '分配给销售主管' : '分配人',
        paramName: 'salesMgrId',
        itemProps: {
          options: saleMgrList
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.sales_mgr_id,
        disabled,
        labelCol: 7,
        wrapperCol: 17
      }] || []
    ),
    ...(
      modalType == '查看' && detail.sales_id && (userType == 'xiaoshou_mgr' || userType == 'huiyuan') &&
      [{
        type: 'select',
        label: userType == 'xiaoshou_mgr' ? '分配给销售人员' : '分配人',
        paramName: 'sales_id',
        itemProps: {
          options: salesList
        },
        initialValue: detail.sales_id,
        disabled,
        labelCol: 7,
        wrapperCol: 17
      }] || []
    ),
    {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      rules: [{ ...config.reg.required }],
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 2,
      wrapperCol: 22
    },
    ...(
      modalType != '新增' && !(userType == 'xiaoshou' && modalVal.membered) && // 销售把用户直接发展为会员不需要查看下列信息
      [{
        type: 'textArea',
        label: '当前阶段',
        paramName: 'current',
        rules: [userType == 'xiaoshou' && { ...config.reg.required }],
        initialValue: detail.current,
        disabled: userType !== 'xiaoshou',
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'textArea',
        label: '需要协助',
        paramName: 'help',
        rules: [userType == 'xiaoshou' && { ...config.reg.required }],
        initialValue: detail.help,
        disabled: userType !== 'xiaoshou',
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'select',
        label: '会员姓名',
        paramName: 'memberId',
        itemProps: {
          options: memberList,
          showSearch: true
        },
        rules: userType == 'xiaoshou' && [{ ...config.reg.required }],
        initialValue: detail.member_id,
        disabled: userType !== 'xiaoshou',
        ...colConfig
      }] || []
    )
  ];

  if (modalType == '发展为会员') {
    modalItems = [
      {
        type: 'input',
        label: '办公地址',
        paramName: 'office',
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.office,
        ...colConfig
      }, {
        type: 'input',
        label: '身份证号码',
        paramName: 'idNumber',
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.idNumber,
        ...colConfig
      }, {
        type: 'imgUpload',
        label: '营业执照',
        paramName: 'zhizhao',
        required: true,
        data: { token },
        uploadButtonShow: !zhizhao.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'zhizhao'),
          onRemove: onRemove.bind(this, 'zhizhao', setZhizhao)
        },
        span: 8,
        labelCol: 6,
        wrapperCol: 24
      }, {
        type: 'imgUpload',
        label: '身份证正面',
        paramName: 'idFront',
        required: true,
        data: { token },
        uploadButtonShow: !idFront.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'idFront'),
          onRemove: onRemove.bind(this, 'idFront', setIdFront)
        },
        span: 8,
        labelCol: 8,
        wrapperCol: 24
      }, {
        type: 'imgUpload',
        label: '身份证背面',
        paramName: 'idBack',
        required: true,
        data: { token },
        uploadButtonShow: !idBack.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'idBack'),
          onRemove: onRemove.bind(this, 'idBack', setIdBack)
        },
        span: 8,
        labelCol: 8,
        wrapperCol: 24
      }, {
        type: 'input',
        label: '规模描述',
        paramName: 'guimo',
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.guimo,
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'input',
        label: '资产描述',
        paramName: 'zichan',
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.zichan,
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'input',
        label: '备注内容',
        paramName: 'comment',
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.comment,
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'number',
        label: '账期',
        paramName: 'preBalance',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }],
        initialValue: modalVal.preBalance,
        ...colConfig
      }, {
        type: 'number',
        label: '年业务量',
        paramName: 'yearTotal',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.price }],
        initialValue: modalVal.yearTotal ? modalVal.yearTotal / 100 : modalVal.yearTotal,
        ...colConfig
      }, {
        type: 'number',
        label: '工程占比',
        paramName: 'yearProjPart',
        itemProps: {
          formatter: value => `${value}%`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.long }],
        initialValue: modalVal.yearProjPart,
        ...colConfig
      }, {
        type: 'number',
        label: '维保占比',
        paramName: 'yearWeibaoPart',
        itemProps: {
          formatter: value => `${value}%`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.long }],
        initialValue: modalVal.yearWeibaoPart,
        ...colConfig
      }, {
        type: 'number',
        label: '器材占比',
        paramName: 'yearQicaiPart',
        itemProps: {
          formatter: value => `${value}%`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.long }],
        initialValue: modalVal.yearQicaiPart,
        ...colConfig
      }, {
        type: 'number',
        label: '年工程可合作金额',
        paramName: 'yearProjCorp',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.price }],
        initialValue: modalVal.yearProjCorp ? modalVal.yearProjCorp / 100 : modalVal.yearProjCorp,
        labelCol: 8,
        wrapperCol: 16
      }, {
        type: 'number',
        label: '年维保可合作金额',
        paramName: 'yearWeibaoCorp',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.price }],
        initialValue: modalVal.yearWeibaoCorp ? modalVal.yearWeibaoCorp / 100 : modalVal.yearWeibaoCorp,
        labelCol: 8,
        wrapperCol: 16
      }, {
        type: 'number',
        label: '年器材可合作金额',
        paramName: 'yearQicaiCorp',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }, { ...config.reg.price }],
        initialValue: modalVal.yearQicaiCorp ? modalVal.yearQicaiCorp / 100 : modalVal.yearQicaiCorp,
        labelCol: 8,
        wrapperCol: 16
      }
    ];
  } else if (modalType == '分配给销售') {
    modalItems = [
      {
        type: 'select',
        label: '分配给销售人员',
        paramName: 'saleId',
        itemProps: {
          options: salesList
        },
        rules: [{ ...config.reg.required }],
        // disabled,
        span: 24,
        labelCol: 6,
        wrapperCol: 18
      }
    ];
  }

  let basicParams = {};
  if (userType == 'kefu') {
    basicParams.kefuId = userId;
  }
  if (userType == 'xiaoshou_mgr') {
    basicParams.salesMgrId = userId; // 查分配给自己的订单
    assignedStatus != 0 && (basicParams.salesId = assignedStatus); // 销售主管是否分配给销售人员 -1:已分配 -2:未分配
  }
  if (userType == 'xiaoshou') {
    basicParams.salesId = userId; // 查分配给自己的订单
    assignedStatus != 0 && (basicParams.memberId = assignedStatus); // 销售人员是否分配给会员 -1:已分配 -2:未分配
  }
  if (userType == 'huiyuan') {
    basicParams.memberId = userId;
  }

  let params = {
    searchItems,
    searchProps: { btnStyle: { marginTop: '15px' } },
    columns,
    modalWidth: modalType == '分配给销售' && 550,
    modalItems,
    headerShow: userType == 'kefu',
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSearchData: handleSearchData,
    handleSaveRequest: handleSaveRequest,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/order/potential/list', params: { ...basicParams } },
    addApi: { url: '/api/order/potential/create', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/order/potential', method: 'PUT' }
  };
  return (
    <div>
      <MobileHeader/>
      <Template {...params} ref={ref => f1 = ref}/>
    </div>
  );
};

export default IntentionToOrder;
