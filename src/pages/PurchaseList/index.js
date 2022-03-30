/**
 * 采购明细表
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';  
import PublicService from '../../services/PublicService';
import Template from '../Template';

let f1;
const PurchaseList = () => {

  let [supplierList, setSupplierList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  useEffect(() => {
    // 供应商
    request({url: '/api/supplier/list', method: 'GET', params: {page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.name,
            })
          })
          setSupplierList(list);
        }
      })
    // 获取商品分类
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
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
    request({url: '/api/open/sku/list', method: 'GET', params: {page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
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

  // 处理表格排序数据
  const handleSorter = (sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { operated_at: 1, gouhuo_fee: 2 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  const handleTableData = (res) => {
    res.page.list.map(item => {
      if(item.type == 2) {
        item.number = 0 - item.number;
        item.gouhuo_fee = 0 - item.gouhuo_fee;
      }
    })
    let total = {
      operated_at: '合计：',
      number: res.summary.numberTotal,
      gouhuo_fee: res.summary.gouhuoTotal,
      caigou_fee: res.summary.caigouTotal,
    };
    res.page.list.push(total);
  }

  let searchItems = [
    {
      type: 'select',
      label: '供应商',
      paramName: 'supplierId',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
      },
    }, {
      type: 'treeSelect',
      label: '商品分类',
      paramName: 'categoryId',
      itemProps: {
        treeData: categoryList,
      },
    }, {
      type: 'select',
      label: 'sku',
      paramName: 'skuId',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(skuList, 'value', 'label', true, true),
        style: { width: '240px' }
      },
    }, {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    },
  ];

  let columns = [
    { title: '采购日期', dataIndex: 'operated_at', align: 'center', width: 140, fixed: 'left', sorter: true },
    { title: '采购单编号', dataIndex: 'sn_self', align: 'center', width: 120, fixed: 'left' },
    {
      title: '业务类别',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      fixed: 'left',
      render: (text) => (
        {1: '购货', 2: '退货'}[text]
      )
    },
    { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 150 },
    { title: '商品编号', dataIndex: 'prod_id', align: 'center', width: 120 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120 },
    { title: '规格型号', dataIndex: 'sku_name', align: 'center', width: 120 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 120 },
    // { title: '仓库', dataIndex: 'warehouse', align: 'center', width: 120 },
    { title: '数量', dataIndex: 'number', align: 'center', width: 120 },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '采购金额',
      dataIndex: 'gouhuo_fee',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '采购费用',
      dataIndex: 'caigou_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '整单备注', dataIndex: 'comment', align: 'center', width: 220 },
  ];

  let basicParams = {
    startTime: moment().format('YYYY-01-01'),
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
    handleSorter: handleSorter,
    handleTableData: handleTableData,
    searchApi: { url: '/api/caigou/listDetail', params: { ...basicParams } },
    exportApi: { url: '/api/caigou/exportDetail', params: { ...basicParams } }
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default PurchaseList;