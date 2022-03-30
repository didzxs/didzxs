/**
 * 商品详情
 */

import React, { useState, useEffect } from 'react';
import { Button, Input, message } from 'antd';
import router from 'umi/router';
import MyBreadcrumb from '../../../components/common/MyBreadcrumb';
import request from '../../../utils/request';
import Header from '../Header';
import SearchHeader from '../Search';
import ImageMagnifier from '../component/ImageMagnifier';
import MyProviderContainer from '../component/MyProviderContainer';
import styles from './index.less';
import SidebarTool from '../Sidebar/SidebarTool';

const ProductDetail = (props) => {
  let prodId = props.location.query.id;
  let [detail, setDetail] = useState({});
  let [nums, setNums] = useState([]);

  let [imgList, setImgList] = useState([]);
  let [imgIndex, setImgIndex] = useState(0);

  let [amount, setAmount] = useState(0);
  let [totalPrice, setTotalPrice] = useState(0);
  let [selectedList, setSelectedList] = useState([]);

  let [hintMessageShow, setHintMessageShow] = useState(false);

  useEffect(() => {
    request({url: '/api/open/prod/info', method: 'GET', params: {prodId, skuStatus: 1}})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);
          let imgList = res.data.imgs.split(',');
          setImgList(imgList);
        }
      })
  }, [])

  const onImgMouseOver = (index) => {
    setImgIndex(index);
  }

  const onNumChange = (type, index) => {
    let list = [...nums];
    if(type == 'add') {
      console.log(list[index])
      list[index] = list[index] ? list[index] * 1 + 1 : 1;
    } else {
      list[index] = list[index] ? list[index] * 1 - 1 : 0;
    }
    setNums(list);
  }

  const onNumInputChange = (index, stores, e) => {
    let list = [...nums];
    if(/^[0-9]\d*$/.test(e.target.value)) {
      // list[index] = e.target.value * 1 > stores * 1 ? stores * 1 : e.target.value * 1;
      list[index] = e.target.value * 1;
    } else if(e.target.value == '') {
      list[index] = 0;
    }
    setNums(list);
  }

  useEffect(() => {
    let amount = 0, price = 0, list = [];
    nums.map((item, index) => {
      amount += item * 1 || 0;
      if(item) {
        price += detail.skuList[index].credprice * item;

        list.push({
          name: detail.skuList[index].name,
          pid: detail.skuList[index].id, // sku id
          number: item, // 购买数量
          prodId: detail.id, // 商品id
        })
      }
    })
    if(amount > 0) {
      setHintMessageShow(false);
    }
    setAmount(amount);
    setTotalPrice(price);
    setSelectedList(list);
  }, [nums])

  // 加入购物车
  const onAddShoppingCart = (type) => {
    if(amount <= 0) {
      setHintMessageShow(true);
      return;
    }
    let data = [...selectedList];
    data.map(item => {
      delete item.name;
    })
    request({url: '/api/shopping-cart/addBatch', method: 'POST', data})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('加入购物车成功！');
          setNums([]);
          setAmount(0);
          setTotalPrice(0);
          setSelectedList([]);

          if(type == 'shopping') {
            router.push({
              pathname: 'MyShoppingCart',
              query: {
                currentStep: 1,
                ocids: JSON.stringify(res.ocids)
              }
            })
          }
        } else {
          message.error(res.msg);
        }
      })
  }
  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header />
        <SearchHeader location={props.location} />
        <div className={styles['big-box']}>
          <div className={styles['breadcrumb-box']}>
            <MyBreadcrumb list={[
              {path: '/web/ShoppingMall', breadcrumbName: '首页', icon: 'home'},
              {path: '/web/ProductClassify', breadcrumbName: '商品分类'},
              {path: '', breadcrumbName: detail.prodName},
            ]} />
          </div>
        </div>

        <div className={styles['product-info']}>
          <div className={styles['left']}>
            <ImageMagnifier minImg={imgList[imgIndex]} maxImg={imgList[imgIndex]} />
            <div className={styles['img-list']}>
              {
                imgList.map((item, index) => (
                  <img src={item} key={index} style={{borderColor: `${imgIndex == index ? '#000' : '#fff'}`}} onMouseOver={onImgMouseOver.bind(this, index)} />
                ))
              }
            </div>
          </div>
          <div className={styles['right']}>
            <div className={styles['name']}>{detail.prodName}</div>
            <div className={styles['price-box']}>
              <div className={styles['price']}>
                <span className={styles['label']}>专享价</span>：
                <span className={styles['value']}>￥<span>{detail.price && detail.price / 100 || 0}</span></span>
              </div>
              {
                !!detail.oriPrice &&
                <div className={styles['ori-price']}>
                  <span className={styles['label']}>原价</span>：
                  <span className={styles['value']}>￥{detail.oriPrice && detail.oriPrice / 100 || 0}</span>
                </div>
              }
            </div>
            <div className={styles['module']}>
              <div className={styles['label']}>已售</div>：
              <div className={styles['value']}>{detail.soldNum}</div>
            </div>
            <div className={styles['specification-box']}>
              <div className={styles['label']}>商品规格</div>：
              <div className={styles['specification-list']}>
                {
                  detail.skuList &&
                  detail.skuList.map((item, index) => (
                    <div className={styles['specification-item']} key={item.id}>
                      <div className={styles['item']}>{item.properties}</div>
                      <div className={styles['item']}>{item.credprice / 100}元</div>
                      {/*<div className={styles['item']}>库存{item.stores}</div>*/}
                      <div className={`${styles['item']} ${styles['nums-box']}`}>
                        <Button className={styles['num-btn']} size='small' onClick={onNumChange.bind(this, 'minus', index)} disabled={nums[index] <= 0}>-</Button>
                        <Input
                          size='small'
                          value={nums[index] || 0}
                          onChange={onNumInputChange.bind(this, index, item.stores)}
                        />
                        <Button className={styles['num-btn']} size='small' onClick={onNumChange.bind(this, 'add', index)} /*disabled={nums[index] >= item.stores}*/>+</Button>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className={styles['product-selected']}>
              <div className={styles['selected-left']}>
                <div className={styles['amount']}>
                  <span>{amount}</span> {detail.unitName}{/* 计量单位 */}
                </div>
                <div className={styles['total-price']}>
                  <span>{totalPrice / 100}</span>元
                </div>
              </div>
              <div className={styles['selected-right']}>
                <div className={styles['list-btn']}>
                  <i className='iconfont icon-qingdan'></i>
                  已选清单

                  {
                    !!selectedList.length &&
                    <div className={styles['selected-list']}>
                      {
                        selectedList.map((item, index) => (
                          <div className={styles['selected-item']} key={index}>
                            <div className={styles['selected-item-name']}>{item.name}</div>
                            <div className={styles['selected-item-amount']}>{item.number}{detail.unitName}</div>{/* 计量单位 */}
                          </div>
                        ))
                      }
                    </div>
                  }
                </div>
              </div>
            </div>

            <div className={styles['btn-box']}>
              <Button className={styles['shopping-cart-add']} onClick={onAddShoppingCart}>
                <i className='iconfont icon-weibiaoti--'></i>加入购物车
              </Button>
              <Button className={styles['shopping-btn']} onClick={onAddShoppingCart.bind(this, 'shopping')}>
                立即购买
              </Button>
              {
                hintMessageShow &&
                <div className={styles['hint-message']}><i className='iconfont icon-warning-fill'></i>订购数量必须大于0</div>
              }
            </div>
          </div>
        </div>

        <div className={styles['product-detail-tabs']}>
          <div className={`${styles['detail-tabs-item']} ${styles['detail-tabs-item-active']}`}>商品详情</div>
        </div>
        <div className={styles['product-detail-content']} dangerouslySetInnerHTML={{__html: detail.content}}></div>
        <SidebarTool />
      </div>
    </MyProviderContainer>

  );
}

export default ProductDetail;
