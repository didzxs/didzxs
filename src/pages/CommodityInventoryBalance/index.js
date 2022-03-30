/**
 * 商品库存余额
 */

import React, { useState } from 'react';
import { Divider, Icon, message, Popconfirm, Button, Input } from 'antd';
import moment from 'moment';
import Template from '../Template';
import Util from '../../utils/Util';

let f1;
const CommodityInventoryBalance = () => {

  const handleSearchData = (val) => {
    if(val.createdAt) {
      val.createdAt = moment(val.createdAt).format('YYYY-MM-DD');
    }
    return val;
  }

  let searchItems = [
    {
      type: 'datePicker',
      label: '日期',
      paramName: 'createdAt',
      initialValue: moment()
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 100 },
    { title: '商品分类', dataIndex: 'category_name', align: 'center', width: 100 },
    { title: '规格', dataIndex: 'sku_name', align: 'center', width: 100 },
    { title: 'sku编号', dataIndex: 'sku_sn', align: 'center', width: 100 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 100 },
    { title: '数量', dataIndex: 'stores', align: 'center', width: 100 },
    {
      title: '单位成本',
      dataIndex: 'cost_price',
      align: 'center',
      width: 100,
      render: (text) => (
        Util.toFixed2(text / 100)
      )
    },
    {
      title: '成本',
      dataIndex: 'kick_cost',
      align: 'center',
      width: 100,
      render: (text) => (
        Util.toFixed2(text / 100)
      )
    },
  ];

  let basicParams = {
    createdAt: moment().format('YYYY-MM-DD'),
  };

  let params = {
    searchItems,
    columns,
    modalWidth: '550px',
    addBtnShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    handleSearchData,
    searchApi: { url: '/api/product/sku/listStore', params: { ...basicParams } },
    exportApi: { url: '/api/product/sku/exportStore', params: { ...basicParams } },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default CommodityInventoryBalance;