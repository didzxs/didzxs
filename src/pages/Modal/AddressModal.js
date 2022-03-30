/**
 * 收货地址弹窗
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import config from '../../config';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';
import cityData from '../listData/cityList.json';

let myForm;
const AddressModal = (props) => {
  let { modalShow, onSelected, modalClose } = props;

  let [searchParams, setSearchParams] = useState({});

  let [addressList, setAddressList] = useState([]);
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [addAddressModalShow, setAddAddressModalShow] = useState(false);
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

  const onSearch = (page = 1) => {
    setTableLoading(true);
    request({ url: '/api/address/list', method: 'GET', params: { page, pageSize: 10000, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          setAddressList(res.data);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      })
  }

  const onSearchClick = (val) => {
    setSearchParams(val);
  }

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onModalShow = (setType) => {
    setType(true);
  }

  // 新增收货地址
  const onAddressSave = (val) => {
    setModalBtnLoading(true);

    val.provincename = regionName.provincename;
    val.cityname = regionName.cityname;
    val.distinctname = regionName.distinctname;
    
    request({ url: '/api/address/add', method: 'POST', form: val })
      .then(res => {
        if (res.retcode == 0) {
          onModalClose(setAddAddressModalShow);
          onSearch();
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  const onModalClose = (setType) => {
    setType(false);
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

  const onModalSave = () => {
    onSelected(selectedRows[0]);
    modalClose(false);
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let searchItems = [
    {
      type: 'input',
      label: '关键字',
      paramName: 'search',
    },
  ];

  let columns = [
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
  ];

  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys([selectedRowKeys[selectedRowKeys.length - 1]]);
      setSelectedRows([selectedRows[selectedRows.length - 1]]);
    },
  };

  let modalItems = [
    {
      type: 'blank',
      content: <div>
        <Filtrate items={searchItems} onSearch={onSearchClick} />
        <Container
          addBtn={onModalShow.bind(this, setAddAddressModalShow)}
        >
          <MyTable
            heightAuto={true}
            columns={columns}
            loading={tableLoading}
            pagination={false}
            rowSelection={rowSelection}
            dataSource={PublicService.transformArrayData(addressList, true, true)}
            scroll={{ y: 475 }}
            rowKey='id'
          />
        </Container>
      </div>,
      span: 24,
    }
  ];

  let colConfig = {
    labelCol: 7,
    wrapperCol: 17,
  };
  let modalItems1 = [
    {
      type: 'input',
      label: '收货人',
      paramName: 'username',
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'input',
      label: '手机号',
      paramName: 'mobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      ...colConfig
    }, {
      type: 'select',
      label: '地区',
      itemProps: {
        options: provinceList,
        onChange: onProvinceChange,
      },
      paramName: 'provincecode',
      placeholder: '请选择省',
      rules: [{...config.reg.required}],
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
      placeholder: '请选择市',
      rules: [{...config.reg.required}],
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
      placeholder: '请选择区',
      rules: [{...config.reg.required}],
      span: 6,
      labelCol: 0,
      wrapperCol: 24,
    }, {
      type: 'input',
      label: '详细地址',
      paramName: 'detail',
      rules: [{ ...config.reg.required }],
      span: 24,
      labelCol: 3,
      wrapperCol: 21,
    }, {
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
      ...colConfig
    }
  ];
  return (
    <div>
      <FormModal
        visible={modalShow}
        items={modalItems}
        title={'选择地址'}
        disabled={false}
        disabledType='readOnly'
        footerShow={true}
        saveTitle='确定'
        onModalSave={onModalSave}
        onCancel={modalCancel}
      />

      {
        addAddressModalShow &&
        <FormModal
          visible={addAddressModalShow}
          items={modalItems1}
          loading={modalBtnLoading}
          title={'新增地址'}
          wrappedComponentRef={ref => myForm = ref}
          disabled={false}
          disabledType='readOnly'
          footerShow={true}
          saveTitle='保存'
          onModalSave={onAddressSave}
          onCancel={onModalClose.bind(this, setAddAddressModalShow)}
        />
      }
    </div>
    
  );
}

export default AddressModal;