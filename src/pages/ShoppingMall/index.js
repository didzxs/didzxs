/**
 * 商城首页
 */

import React, { useEffect, useState } from 'react';
import router from 'umi/router';
import { Spin } from 'antd';
import request from '../../utils/request';
import Title from './component/Title';
import Header from './Header';
import SearchHeader from './Search';
import SidebarTool from './Sidebar/SidebarTool';
import Banners from './Banners';
import MyProviderContainer from './component/MyProviderContainer';
import styles from './index.less';
import Notice from './component/Notice';
import Footer from './Footer';

const ShoppingMall = () => {
  let [classify, setClassify] = useState([]);
  let [childClassify, setChildClassify] = useState([]);
  let [brand, setBrand] = useState([]);
  let [promotionProduct, setPromotionProduct] = useState([]);
  let [hotProduct, setHotProduct] = useState([]);

  let [classifyLevel2Show, setClassifyLevel2Show] = useState(true);
  let [classifyLevel1Id, setClassifyLevel1Id] = useState(false);
  let [spinShow, setSpinShow] = useState(false);
  let [iconList, setIconList] = useState();

  useEffect(() => {
    getProductClassify(); // 获取商品一级分类
    getBrand(); // 获取品牌
    getPromotionProd(); // 促销专区
    getHotProd(); // 热销专区

    const iconList = [
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_01.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_01.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_02.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_02.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_03.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_03.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_04.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_04.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_05.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_05.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_06.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_06.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_07.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_07.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_08.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_08.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_09.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_09.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_010.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_010.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_011.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_011.png')
      },
      {
        status: false,
        icon: require('../../assets/classification-icon/c_icon_012.png'),
        oIcon: require('../../assets/classification-icon/c_icon_o_012.png')
      }
    ];

    setIconList(iconList);
  }, []);

  // 获取商品一级分类
  const getProductClassify = () => {
    setSpinShow(true);
    request({ url: '/api/open/listCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setClassify(res.data);
          setSpinShow(false);
        }
      });
  };

  // 获取二级分类
  const getChildClassify = () => {
    request({ url: '/api/open/listSubCategory', method: 'GET', params: { pid: classifyLevel1Id } })
      .then(res => {
        if (res && res.retcode == 0) {
          setChildClassify(res.data);
        }
      });
  };

  // 获取品牌
  const getBrand = () => {
    request({ url: '/api/brand/list', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setBrand(res.data);
        }
      });
  };

  // 促销专区
  const getPromotionProd = () => {
    request({ url: '/api/open/prod/list', method: 'GET', params: { page: 1, pageSize: 20, isPromote: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          setPromotionProduct(res.page.list);
        }
      });
  };

  // 热销专区
  const getHotProd = () => {
    request({ url: '/api/open/prod/list', method: 'GET', params: { page: 1, pageSize: 20, isHot: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          setHotProduct(res.page.list);
        }
      });
  };

  const onClassifyClick = (bId, sId) => {
    router.push({
      pathname: '/web/ProductClassify',
      query: {
        classifyId: bId,
        childClassifyId: sId
      }
    });
  };

  const onJump = (path, params = {}) => {
    router.push({
      pathname: path,
      query: {
        ...params
      }
    });
  };

  const onJumpProdDetail = (id) => {
    router.push({
      pathname: 'productDetail',
      query: {
        id
      }
    });
  };

  const classifyLevel2Change = (status, item) => {
    if (item && item.id) {
      setClassifyLevel1Id(item.id);
    }
    setClassifyLevel2Show(status);
  };

  useEffect(() => {
    if (classifyLevel1Id) {
      getChildClassify();
    }
  }, [classifyLevel1Id]);

  // 鼠标移动进入分类区域时，执行；
  const onMouseLeaveClassification = (isEnter, index) => {
    const item = classify[index];
    let list = { ...iconList };
    list[index].status = isEnter;

    if (isEnter) {
      classifyLevel2Change(true, item);
    }
  };

  return (
    <MyProviderContainer>
      {
        spinShow && <div className={styles['spin-box']}>
          <Spin size="large"/>
        </div>
      }
      <div className={styles['container']}>
        <Header/>
        <SearchHeader/>
        <div className={`${styles['section']} ${styles['section1']}`}>

          <div className={styles['left']}>
            {
              classify.map((item, index) => (
                <div onMouseLeave={classifyLevel2Change.bind(this, false, undefined)} key={item.id}
                     className={styles['flex-center']}>
                  <div className={`${styles['classify-item']} ${(iconList[index].status && styles['hover'])}`}
                       onClick={onClassifyClick.bind(this, item.id, undefined)}
                       onMouseEnter={onMouseLeaveClassification.bind(this, true, index)}
                       onMouseLeave={onMouseLeaveClassification.bind(this, false, index, true)}>
                    <div className={styles['classify-label']}>
                      {/* 分类图标 */}
                      <div className={styles['icon_wrap']}>
                        <img src={!iconList[index].status ? iconList[index].icon : iconList[index].oIcon}
                             className={styles['icon_reponsive']}/>
                      </div>
                      {item.name}
                    </div>
                    <div className={styles['classify-right']}>{'>'}</div>
                  </div>
                  {
                    classifyLevel2Show && item.id == classifyLevel1Id && childClassify.length > 0 &&
                    <div className={styles['classify-level2']}
                         onMouseEnter={classifyLevel2Change.bind(this, true, undefined)}
                         onMouseLeave={classifyLevel2Change.bind(this, false, undefined)}>
                      <div className={styles['title']}>{item.name}</div>
                      <div className={styles['classify-child-box']}>
                        {
                          childClassify.map(childItem => (
                            <div className={styles['classify-child-item']} key={childItem.id}
                                 onClick={onClassifyClick.bind(this, item.id, childItem.id)}>
                              <div className={styles['classify-child-left']}>
                                <img src={childItem.icon}/>
                              </div>
                              <div className={styles['classify-child-right']}>{childItem.name}</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  }
                </div>
              ))
            }
          </div>
          <div className={styles['right']}>
            <Banners/>
          </div>

        </div>
        <div className={styles['section']}>
          <div className={styles['product-classify']}>
            <Notice/>
          </div>
        </div>
        {/*<div className={styles['section']}>
          <Title title="商品分类"/>
          <div className={styles['product-classify']}>
            {
              classify.map(item => (
                <div className={styles['classify-item']} key={item.id} onClick={onClassifyClick.bind(this, item)}>
                  <img src={item.icon}/>
                  <span>{item.name}</span>
                </div>
              ))
            }
          </div>
        </div>*/}
        <div className={styles['section']}>
          <Title title="促销专区"/>
          <div className={styles['promotion-product']}>
            {
              promotionProduct.map((item, index) => (
                <div className={styles['product-item']} key={index} onClick={onJumpProdDetail.bind(this, item.id)}>
                  <img src={item.pic}/>
                  <div className={styles['product-name']}>{item.prodName}</div>
                  <div className={styles['product-specification']}>{item.xh}</div>
                  <div className={styles['product-price']}>{item.price / 100}</div>
                </div>
              ))
            }
          </div>
        </div>
        <div className={styles['section']}>
          <Title title="品牌馆"/>
          <div className={styles['brand-pavilion']}>
            {
              brand.map((item, index) => {
                if (index < 26) {
                  return <div className={styles['brand-item']} key={item.brandId}
                              onClick={onJump.bind(this, 'SearchProduct', {
                                id: item.brandId,
                                name: item.brandName,
                                type: 'brandSearch'
                              })}>
                    <img src={item.brandPic} title={item.brandName} alt={item.brandName}/>
                  </div>;
                }
              })
            }
            {
              // brand.length > 26 &&
              <div className={`${styles['brand-item']} ${styles['more']}`} onClick={onJump.bind(this, 'BrandPavilion')}>
                {'查看更多 >>'}
              </div>
            }
          </div>
        </div>
        <div className={styles['section']}>
          <Title title="热销商品"/>
          <div className={styles['hot-product']}>
            {
              hotProduct.map((item, index) => (
                <div className={styles['product-item']} key={index} onClick={onJumpProdDetail.bind(this, item.id)}>
                  <img src={item.pic}/>
                  <div className={styles['product-name']}>{item.prodName}</div>
                  <div className={styles['product-specification']}>{item.xh}</div>
                  <div className={styles['product-price']}>{item.price / 100}</div>
                </div>
              ))
            }
          </div>
        </div>
        <div style={{ height: '50px' }}></div>
        <Footer/>
      </div>
      <SidebarTool/>
    </MyProviderContainer>
  );
};

export default ShoppingMall;
