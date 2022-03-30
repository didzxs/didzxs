/**
 * 商品搜索
 */
import React, { useEffect, useState } from 'react';
import { Empty, Pagination } from 'antd';
import router from 'umi/router';
import request from '../../../utils/request';
import Header from '../Header';
import MyProviderContainer from '../component/MyProviderContainer';
import SearchHeader from '../Search';
import MyBreadcrumb from '../../../components/common/MyBreadcrumb';
import styles from './index.less';
import SidebarTool from '../Sidebar/SidebarTool';

const SearchProduct = (props) => {
  let { location } = props;

  let currentBreadcrumbName;
  if(location.query.type == 'keywordSearch') {
    currentBreadcrumbName = '关键字查询';
  } else if(location.query.type == 'brandSearch') {
    currentBreadcrumbName = '品牌查询';
  }

  let [keyword, setKeyword] = useState(location.query.keyword);
  let [page, setPage] = useState(1);
  let [totalCount, setTotalCount] = useState(0);
  let [productList, setProductList] = useState([]);

  useEffect(() => {
    getProductList();
  }, [page, keyword])

  const getProductList = () => {
    let basicParams = {};
    if(location.query.type == 'brandSearch') {
      basicParams.brandId = location.query.id;
    }
    if(location.query.type == 'keywordSearch') {
      basicParams.k = location.query.keyword;
    }
    request({url: '/api/open/prod/list', method: 'GET', params: {page, pageSize: 20, ...basicParams, k: keyword}})
      .then(res => {
        if(res && res.retcode == 0) {
          // if(page == 1) {
            setProductList(res.page.list);
            setTotalCount(res.page.totalCount);
          // } else {
          //   let list = [...productList];
          //   setProductList(list.concat(res.page.list));
          // }
        }
      })
  }

  const onSearch = (keyword) => {
    console.log(keyword, 666666)
    setKeyword(keyword);
  }

  const onPageCheng = (page) => {
    setPage(page);
  }

  const onJump = (type, id) => {
    router.push({
      pathname: type,
      query: {
        id,
      }
    })
  }

  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header />
        <SearchHeader value={location.query.keyword} onSearch={onSearch} location={location} />
        <div className={styles['big-box']}>
          <div className={styles['breadcrumb-box']}>
            <MyBreadcrumb list={[
              {path: '/web/ShoppingMall', breadcrumbName: '首页', icon: 'home'},
              {path: '', breadcrumbName: currentBreadcrumbName },
            ]} />
          </div>
        </div>
        {
          productList.length &&
          <>
            <div className={styles['product-list']}>
              {
                productList.map(item => (
                  <div className={styles['product-item']} key={item.id} onClick={onJump.bind(this, 'productDetail', item.id)}>
                    <img src={item.pic} />
                    <div className={styles['product-price']}>{item.price && ('￥' + item.price / 100) || ''}</div>
                    <div className={styles['product-name']}>{item.prodName}</div>
                  </div>
                ))
              }

            </div>
            <div className={styles['page-box']}>
              <Pagination current={page} defaultCurrent={1} total={totalCount} pageSize={20} onChange={onPageCheng} />
            </div>
          </>
          ||
          <Empty />
        }
        <SidebarTool />
      </div>
    </MyProviderContainer>
  );
}

export default SearchProduct;
