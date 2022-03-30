/**
 * 商品规格
 */
import React, { useState } from 'react';
import { Divider, Icon, message, Popconfirm, Button, Input } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Template from '../Template';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';

let f1;
const CommodityProperty = () => {

  let [modalVal, setModalVal] = useState({});
  let [propTableData, setPropTableData] = useState([]);

  const onDelete = (id) => {
    request({url: `/api/prod/spec/${id}`, method: 'DELETE'})
      .then(res => {
        if(res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onModalShow = (type, record) => {
    let arr = record.propValues.split(',');
    let propTableData = [];
    arr.map((item, index) => {
      propTableData.push({propValue: item, key: index});
    })
    setModalVal(record);
    setPropTableData(propTableData);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const modalCancel = () => {
    setModalVal({});
    setPropTableData([]);
  }

  let handleSaveData = (val) => {
    if(!propTableData.length) {
      message.warning('至少保存一个属性值！');
      return false;
    }

    if(modalVal.id) {
      val.id = modalVal.id;
    }

    let list = [...propTableData];
    list.map(item => {
      delete item.key;
      delete item.num;
    })
    val.prodPropValues = list;

    return val;
  }

  let searchItems = [
    {
      type: 'input',
      label: '关键字查询',
      paramName: 'propName'
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '品牌属性名称', dataIndex: 'prop_name', align: 'center', width: 100 },
    { title: '属性值', dataIndex: 'propValues', align: 'center', width: 300 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          <Divider type='vertical'/>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  const onAddItem = () => {
    setPropTableData([...propTableData, {key: propTableData.length}]);
  }

  const onDeleteItem = (key) => {
    let list = [...propTableData];
    list.map((item, index) => {
      if(item.key == key) {
        list.splice(index, 1);
      }
    })
    setPropTableData(list);
  }

  const onInputChange = (index, e) => {
    let list = [...propTableData];
    list.map((item, idx) => {
      if(idx == index) {
        item.propValue = e.target.value;
      }
    })
    setPropTableData(list);
  }

  let colConfig = {
    span: 24,
    labelCol: 6,
    wrapperCol: 18,
  };

  let modalColumns = [
    {
      title: '属性值',
      dataIndex: 'propValue',
      align: 'center',
      width: 180,
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index)} />
      )
    },
    {
      title: '操作',
      dataIndex: 'key',
      align: 'center',
      width: 80,
      render: (text, record) => (
        <>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDeleteItem.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let modalItems = [
    {
      type: 'input',
      label: '品牌属性名称',
      paramName: 'propName',
      rules: [{...config.reg.required}],
      initialValue: modalVal.prop_name,
      ...colConfig
    }, {
      type: 'blank',
      content: <div style={{padding: '10px 0 0 20px'}}>
        <Button onClick={onAddItem}>+ 新增</Button><p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData(propTableData, true, true)}
          scroll={{y: '400px'}}
        />
      </div>,
      span: 24
    },
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    modalWidth: '550px',
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    modalCancel,
    searchApi: {url: '/api/prod/spec/page', pageType: 1},
    addApi: {url: '/api/prod/spec', method: 'POST'},
    editApi: {url: '/api/prod/spec', method: 'PUT'},
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default CommodityProperty;