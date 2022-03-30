/**
 * 库存管理
 */

import React, { useEffect, useState } from 'react';
import request from '../../utils/request';
import Template from '../Template';

let f1;
const UnsoldGoodsWarning = () => {
  let [categoryList, setCategoryList] = useState([]);

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
  }, [])

  let searchItems = [
    {
      type: 'input',
      label: '关键字',
      paramName: 'search',
    }, {
      type: 'treeSelect',
      label: '商品分类',
      paramName: 'categoryId',
      itemProps: {
        treeData: categoryList
      },
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120 },
    { title: '商品分类', dataIndex: 'category_name', align: 'center', width: 100 },
    { title: 'sku名称', dataIndex: 'sku_name', align: 'center', width: 120 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 100 },
    { title: '滞销阈值的月份', dataIndex: 'sale_threshold_month', align: 'center', width: 100 },
    { title: '滞销阈值数量', dataIndex: 'sale_threshold_number', align: 'center', width: 100 },
  ];

  let params = {
    searchItems,
    columns,
    headerShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    searchApi: { url: '/api/product/listStoreUnsaleable' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default UnsoldGoodsWarning;