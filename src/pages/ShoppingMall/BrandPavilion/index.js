/**
 * 品牌馆
 */

import React, { useState, useEffect } from 'react';
import { Input, Button } from 'antd';
import { router } from 'umi';
import request from '../../../utils/request';
import Header from '../Header';
import MyBreadcrumb from '../../../components/common/MyBreadcrumb';
import SearchHeader from '../Search';
import MyProviderContainer from '../component/MyProviderContainer';
import styles from './index.less';

const BrandPavilion = () => {

  let [firstCharList, setFirstCharList] = useState([]);
  let [keyword, setKeyword] = useState();
  let [brandList, setBrandList] = useState([]);

  useEffect(() => {
    getBrandList();
  }, [])

  const getBrandList = () => {
    request({url: '/api/brand/list', method: 'GET', params: {search: keyword}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.data.map(item => {
            let firstChar = item.firstChar.toUpperCase();
            if(!list.includes(firstChar)) {
              list.push(firstChar);
            }
          })
          
          setBrandList(res.data);
          setFirstCharList(list.sort());
        }
      })
  }

  const onSearch = () => {
    getBrandList();
  }

  const onSearchValChange = (e) => {
    setKeyword(e.target.value);
  }

  const onBrandClick = (record) => {
    router.push({
      pathname: 'SearchProduct',
      query: {
        type: 'brandSearch',
        id: record.brandId,
        name: record.brandName,
      }
    })
  }

  const scrollToAnchor = anchorName => {
    if (anchorName) {
      // 找到锚点
      const anchorElement = document.getElementById(anchorName);
      // 如果对应id的锚点存在，就跳转到锚点
      if(anchorElement) {
        anchorElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    }
  }
  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header />
        <SearchHeader />
        <div className={styles['breadcrumb-box']}>
          <MyBreadcrumb list={[
            { path: '/web/ShoppingMall', breadcrumbName: '首页', icon: 'home' },
            { path: '', breadcrumbName: '品牌馆' },
          ]} />
        </div>
        <div className={styles['section']}>
          <div className={styles['search-box']}>
            <Input
              className={styles['search-input']}
              placeholder='请输入品牌名称'
              onChange={onSearchValChange}
            />
            <Button className={styles['search-btn']} onClick={onSearch}>搜索</Button>
          </div>
          <div className={styles['filter-box']}>
            <div className={styles['label']}>品牌筛选</div>
            <div className={styles['filter-list']}>
              {
                firstCharList.map(item => (
                  <a onClick={scrollToAnchor.bind(this, item)}>{item}</a>
                ))
              }
            </div>
          </div>
          
          <div className={styles['brand-box']}>
            {
              firstCharList.map(inital => (
                <div className={styles['brand-list']} key={inital} id={`${inital}`}>
                  <div className={styles['brand-inital']}>{inital}</div>
                  <div className={styles['brand-item-box']}>
                    {
                      brandList.map(item => {
                        if(item.firstChar.toUpperCase() == inital) {
                          return <div className={styles['brand-item']} onClick={onBrandClick.bind(this, item)}>
                            <div className={styles['img-box']}>
                              <img src={item.brandPic} />
                            </div>
                            <span>{item.brandName}</span>
                          </div>
                        }
                      })
                    }
                  </div>
                </div>
              ))
            }  
          </div>
        </div>
      </div>
    </MyProviderContainer>
    
  );
}

export default BrandPavilion;