/**
 * 商品列表
 */

import React, { useEffect, useRef, useState } from 'react';
import { router } from 'umi';
import { Empty, Pagination } from 'antd';
import request from '../../../utils/request';
import Header from '../Header';
import MyBreadcrumb from '../../../components/common/MyBreadcrumb';
import FilterTabs from '../component/FilterTabs1';
import SearchHeader from '../Search';
import MyProviderContainer from '../component/MyProviderContainer';
import styles from './index.less';
import SidebarTool from '../Sidebar/SidebarTool';


const ProductList = (props) => {
  let childMethodRef = useRef();
  let childMethodRef1 = useRef();

  let [classify, setClassify] = useState([]);
  let [smallClassify, setSmallClassify] = useState([]);
  let [level3Classify, setLevel3Classify] = useState([]);
  let [classifyId, setClassifyId] = useState(props.location.query.classifyId);
  let [smallClassifyId, setSmallClassifyId] = useState(props.location.query.childClassifyId);
  let [level3ClassifyId, setLevel3ClassifyId1] = useState(props.location.query.level3);

  let [page, setPage] = useState(parseInt(props.location.query.page) || 1);
  let [totalCount, setTotalCount] = useState(0);
  let [productList, setProductList] = useState([]);

  useEffect(() => {
    // if(classifyId) {
    request({ url: '/api/open/listProdCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.data.map(item => {
            item.label = item.name;
            item.value = item.id;
            if (item.id == classifyId) {
              list = item.categories;
            }
          });
          list &&
          list.map(item => {
            item.label = item.name;
            item.value = item.id;
          });

          setClassify(res.data);
          setSmallClassify(list);
        }
      });
    // }
  }, [classifyId]);

  useEffect(() => {
    let list = [];
    classify.map(item => {
      if (item.id == classifyId) {
        item.categories &&
        item.categories.map(child => {
          if (child.id == smallClassifyId) {
            list = child.categories;
          }
        });
      }
    });
    list &&
    list.map(item => {
      item.label = item.name;
      item.value = item.id;
    });
    setLevel3Classify(list);
  }, [classify, smallClassifyId]);

  const onTabsChange = (level, val) => {
    let query = {
      classifyId: classifyId,
      childClassifyId: smallClassifyId,
      level3: level3ClassifyId
    };
    if (level == 1) {
      query.classifyId = val;
      query.childClassifyId = undefined;
      query.level3 = undefined;
      setClassifyId(val);
      setSmallClassifyId();
      setLevel3ClassifyId1();

      childMethodRef.current && childMethodRef.current.resetValue();
    } else if (level == 2) {
      query.classifyId = classifyId;
      query.childClassifyId = val;
      query.level3 = undefined;
      setSmallClassifyId(val);
      setLevel3ClassifyId1();

      childMethodRef1.current && childMethodRef1.current.resetValue();
    } else if (level == 3) {
      setLevel3ClassifyId1(val);
      query.classifyId = classifyId;
      query.childClassifyId = smallClassifyId;
      query.level3 = val;
    }
    router.replace({
      pathname: '/web/ProductClassify',
      query
    });
  };

  useEffect(() => {
    getProductList();
  }, [page, classifyId, smallClassifyId, level3ClassifyId]);

  const getProductList = () => {
    request({
      url: '/api/open/prod/list',
      method: 'GET',
      params: { page, pageSize: 20, cid: level3ClassifyId || smallClassifyId || classifyId }
    })
      .then(res => {
        if (res && res.retcode == 0) {
          setProductList(res.page.list);
          setTotalCount(res.page.totalCount);
        }
      });
  };

  const onPageCheng = (page) => {
    setPage(page);

    router.replace({
      pathname: '/web/ProductClassify',
      query: {
        ...props.location.query,
        page
      }
    });
  };

  const onJump = (type, id) => {
    let { location } = props;
    let params = {};
    // 意向订单创建材料订单
    if (location.query.orderId) {
      params.orderId = location.query.orderId;
    }
    router.push({
      pathname: type,
      query: {
        id,
        ...params
      }
    });
  };
  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header/>
        <SearchHeader/>
        <div className={styles['breadcrumb-box']}>
          <MyBreadcrumb list={[
            { path: '/web/ShoppingMall', breadcrumbName: '首页', icon: 'home' },
            { path: '', breadcrumbName: '商品分类' }
          ]}/>
        </div>
        <div className={styles['tabs-box']}>
          <div className={styles['tabs-label']}>一级分类：</div>
          <FilterTabs list={classify} allShow={false} style={{ width: 'calc(100% - 130px)' }} initValue={classifyId}
                      onTabsChange={onTabsChange.bind(this, 1)}/>
        </div>
        {
          classifyId && (Array.isArray(smallClassify) && smallClassify.length) &&
          <div className={styles['tabs-box']}>
            <div className={styles['tabs-label']}>二级分类：</div>
            <FilterTabs list={smallClassify} allShow={false} style={{ width: 'calc(100% - 130px)' }}
                        initValue={smallClassifyId} onTabsChange={onTabsChange.bind(this, 2)} ref={childMethodRef}/>
          </div>
        }
        {
          smallClassifyId && (Array.isArray(level3Classify) && level3Classify.length) &&
          <div className={styles['tabs-box']}>
            <div className={styles['tabs-label']}>三级分类：</div>
            <FilterTabs list={level3Classify} allShow={false} style={{ width: 'calc(100% - 130px)' }}
                        initValue={level3ClassifyId} onTabsChange={onTabsChange.bind(this, 3)} ref={childMethodRef1}/>
          </div>
        }

        {
          productList.length &&
          <>
            <div className={styles['product-list']}>
              {
                productList.map(item => (
                  <div className={styles['product-item']} key={item.id}
                       onClick={onJump.bind(this, 'productDetail', item.id)}>
                    <img src={item.pic}/>
                    <div className={styles['product-price']}>{item.price && ('￥' + item.price / 100) || ''}</div>
                    <div className={styles['product-name']}>{item.prodName}</div>
                  </div>
                ))
              }
            </div>
            <div className={styles['page-box']}>
              <Pagination current={page} defaultCurrent={1} total={totalCount} pageSize={20} onChange={onPageCheng}/>
            </div>
          </>
          ||
          <Empty/>
        }
        <SidebarTool/>
      </div>
    </MyProviderContainer>
  );
};

export default ProductList;
