/**
 * 销售明细表
 *
 * 销售只能查自己的数据，根据userId过滤
 * 销售不能查看毛利等信息
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Template from '../Template';
import Util from '../../utils/Util';

const AccountForSales = () => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let basicParams = {
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
    payType: 1, // 订单支付类型: 1 非帐期订单；2 帐期订单； 默认1
  }

  let [memberList, setMemberList] = useState([]);
  let [saleList, setSaleList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  useEffect(() => {
    // 会员列表
    request({ url: '/api/user/getMembers/', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setMemberList(list);
        }
      })
    // 销售列表
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: 5 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setSaleList(list);
        }
      })
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
      ctime: '合计：',
      number: res.summary.number,
      price: res.summary.price,
      sale_earn: res.summary.sale_earn,
      sale_cost: res.summary.sale_cost,
      sale_cross: res.summary.sale_cross,
      sale_cross_rate: res.summary.sale_cross_rate,
      cost_price: res.summary.cost_price,
    };
    res.page.list.push(total);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    },
    ...(
      (userType == 'admin' || userType.indexOf('xiaoshou') > -1 || userType.indexOf('kefu') || userType == 'caiwu') &&
      [{
        type: 'select',
        label: '客户',
        paramName: 'huiyuan_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true)
        },
      }] || []
    ),
    ...(
      (userType == 'admin' || userType == 'xiaoshou_mgr' || userType.indexOf('kefu') > -1 || userType == 'caiwu') &&
      [{
        type: 'select',
        label: '销售人员',
        paramName: 'sale_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(saleList, 'value', 'label', true, true)
        },
      }] || []
    ), {
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
      type: 'select',
      label: '订单支付类型',
      paramName: 'payType', // payType; // 订单支付类型: 1 非帐期订单；2 帐期订单； 默认1
      initialValue: basicParams.payType,
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '非帐期订单' },
          { value: 2, label: '帐期订单' },
        ]
      },
    }
  ];

  let columns = [
    { title: '销售日期', dataIndex: 'ctime', align: 'center', width: 140, fixed: 'left' },
    { title: '销售单据号', dataIndex: 'ordersn', align: 'center', width: 120, fixed: 'left' },
    { title: '业务类别', dataIndex: 'stype', align: 'center', width: 120, fixed: 'left' },
    ...(
      userType != 'xiaoshou' &&
      [{ title: '销售人员', dataIndex: 'sales_name', align: 'center', width: 150 }] || []
    ),
    // { title: '客户类别', dataIndex: 'a', align: 'center', width: 120 },
    { title: '客户', dataIndex: 'member_name', align: 'center', width: 120 },
    { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
    { title: '商品编号', dataIndex: 'sku_id', align: 'center', width: 120 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120 },
    { title: '规格型号', dataIndex: 'pname', align: 'center', width: 120 },
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
    }, {
      title: '订单支付类型', // payType; // 订单支付类型: 1 非帐期订单；2 帐期订单； 默认1
      dataIndex: 'pay_type',
      align: 'center',
      width: 120,
      render: (text) => (
        // {0: '帐期类型', 1: '现金'}
        Util.isNumber(text) ? { 1: '非帐期订单', 2: '帐期订单' }[text] : ''
      )
    }, {
      title: '销售收入',
      dataIndex: 'sale_earn',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    }, ...((userType == 'admin' || userType == 'caiwu') &&
      [{
        title: '销售成本',
        dataIndex: 'sale_cost',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }, {
        title: '销售毛利',
        dataIndex: 'sale_cross',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }, {
        title: '毛利率(%)',
        dataIndex: 'sale_cross_rate',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text * 100).toFixed(2) : text
        )
      }] || []
    ),
    // { title: '原销货订单号', dataIndex: 'comment1', align: 'center', width: 150 },
    { title: '整单备注', dataIndex: 'comment', align: 'center', width: 220 },
  ];

  if(userType == 'xiaoshou') {
    basicParams.sale_id = userId;
  }

  let params = {
    searchItems,
    columns,
    addBtnShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    handleSearchData: handleSearchData,
    handleTableData: handleTableData,
    searchApi: { url: '/api/order/listSaleDetail', params: { ...basicParams } },
    exportApi: { url: '/api/order/exportSaleDetail', params: { ...basicParams } }
  }
  return (
    <div>
      <Template {...params} />
    </div>
  );
}

export default AccountForSales;
