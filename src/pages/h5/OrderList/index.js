/**
 * 订单列表
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import moment from 'moment';
import request from '../../../utils/request';
import config from '../../../config';
import cityData from '../../listData/cityList.json';
import MyTable from '../../../components/common/MyTable';
import FormModal from '../../../components/common/FormModal';
import PublicService from '../../../services/PublicService';
import Download from '../../../utils/Download';
import Util from '../../../utils/Util';
import Template from '../../Template';
import MobileHeader from '../components/MobileHeader';

let myForm, f1;
const OrderList = (props) => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let orderType = props.location.query.orderType;
  
  let [roleList, setRoleList] = useState([]);
  let [huiyuanList, setHuiyuanList] = useState([]);
  
  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});

  let [modalShow, setModalShow] = useState(false); // 销售确定退单弹窗
  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [needFreight, setNeedFreight] = useState();

  let [keyList, setKeyList] = useState([]);
  let [provinceList, setProvinceList] = useState([]);
  let [cityList, setCityList] = useState([]);
  let [countyList, setCountyList] = useState([]);
  let [regionName, setRegionName] = useState({});

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

    let provinceList = [];
    cityData.map(item => {
      provinceList.push({value: item.name, label: item.name, children: item.children});
    })
    setProvinceList(provinceList);

    userType == 'huiyuan' && getMyShoppingCart();
  }, [])

  // 获取购物车条目
  const getMyShoppingCart = () => {
    request({url: '/api/shopping-cart/info', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.data.items.map(item => {
            list.push({...item, value: item.key, label: item.prod_name + item.sku_name});
          })
          setKeyList(list);
        }
      })
  }

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        // 获取不同角色的人员列表
        if(item.name == 'huiyuan') {
          getUserList(item.id, setHuiyuanList);
        }
      })
    }
  }, [roleList])

  const getUserList = (id, setType) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {roleId: id, page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [{value: '', label: '全部'}];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name })
          })
          setType(list);
        }
      })
  }

  const getDetail = (record) => {
    request({url: '/api/order/info', method: 'POST', form: {orderid: record.oid, odids: JSON.stringify(record.odids)}})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);

          if(res.data.goodList && res.data.goodList.length && res.data.goodList[0].shippingsn) {
            myForm.props.form.setFieldsValue({
              shippingsn: [{ url: res.data.goodList[0].shippingsn, uid: 0, index: 0, type: 'imgList' }],
            })
          }
        }
      })
  }

  // 销售确认退单
  const onChargebackModalSave = (val) => {
    setModalBtnLoading(true);
    request({url: '/api/order/return/salesCheck', method: 'POST', form: {orderId: modalVal.oid, retFee: val.retFee ? val.retFee * 100 : ''}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          setModalBtnLoading(false);
          modalCancel('chargebackModalCancel');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 确认退单 仓库、财务
  const onAffirmChargeback = (record) => {
    let url = '';
    if(userType == 'cangku' || userType == 'cangku_qt') {
      url = '/api/order/return/cangkuCheck';
    } else if(userType == 'caiwu') {
      url = '/api/order/return/caiwuCheck';
    }
    request({url, method: 'POST', form: {orderId: record.oid}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 客服确认订单
  const onConfirmOrder = (record) => {
    request({url: '/api/order/confirmPay', method: 'POST', form: {orderId: record.oid}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('确认成功！');
          f1.onSearch();
        }
      })
  }

  const onKefuCancelOrder = (record) => {
    request({url: '/api/order/kefuCancel', method: 'POST', form: {orderId: record.oid}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('取消成功！');
          f1.onSearch();
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    if(type == '确认退单') {
      setModalShow(true);
      return;
    }

    f1.onModalShow && f1.onModalShow(type, record);
    getDetail(record);
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const getModalType = (type) => {
    setModalType(type);
  }

  const modalCancel = (type) => {
    if(type == 'chargebackModalCancel') {
      setModalShow(false);
      return;
    }
    setModalVal({});
    setDetail({});
  }

  const handleSearchData = (val) => {
    if(val.time && val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD HH:mm:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD HH:mm:59');

      delete val.time;
    }
    return val;
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }

    let total = 0;
    // 不开票减10%
    if(val.receiptStatus == -2) {
      keyList.map(item => {
        if(val.keylist.indexOf(item.value) > -1) {
          // total += parseInt(item.price * 0.9) * item.number;
          total += (item.price * 0.9).toFixed(0) * item.number;
        }
      })
    } else {
      keyList.map(item => {
        if(val.keylist.indexOf(item.value) > -1) {
          total += item.price * item.number;
        }
      })
    }

    val.keylist = JSON.stringify(val.keylist);
    val.frontTotal = total;

    return val;
  }

  // 选择省获取市列表
  const onProvinceChange = (val, e) => {
    let obj = {...regionName};
    obj.province = e.props.children;

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      cityId: undefined,
      distinctId: undefined,
    })

    setRegionName(obj);
    setCountyList([]);

    for(let i = 0; i < cityData.length; i++) {
      if(cityData[i].name == val) {
        let cityList = [];
        cityData[i].children.map(item => {
          cityList.push({...item, value: item.name, label: item.name});
        })
        setCityList(cityList);
        break;
      }
    }
  }

  // 选择市获取区列表
  const onCityChange = (val, e) => {
    let obj = {...regionName};
    obj.city = e.props.children;
    setRegionName(obj);

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      distinctId: undefined,
    })

    for(let i = 0; i < cityData.length; i++) {
      if(cityList[i].name == val) {
        let countyList = [];
        cityList[i].children.map(item => {
          countyList.push({value: item.name, label: item.name});
        })
        setCountyList(countyList);
        break;
      }
    }
  }

  const onCountyChange = (val, e) => {
    let obj = {...regionName};
    obj.distinct = e.props.children;
    setRegionName(obj);
  }

  const onNeedFreightChange = (val) => {
    setNeedFreight(val);
  }

  let searchItems = [
    // {
    //   type: 'rangePicker',
    //   label: '时间',
    //   paramName: 'time',
    //   itemProps: {
    //     showTime: {format: 'HH:mm'},
    //     format: 'YYYY-MM-DD HH:mm',
    //   },
    //   span: 12
    // }, 
    {
      type: 'select',
      label: '收款状态',
      paramName: 'payStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未收款' },
          { value: 1, label: '部分收款' },
          { value: 2, label: '全部收款' },
        ],
      },
      span: 12
    }, {
      type: 'input',
      label: '备注关键字',
      paramName: 'search',
      span: 12
    },
    ...(
      (userType == 'admin' || userType == 'kefu' || userType == 'xiaoshou') &&
      [{
        type: 'select',
        label: '会员',
        paramName: 'huiyuan_id',
        itemProps: {
          options: huiyuanList,
          showSearch: true
        },
        span: 12
      }] || []
    ),
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    {
      title: '订单总额',
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (text) => (
        text && Util.toFixed2(text / 100)
      )
    },
    { title: '总sku数量', dataIndex: 'number', align: 'center', width: 100 },
    {
      title: '订单编号',
      dataIndex: 'om',
      align: 'center',
      width: 150,
      render: (text) => (
        text && text.ordersn
      )
    },
    {
      title: '订单创建时间',
      dataIndex: 'ctime',
      align: 'center',
      width: 120,
      render: (text, record) => (
        record.om && record.om.ctime
      )
    },
    {
      title: '实际收款额',
      dataIndex: 'payed',
      align: 'center',
      width: 100,
      render: (text, record) => (
        record.om && record.om.payed && Util.toFixed2(record.om.payed / 100)
      )
    },
    ...(
      userType != 'huiyuan' &&
      [{
        title: '会员名称',
        dataIndex: 'member_name',
        align: 'center',
        width: 120,
        render: (text, record) => (
          record.om && record.om.member_name
        )
      }] || []
    ),
    ...(
      orderType == -2 &&
      [{
        title: '退货运费',
        dataIndex: 'ret_fee',
        align: 'center',
        width: 100,
        render: (text, record) => (
          record.om && (record.om.ret_fee ? record.om.ret_fee / 100 : record.om.ret_fee)
        )
      }] || []
    ),
    {
      title: '订单状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '待付款', 1: '待发货', 2: '待收货', 3: '已发货', '-2': '已退货'}[text]
      )
    },
    {
      title: '发货快递号',
      dataIndex: 'shippingsn',
      align: 'center',
      width: 180,
      render: (text) => (
        <img src={text} style={{width: 'auto', maxWidth: '100%', height: '150px'}} />
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      align: 'center',
      width: 180,
      render: (text, record) => (
        record.om && record.om.comment
      )
    },
    {
      title: '操作',
      dataIndex: 'oid',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
          {
            // 销售商支 || 销售主管确认/取消status=0的订单
            (userType == 'xiaoshou_sz' || userType == 'xiaoshou_mgr') && record.status == 0 &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="确认订单已支付?"
                onConfirm={onConfirmOrder.bind(this, record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a style={{ color: 'red' }}>确认订单</a>
              </Popconfirm>
              <Divider type='vertical' />
              <Popconfirm
                title="是否取消订单?"
                onConfirm={onKefuCancelOrder.bind(this, record)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a style={{ color: 'red' }}>取消订单</a>
              </Popconfirm>
            </>
          }
          {
            record.status == -2 && userType != 'huiyuan' && props.location.pathname.indexOf('TD') > -1 &&
            <>
              <Divider type='vertical' />
              {
                userType == 'xiaoshou' ?
                <a style={{ color: 'red' }} onClick={onModalShow.bind(this, '确认退单', record)}>确认退单</a>
                :
                <Popconfirm
                  title="是否确认退单?"
                  onConfirm={onAffirmChargeback.bind(this, record)}
                  icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                  <a style={{ color: 'red' }}>确认退单</a>
                </Popconfirm>
              }
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

  let disabled = false;

  let modalColumns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 40 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 100 },
    { title: '规格', dataIndex: 'pname', align: 'center', width: 100 },
    {
      title: '商品图片',
      dataIndex: 'pic',
      align: 'center',
      width: 150,
      render: (text) => (
        <img src={text} style={{maxWidth: '100%', height: '120px'}} />
      )
    },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'center',
      width: 100,
      render: (text) => (
        text && (text / 100).toFixed(2)
      )
    },
    { title: '数量', dataIndex: 'number', align: 'center', width: 100 },
  ];

  let modalItems = [
    {
      type: 'input',
      label: '收货人姓名',
      paramName: 'shippingusername',
      rules: [{ ...config.reg.required }],
      initialValue: detail.om && detail.om.shippingusername,
      ...colConfig
    }, {
      type: 'input',
      label: '收货人电话',
      paramName: 'shippingmobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.om && detail.om.shippingmobile,
      ...colConfig
    }, {
      type: 'select',
      label: '地区',
      itemProps: {
        options: provinceList,
        onChange: onProvinceChange,
      },
      paramName: 'province',
      initialValue: detail.om && detail.om.province,
      placeholder: '请选择省',
      rules: [{...config.reg.required}],
      disabled,
      span: 24,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'select',
      label: '',
      itemProps: {
        options: cityList,
        onChange: onCityChange,
      },
      paramName: 'city',
      initialValue: detail.om && detail.om.city,
      placeholder: '请选择市',
      rules: [{...config.reg.required}],
      disabled,
      span: 12,
      labelCol: 0,
      wrapperCol: 24,
    }, {
      type: 'select',
      label: '',
      itemProps: {
        options: countyList,
        onChange: onCountyChange,
      },
      paramName: 'distinct',
      initialValue: detail.om && detail.om.distinctname,
      placeholder: '请选择区',
      rules: [{...config.reg.required}],
      disabled,
      span: 12,
      labelCol: 0,
      wrapperCol: 24,
    }, {
      type: 'input',
      label: '地址',
      paramName: 'address',
      rules: [{ ...config.reg.required }],
      initialValue: detail.om && detail.om.address,
      ...colConfig
    },
    ...(
      modalType == '新增' &&
      [{
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
        ...colConfig
      }, {
        type: 'select',
        label: '购物车条目',
        paramName: 'keylist',
        itemProps: {
          options: keyList,
          mode: 'multiple'
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.keylist,
        ...colConfig
      }, {
        type: 'select',
        label: '订单支付类型',
        paramName: 'payType',
        itemProps: {
          options: [
            { value: 1, label: '非帐期订单' },
            { value: 2, label: '帐期订单' },
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.payType || 1,
        labelCol: 6,
        wrapperCol: 18,
      }, {
        type: 'select',
        label: '订单商品类型',
        paramName: 'goodsType',
        itemProps: {
          options: [
            { value: 1, label: '材料订单' },
            { value: 2, label: '工程订单' },
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.goodsType || 1,
        labelCol: 6,
        wrapperCol: 18,
      }, {
        type: 'select',
        label: '订单区域类型',
        paramName: 'regionType',
        itemProps: {
          options: [
            { value: 1, label: '国内订单' },
            { value: 2, label: '外贸订单' },
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: detail.regionType || 1,
        labelCol: 6,
        wrapperCol: 18,
      }, {
        type: 'input',
        label: '名称',
        paramName: 'printName',
        ...colConfig
      }] || []
    ), 
    ...(
      modalType == '查看' &&
      [
        {
          type: 'input',
          label: '商品数量',
          paramName: 'number',
          initialValue: detail.number,
          ...colConfig
        }, {
          type: 'input',
          label: '订单总额',
          paramName: 'total',
          initialValue: detail.total ? detail.total / 100 : detail.total,
          ...colConfig
        }, {
          type: 'input',
          label: '订单编号',
          paramName: 'address',
          initialValue: detail.om && detail.om.ordersn,
          ...colConfig
        }, {
          type: 'input',
          label: '订单创建时间',
          paramName: 'ctime',
          initialValue: detail.om && detail.om.ctime,
          ...colConfig
        }, {
          type: 'imgUpload',
          label: '发货快递号',
          paramName: 'shippingsn',
          // data: { token },
          uploadButtonShow: false,
          required: true,
          ...colConfig
        }, 
        ...(
          orderType == -2 &&
          [
            {
              type: 'input',
              label: '退货运费',
              paramName: 'ret_fee',
              initialValue: detail.om && (detail.om.ret_fee ? detail.om.ret_fee / 100 : detail.om.ret_fee),
              ...colConfig
            }
          ] || []
        ),
        {
          type: 'blank',
          content: <div>
            <MyTable
              heightAuto={true}
              columns={modalColumns}
              pagination={true}
              dataSource={PublicService.transformArrayData(detail.goodList || [], true, true)}
              scroll={{x: 'max-width'}}
            />
          </div>,
          span: 24,
        }
      ] || []
    ), {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: detail.om && detail.om.comment,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }
  ];

  let basicParams = {};

  // 销售主管可以查看退货单、确认订单页面 -2：退单  0：确认订单
  if(userType == 'xiaoshou_mgr') {
    basicParams.type = orderType;
  }
  if(userType == 'xiaoshou') {
    basicParams.type = -2;
    basicParams.sale_id = userId;
    basicParams.retStatus = 1;
  }

  let params = {
    searchItems,
    searchProps: {btnStyle: {marginTop: '25px'}},
    columns,
    modalItems,
    headerShow: false,
    addBtnShow: userType == 'huiyuan',
    editBtnShow: false,
    deleteBtnShow: false,
    // exportBtnShow: false,
    rowSelectionShow: false,
    handleSearchData: handleSearchData,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/order/list', params: basicParams },
    addApi: { url: '/api/order/create', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/user/updateMember', method: 'POST', dataType: 'form' },
    exportApi: { url: '/api/order/export', params: { ...basicParams } }
  }

  let chargebackItems = [
    {
      type: 'select',
      label: '是否需要退货运费',
      paramName: 'need',
      itemProps: {
        options: [
          { value: 0, label: '否' },
          { value: 1, label: '是' },
        ],
        onSelect: onNeedFreightChange
      },
      initialValue: 0,
      span: 24,
      labelCol: 6,
      wrapperCol: 18,
    },
    ...(
      needFreight == 1 &&
      [{
        type: 'number',
        label: '退货运费',
        paramName: 'retFee',
        itemProps: {
          formatter: value => `${value}元`
        },
        rules: [{ ...config.reg.required }],
        span: 24,
        labelCol: 6,
        wrapperCol: 18,
      }] || []
    )
  ];

  return (
    <div>
      <MobileHeader />
      <Template {...params} ref={ref => f1 = ref} />
      {
        modalShow &&
        <FormModal
          width={'550px'}
          visible={modalShow}
          items={chargebackItems}
          modalBtnLoading={modalBtnLoading}
          title={'确定退单'}
          footerShow={true}
          onModalSave={onChargebackModalSave}
          onCancel={modalCancel.bind(this, 'chargebackModalCancel')}
        />
      }
    </div>
  );
}

export default OrderList;