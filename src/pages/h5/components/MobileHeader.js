/**
 * 移动端header
 */

import React, { useState } from 'react';
import { Menu, ActivityIndicator } from 'antd-mobile';
import router from 'umi/router';
import MyIcon from '../../../components/common/MyIcon';
import styles from './MobileHeader.less';

const MobileHeader = (props) => {
  let userType = localStorage.getItem('userType');
  let navs = [
    {
      label: '订单列表',
      value: 'ddlb',
      children: [
        {label: '全部订单', value: '0', pathname: '/h5/IntentionToOrder-all'},
        {label: '未分配的意向订单', value: '1', pathname: '/h5/IntentionToOrder-wfp', pathquery: {assigned: -2}},
        {label: '已分配的意向订单', value: '2',pathname: '/h5/IntentionToOrder-yfp', pathquery: {assigned: -1}},
        {label: '退单申请表', value: '3',pathname: '/h5/OrderListTD', pathquery: {orderType: -2}},
      ],
    }, {
      label: '报表明细',
      value: 'bbmx',
      children: [
        {label: '销售明细表', value: '1', pathname: '/h5/AccountForSales'},
        {label: '销售汇总表(按商品)', value: '2',pathname: '/h5/SummaryOfSales-SP'},
        {label: '销售汇总表(按客户)', value: '3',pathname: '/h5/SummaryOfSales-KH'},
        {label: '销售汇总表(按销售人员)', value: '4',pathname: '/h5/SummaryOfSales-XS'},
        {label: '销售汇总表(分类)', value: '5',pathname: '/h5/SummaryOfSales-FL'},
      ],
    }, {
      label: '销售数据',
      value: 'xssj',
      children: [
        {label: '销售排名(按商品)', value: '1', pathname: '/h5/SalesStatistics-SP'},
        {label: '销售排名(按会员)', value: '2',pathname: '/h5/SalesStatistics-HY'},
      ],
    }, {
      label: '资金报表',
      value: 'zjbb',
      children: [
        {label: '应收账款明细表', value: '1', pathname: '/h5/AccountsReceivable'},
        {label: '应收账款汇总表', value: '2',pathname: '/h5/AccountSummary', pathquery: {type: 2}},
      ],
    },
    ...(
      userType == 'xiaoshou_mgr' &&
      [
        {
          label: '确认订单',
          value: 'qrdd',
          children: [
            {label: '确认订单', value: '1', pathname: '/h5/OrderList-sz', pathquery: {orderType: 0}},
          ],
        }, {
          label: '订单价格编辑',
          value: 'ddjgbj',
          children: [
            {label: '订单价格编辑', value: '1', pathname: '/h5/OrderPriceEdit-sz'},
          ],
        },
      ] || []
    )
  ];

  navs.map(item => {
    if(!item.children) {
      item.children = [
        { label: item.label, value: 1, pathname: item.pathname }
      ]
    }
  })

  let [menuValue, setMenuValue] = useState(() => {
    let value = sessionStorage.getItem('menuValue') && JSON.parse(sessionStorage.getItem('menuValue')) || null;
    return value;
  })
  let [initData, setInitData] = useState('');
  let [show, setShow] = useState(false);

  const onChange = (value) => {
    setMenuValue(value);
    setShow(false);
    sessionStorage.setItem('menuValue', JSON.stringify(value));
    navs.map(item => {
      if(item.value == value[0]) {
        item.children.map(subItem => {
          if(subItem.value == value[1]) {
            router.push({
              pathname: subItem.pathname,
              query: subItem.pathquery || {},
            })
          }
        })
      }
    })
  }

  const handleClick = (e) => {
    e.preventDefault(); // Fix event propagation on Android

    setShow(!show);
    // mock for async data loading
    if (!initData) {
      setTimeout(() => {
        setInitData(navs);
      }, 100);
    }
  }

  const onMaskClick = () => {
    setShow(false);
  }

  const menuEl = (
    <Menu
      className="foo-menu"
      data={initData}
      value={menuValue}
      onChange={onChange}
      height={document.documentElement.clientHeight * 0.6}
    />
  );
  const loadingEl = (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: document.documentElement.clientHeight * 0.6, display: 'flex', justifyContent: 'center' }}>
      <ActivityIndicator size="large" />
    </div>
  );
  return (
    <>
      <div className={styles['placeholder']}></div>
      <div className={styles['header']}>
        <div className={styles['left']}>
          <a href='/'>
            <img src={require('../../../assets/logo2.png')} alt='浙江鼎泰消防科技有限公司' title='浙江鼎泰消防科技有限公司' />
          </a>
        </div>
        <div className={styles['navs']}>
          <div className={styles['btn']} onClick={handleClick}>
            <MyIcon type='icon-daohanglan' />
          </div>
        </div>
        {show ? initData ? menuEl : loadingEl : null}
        {show ? <div className="menu-mask" onClick={onMaskClick} /> : null}
      </div>
    </>
  );
}

export default MobileHeader;
