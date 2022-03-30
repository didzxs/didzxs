/**
 * 收货地址
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Container from '../../components/common/Container';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import cityData from '../listData/cityList.json';
import PublicService from '../../services/PublicService';

let myForm;
const ShippingAddress = () => {

  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);
  let [detail, setDetail] = useState({});
  let [searchParams, setSearchParams] = useState({});

  let [provinceList, setProvinceList] = useState([]);
  let [cityList, setCityList] = useState([]);
  let [countyList, setCountyList] = useState([]);
  let [regionName, setRegionName] = useState({});

  useEffect(() => {
    onSearch();

    let provinceList = [];
    cityData.map(item => {
      provinceList.push({value: item.id, label: item.name, children: item.children});
    })
    setProvinceList(provinceList);
  }, [])

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/address/list', method: 'GET', params: {page: 1, pageSize: 10000, ...searchParams} })
      .then(res => {
        if (res && res.retcode == 0) {
          setTableData(res.data);
          setTableLoading(false);
        }
      })
  }

  const onSearchClick = (val) => {
    setSearchParams(val);
  }

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onModalShow = (type, record) => {
    setModalVal(record);
    setModalTitle(type);
    setModalShow(true);
  }

  const onDelete = (id) => {
    request({ url: '/api/address/delete', method: 'POST', form: {aid: id} })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 设为默认地址
  const setDefaultAddress = (id) => {
    request({url: '/api/address/setdefault', method: 'POST', form: {id}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('设置成功！');
          onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  let [modalVal, setModalVal] = useState({});
  let [modalShow, setModalShow] = useState(false);
  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [modalTitle, setModalTitle] = useState();

  // 获取详情
  const getDetail = (id) => {
    request({ url: '/api/address/detail', method: 'GET', params: {aid: id} })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);
          
          let cityList = [], countyList = [];
          for(let i = 0; i < cityData.length; i++) {
            if(cityData[i].id == res.data.provincecode) {
              
              cityData[i].children.map(item => {
                cityList.push({...item, value: item.id, label: item.name});
              })
              setCityList(cityList);
              break;
            }
          }
          
          for(let j = 0; j < cityList.length; j++) {
            if(cityList[j].id == res.data.citycode) {
              cityList[j].children.map(item => {
                countyList.push({value: item.id, label: item.name});
              })
              setCountyList(countyList);
              break;
            }
          }
          let regionName = {
            provincename: res.data.provincename,
            cityname: res.data.cityname,
            distinctname: res.data.distinctname,
          }
          setRegionName(regionName);
        }
      })
  }

  useEffect(() => {
    if(modalShow) {
      modalTitle !== '新增' && getDetail(modalVal.id);
    }
  }, [modalShow])

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    val.provincename = regionName.provincename;
    val.cityname = regionName.cityname;
    val.distinctname = regionName.distinctname;

    let url = '/api/address/add';
    if(modalTitle == '编辑') {
      url = '/api/address/update';
      val.id = modalVal.id;
    }
    
    request({ url, method: 'POST', form: val })
      .then(res => {
        if (res.retcode == 0) {
          modalCancel(setModalShow, 'modalShow');
          onSearch();
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }
  const modalCancel = (setTypeCancel, type) => {
    setTypeCancel(false);
    if (type == 'modalShow') {
      setDetail({});
    }
  }

  // 选择省获取市列表
  const onProvinceChange = (val, e) => {
    let obj = {...regionName};
    obj.provincename = e.props.children;

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      citycode: undefined,
      distinctcode: undefined,
    })

    setRegionName(obj);
    setCountyList([]);

    for(let i = 0; i < cityData.length; i++) {
      if(cityData[i].id == val) {
        let cityList = [];
        cityData[i].children.map(item => {
          cityList.push({...item, value: item.id, label: item.name});
        })
        setCityList(cityList);
        break;
      }
    }
  }

  // 选择市获取区列表
  const onCityChange = (val, e) => {
    let obj = {...regionName};
    obj.cityname = e.props.children;
    setRegionName(obj);

    let { setFieldsValue } = myForm.props.form;
    setFieldsValue({
      distinctcode: undefined,
    })

    for(let i = 0; i < cityData.length; i++) {
      if(cityList[i].id == val) {
        let countyList = [];
        cityList[i].children.map(item => {
          countyList.push({value: item.id, label: item.name});
        })
        setCountyList(countyList);
        break;
      }
    }
  }

  const onCountyChange = (val, e) => {
    let obj = {...regionName};
    obj.distinctname = e.props.children;
    setRegionName(obj);
  }

  const renderModal = () => {
    let disabled = modalTitle == '查看';
    let colConfig = {
      labelCol: 7,
      wrapperCol: 17,
    };

    let modalItems = [
      {
        type: 'input',
        label: '收货人',
        paramName: 'username',
        rules: [{ ...config.reg.required }],
        initialValue: detail.username,
        ...colConfig
      }, {
        type: 'input',
        label: '手机号',
        paramName: 'mobile',
        rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
        initialValue: detail.mobile,
        ...colConfig
      }, {
        type: 'select',
        label: '地区',
        itemProps: {
          options: provinceList,
          onChange: onProvinceChange,
        },
        paramName: 'provincecode',
        initialValue: detail.provincecode && detail.provincecode * 1,
        placeholder: '请选择省',
        rules: [{...config.reg.required}],
        disabled,
        span: 10,
        labelCol: 8,
        wrapperCol: 16,
      }, {
        type: 'select',
        label: '',
        itemProps: {
          options: cityList,
          onChange: onCityChange,
        },
        paramName: 'citycode',
        initialValue: detail.citycode && detail.citycode * 1,
        placeholder: '请选择市',
        rules: [{...config.reg.required}],
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
        paramName: 'distinctcode',
        initialValue: detail.distinctcode && detail.distinctcode * 1,
        placeholder: '请选择区',
        rules: [{...config.reg.required}],
        disabled,
        span: 6,
        labelCol: 0,
        wrapperCol: 24,
      }, {
        type: 'input',
        label: '详细地址',
        paramName: 'detail',
        rules: [{ ...config.reg.required }],
        initialValue: detail.detail,
        span: 24,
        labelCol: 3,
        wrapperCol: 21,
      },
      ...(
        modalTitle == '新增' &&
        [{
          type: 'select',
          label: '设为默认地址',
          paramName: 'isDefault',
          rules: [{ ...config.reg.required }],
          itemProps: {
            options: [
              { value: 1, label: '是' },
              { value: 0, label: '否' },
            ]
          },
          initialValue: detail.isdefault,
          ...colConfig
        }] || []
      )
    ];
    return (
      <FormModal
        className='shipping-address-modal'
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={modalTitle}
        disabled={disabled}
        footerShow={!disabled}
        onModalSave={onModalSave}
        onCancel={modalCancel.bind(this, setModalShow, 'modalShow')}
      />
    )
  }

  let searchItems = [
    {
      type: 'input',
      label: '关键字',
      paramName: 'search',
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '收货人', dataIndex: 'username', align: 'center', width: 100 },
    { title: '联系电话', dataIndex: 'mobile', align: 'center', width: 100 },
    {
      title: '地区',
      dataIndex: 'provincename',
      align: 'center',
      width: 180,
      render: (text, record) => (
        text + record.cityname + record.distinctname
      )
    },
    { title: '详细地址', dataIndex: 'detail', align: 'center', width: 200 },
    {
      title: '是否为默认地址',
      dataIndex: 'isdefault',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '不是', 1: '是'}[text]
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          {
            !record.isdefault &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否设为默认地址?"
                onConfirm={setDefaultAddress.bind(this, text)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>设为默认地址</a>
              </Popconfirm>
            </>
          }
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

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} />
      <Container
        heightAuto={true}
        addBtn={onModalShow.bind(this, "新增", {})}
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
        />
      </Container>

      {modalShow && renderModal()}
    </div>
  );
}

export default ShippingAddress;