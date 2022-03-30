/**
 * 订单列表
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm, InputNumber } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import cityData from '../listData/cityList.json';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Util from '../../utils/Util';
import Template from '../Template';

let myForm, f1;
const OrderList = () => {
  let userType = localStorage.getItem('userType');

  let [roleList, setRoleList] = useState([]);
  let [huiyuanList, setHuiyuanList] = useState([]);
  let [kefuList, setKefuList] = useState([]);
  let [salesList, setSalesList] = useState([]);

  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});
  let [goodList, setGoodList] = useState([]);

  let [provinceList, setProvinceList] = useState([]);
  let [cityList, setCityList] = useState([]);
  let [countyList, setCountyList] = useState([]);

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

  }, [])

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
          
          res.data.goodList.map(item => {
            item.price = Util.toFixed2(item.price / 100);
          })
          setGoodList(res.data.goodList);

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
    setGoodList([]);
  }

  const handleSearchData = (val) => {
    if (val.time && val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD HH:mm:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD HH:mm:59');

      delete val.time;
    }
    return val;
  }

  let handleSaveData = () => {
    let data = {};
    if (modalVal.oid) {
      data.orderid = modalVal.oid;
    }

    let list = [];
    goodList.map(item => {
      list.push([item.odid, item.number, Util.toFixed0(item.price * 100)]);
    })

    data.odItems = JSON.stringify(list);

    return data;
  }

  const onPriceChang = (index, val) => {
    let list = [...goodList];

    list.map((item, i) => {
      if(i == index) {
        item.price = val;
      }
    })
    setGoodList(list);
  }

  let searchItems = [
    {
      type: 'select',
      label: '订单状态',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 0, label: '待付款' },
          { value: 1, label: '待发货' },
        ]
      },
      initialValue: 0
    },
    {
      type: 'rangePicker',
      label: '时间',
      paramName: 'time',
      itemProps: {
        showTime: { format: 'HH:mm' },
        format: 'YYYY-MM-DD HH:mm'
      },
    },
    ...(
      (userType == 'admin' || userType == 'xiaoshou_mgr' || userType == 'xiaoshou_sz') &&
      [{
        type: 'select',
        label: '会员',
        paramName: 'huiyuan_id',
        itemProps: {
          options: huiyuanList,
          showSearch: true,
        },
      }] || []
    ),
    ...(
      (userType == 'admin') &&
      [{
        type: 'select',
        label: '客服',
        paramName: 'kefu_id',
        itemProps: {
          options: kefuList
        },
      }] || []
    ),
    ...(
      (userType == 'admin' || userType == 'kefu') &&
      [{
        type: 'select',
        label: '销售',
        paramName: 'sale_id',
        itemProps: {
          options: salesList
        },
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
      width: 150,
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
    {
      title: '发货快递号',
      dataIndex: 'shippingsn',
      align: 'center',
      width: 180,
      render: (text) => (
        <img src={text} style={{ width: 'auto', maxWidth: '100%', height: '150px' }} />
      )
    },
    {
      title: '操作',
      dataIndex: 'oid',
      align: 'center',
      width: 100,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "查看", record)}>查看</a>
          {
            (userType == 'xiaoshou_sz' || userType == 'xiaoshou_mgr') &&
            <>
              <Divider type='vertical' />
              <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
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

  let disabled = true;

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
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onPriceChang.bind(this, index)} min={0} disabled={modalType == '查看'} />
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
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '收货人电话',
      paramName: 'shippingmobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      initialValue: detail.om && detail.om.shippingmobile,
      disabled,
      ...colConfig
    }, {
      type: 'select',
      label: '地区',
      itemProps: {
        options: provinceList,
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
      disabled,
      ...colConfig
    },
    {
      type: 'input',
      label: '商品数量',
      paramName: 'number',
      initialValue: detail.number,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '订单总额',
      paramName: 'total',
      initialValue: detail.total ? Util.toFixed2(detail.total / 100) : detail.total,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '订单编号',
      paramName: 'address',
      initialValue: detail.om && detail.om.ordersn,
      disabled,
      ...colConfig
    }, {
      type: 'input',
      label: '订单创建时间',
      paramName: 'ctime',
      initialValue: detail.om && detail.om.ctime,
      disabled,
      ...colConfig
    }, {
      type: 'imgUpload',
      label: '发货快递号',
      paramName: 'shippingsn',
      // data: { token },
      uploadButtonShow: false,
      // required: true,
      disabled,
      ...colConfig
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 0 20px' }}>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData(goodList || [], true, true)}
        />
      </div>,
      span: 24,
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: detail.om && detail.om.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }
  ];

  let basicParams = {};

  if (userType == 'xiaoshou_sz' || userType == 'xiaoshou_mgr') {
    basicParams.type = 0;
    // basicParams.kefu_id = userId;
  }

  let params = {
    searchItems,
    columns,
    modalItems,
    headerShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSearchData: handleSearchData,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/order/list', params: basicParams },
    editApi: { url: '/api/order/changePrice', method: 'POST', dataType: 'form' },
  }

  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default OrderList;