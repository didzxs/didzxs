/**
 * 商品收发明细表
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Template from '../Template';

const ProdSendAndReceiveDetailed = () => {

  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  useEffect(() => {
    // 获取商品分类
    request({ url: '/api/open/listProdCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            item.title = item.name;
            item.label = item.name;
            item.value = item.id;
            item.children = item.categories;
            item.children &&
              item.children.map((child) => {
                child.title = child.name;
                child.label = child.name;
                child.value = child.id;

                child.children = child.categories;
                child.children &&
                child.children.map(child1 => {
                  child1.title = child1.name;
                  child1.label = child1.name;
                  child1.value = child1.id;
                })
              })
          })

          setCategoryList(res.data);
        }
      })

    // sku列表
    request({ url: '/api/open/sku/list', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.prod_name + ' - ' + item.properties,
            })
          })
          setSkuList(list);
        }
      })
  }, [])

  const handleSearchData = (val) => {
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    return val;
  }

  const handleTableData = (res) => {
    res.page.list.map(item => {
      if (item.type == 2) {
        item.number = 0 - item.number;
        item.gouhuo_fee = 0 - item.gouhuo_fee;
      }
    })
    let total = {
      category_name: '合计：',
      out_number: res.summary.outNumber,
      out_cost_price: res.summary.outCost,
      in_number: res.summary.inNumber,
      in_cost_price: res.summary.inCost,
      kick_number: res.summary.kickNumber,
      kick_cost_price: res.summary.kickCost,
    };
    res.page.list.push(total);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'treeSelect',
      label: '商品分类',
      paramName: 'category_id',
      itemProps: {
        treeData: categoryList,
      },
    }, {
      type: 'select',
      label: 'sku',
      paramName: 'sku_id',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(skuList, 'value', 'label', true, true),
        style: { width: '240px' }
      },
    }, {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '请输入商品名称'
    }
  ];

  let columns = [
    { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120, fixed: 'left' },
    { title: '商品编号', dataIndex: 'sku_sn', align: 'center', width: 120, fixed: 'left' },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120, fixed: 'left' },
    { title: '规格型号', dataIndex: 'sku_name', align: 'center', width: 120 },
    { title: '日期', dataIndex: 'created_at', align: 'center', width: 140 },
    { title: '单据编号', dataIndex: 'origin_sn', align: 'center', width: 120 },
    {
      title: '业务类别',
      dataIndex: 'stype',
      align: 'center',
      width: 120,
      render: (text) => (
        {1: '采购', 2: '采购退回', 3: '销售', 4: '销售退回', 5: '其他入库', 6: '其他出库', 99: '商品创建导入'}[text]
      )
    },
    { title: '往来单位', dataIndex: 'organ_name', align: 'center', width: 120 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 120 },
    {
      title: '入库',
      children: [
        { title: '入库数量', dataIndex: 'in_number', align: 'center', width: 120 },
        { title: '单位成本', dataIndex: 'in_cost_price', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
        { title: '成本', dataIndex: 'in_cost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '出库',
      children: [
        { title: '出库数量', dataIndex: 'out_number', align: 'center', width: 120 },
        { title: '单位成本', dataIndex: 'out_cost_price', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
        { title: '成本', dataIndex: 'out_cost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '结存',
      children: [
        { title: '数量', dataIndex: 'kick_number', align: 'center', width: 120 },
        { title: '单位成本', dataIndex: 'kick_cost_price', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
        { title: '成本', dataIndex: 'kick_cost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    }
  ];

  let basicParams = {
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  }

  let params = {
    searchItems,
    columns,
    addBtnShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    // exportBtnShow: false,
    rowSelectionShow: false,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    handleSearchData: handleSearchData,
    // handleSorter: handleSorter,
    handleTableData: handleTableData,
    searchApi: { url: '/api/product/listProductDetail', params: { ...basicParams } },
    exportApi: { url: '/api/product/exportProductDetail', params: { ...basicParams } }
  }
  return (
    <div>
      <Template {...params} />
    </div>
  );
}

export default ProdSendAndReceiveDetailed;