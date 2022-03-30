/**
 * 订单列表
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import cityData from '../listData/cityList.json';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';
import Template from '../Template';

let myForm, f1;
const OrderList = (props) => {
  let userType = localStorage.getItem('userType');

  let orderType = props.location.query.orderType;

  let [roleList, setRoleList] = useState([]);
  let [huiyuanList, setHuiyuanList] = useState([]);
  let [kefuList, setKefuList] = useState([]);
  let [salesList, setSalesList] = useState([]);

  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  let [keyList, setKeyList] = useState([]);
  let [provinceList, setProvinceList] = useState([]);
  let [cityList, setCityList] = useState([]);
  let [countyList, setCountyList] = useState([]);
  let [regionName, setRegionName] = useState({});

  let [printSetModalShow, setPrintSetModalShow] = useState(false);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        console.log('res', res)
        if (res && res.retcode == 0) {
          let list = []
          res.data.map(item => {
            list.push({ value: item.id, label: item.description, ...item })
          })
          setRoleList(list);
        }
      })

    let provinceList = [];
    cityData.map(item => {
      provinceList.push({ value: item.name, label: item.name, children: item.children });
    })
    setProvinceList(provinceList);

    userType == 'huiyuan' && getMyShoppingCart();
  }, [])

  // 获取购物车条目
  const getMyShoppingCart = () => {
    request({ url: '/api/shopping-cart/info', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.data.items.map(item => {
            list.push({ ...item, value: item.key, label: item.prod_name + item.sku_name });
          })
          setKeyList(list);
        }
      })
  }

  useEffect(() => {
    if (roleList.length) {
      roleList.map(item => {
        // 获取不同角色的人员列表
        if (item.name == 'huiyuan') {
          getUserList(item.id, setHuiyuanList);
        }
        if (item.name == 'kefu') {
          getUserList(item.id, setKefuList);
        }
        if (item.name == 'xiaoshou') {
          getUserList(item.id, setSalesList);
        }
      })
    }
  }, [roleList])

  const getUserList = (id, setType) => {
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { roleId: id, page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [{ value: '', label: '全部' }];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name })
          })
          setType(list);
        }
      })
  }

  const getDetail = (record) => {
    request({ url: '/api/order/info', method: 'POST', form: { orderid: record.oid, odids: JSON.stringify(record.odids) } })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);

          if (res.data.goodList && res.data.goodList.length && res.data.goodList[0].shippingsn) {
            myForm.props.form.setFieldsValue({
              shippingsn: [{ url: res.data.goodList[0].shippingsn, uid: 0, index: 0, type: 'imgList' }],
            })
          }
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    if (type == '打印') {
      setPrintSetModalShow(true);
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

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
  }

  const handleSearchData = (val) => {
    if (val.time && val.time.length) {
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
    if (val.receiptStatus == -2) {
      keyList.map(item => {
        if (val.keylist.indexOf(item.value) > -1) {
          // total += parseInt(item.price * 0.9) * item.number;
          total += (item.price * 0.9).toFixed(0) * item.number;
        }
      })
    } else {
      keyList.map(item => {
        if (val.keylist.indexOf(item.value) > -1) {
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
    let obj = { ...regionName };
    obj.province = e.props.children;

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      cityId: undefined,
      distinctId: undefined,
    })

    setRegionName(obj);
    setCountyList([]);

    for (let i = 0; i < cityData.length; i++) {
      if (cityData[i].name == val) {
        let cityList = [];
        cityData[i].children.map(item => {
          cityList.push({ ...item, value: item.name, label: item.name });
        })
        setCityList(cityList);
        break;
      }
    }
  }

  // 选择市获取区列表
  const onCityChange = (val, e) => {
    let obj = { ...regionName };
    obj.city = e.props.children;
    setRegionName(obj);

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      distinctId: undefined,
    })

    for (let i = 0; i < cityData.length; i++) {
      if (cityList[i].name == val) {
        let countyList = [];
        cityList[i].children.map(item => {
          countyList.push({ value: item.name, label: item.name });
        })
        setCountyList(countyList);
        break;
      }
    }
  }

  const onCountyChange = (val, e) => {
    let obj = { ...regionName };
    obj.distinct = e.props.children;
    setRegionName(obj);
  }

  const onPrint = (val) => {
    setModalBtnLoading(true);
    Download('/api/order/printOrder', {
      orderid: modalVal.oid,
      odids: JSON.stringify(modalVal.odids),
      ...val,
    }, 'POST', 'form', 'view')
    setModalBtnLoading(false);
    setPrintSetModalShow(false);
  }

  let searchItems = [
    {
      type: 'select',
      label: '订单状态',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 99, label: '全部' },
          { value: 1, label: '待发货' },
          { value: 2, label: '待收货' },
          { value: 3, label: '已发货' },
          { value: -2, label: '已退货' },
        ]
      },
      initialValue: 1,
    },
    {
      type: 'rangePicker',
      label: '时间',
      paramName: 'time',
      itemProps: {
        showTime: { format: 'HH:mm' },
        format: 'YYYY-MM-DD HH:mm'
      },
    }, {
      type: 'select',
      label: '会员',
      paramName: 'huiyuan_id',
      itemProps: {
        options: huiyuanList,
        showSearch: true
      },
    }, {
      type: 'select',
      label: '客服',
      paramName: 'kefu_id',
      itemProps: {
        options: kefuList
      },
    }, {
      type: 'select',
      label: '销售',
      paramName: 'sale_id',
      itemProps: {
        options: salesList
      },
    }, {
      type: 'select',
      label: '订单支付类型',
      paramName: 'payType',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 2, label: '账期' },
          { value: 1, label: '非账期' },
        ]
      },
    }
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    {
      title: '订单总额',
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (text) => (
        text && (text / 100).toFixed(2)
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
      title: '发货快递号',
      dataIndex: 'shippingsn',
      align: 'center',
      width: 180,
      render: (text) => (
        text && <img src={text} style={{ width: 'auto', maxWidth: '100%', height: '150px' }} />
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
        <img src={text} style={{ maxWidth: '100%', height: '120px' }} />
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
      rules: [{ ...config.reg.required }],
      disabled,
      span: 8,
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
      rules: [{ ...config.reg.required }],
      disabled,
      span: 6,
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
      rules: [{ ...config.reg.required }],
      disabled,
      span: 6,
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
          content: <div style={{ padding: '10px 0 0 20px' }}>
            <MyTable
              heightAuto={true}
              columns={modalColumns}
              pagination={true}
              dataSource={PublicService.transformArrayData(detail.goodList || [], true, true)}
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

  if (userType == 'caiwu') {
    basicParams.type = 1;
  }

  let params = {
    searchItems,
    columns,
    modalItems,
    headerShow: true,
    addBtnShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
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

  let printItems = [
    {
      type: 'radio',
      label: '是否显示金额',
      paramName: 'needPrice',
      itemProps: {
        options: [
          { value: 0, label: '否' },
          { value: 1, label: '是' },
        ],
      },
      rules: [{ ...config.reg.required }],
      span: 24,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'radio',
      label: '是否显示会员名',
      paramName: 'needMember',
      itemProps: {
        options: [
          { value: 0, label: '否' },
          { value: 1, label: '是' },
        ],
      },
      rules: [{ ...config.reg.required }],
      span: 24,
      labelCol: 6,
      wrapperCol: 18,
    }
  ];
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
      {
        printSetModalShow &&
        <FormModal
          width={'550px'}
          visible={printSetModalShow}
          items={printItems}
          modalBtnLoading={modalBtnLoading}
          title={'打印参数设置'}
          footerShow={true}
          saveTitle='打印'
          onModalSave={onPrint}
          onCancel={modalCancel.bind(this, 'printSetModalCancel')}
        />
      }
    </div>
  );
}

export default OrderList;
