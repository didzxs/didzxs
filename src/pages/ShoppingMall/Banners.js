import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import Swiper from 'swiper';
import 'swiper/css/swiper.css';
import request from '../../utils/request';
import styles from './Banners.less';

const Banners = () => {
  let bannerSwiper;

  let [dataList, setDataList] = useState([]);
  let [spinShow, setSpinShow] = useState(false);

  useEffect(() => {
    setSpinShow(true);
    request({ url: '/api/banner/list', method: 'GET', params: { for_merch: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let videoFormat = ['mp4', 'rm', 'rmvb', 'wmv', 'avi', '3gp', 'mkv'];
          res.data.map(item => {
            videoFormat.map(videoItem => {
              if (item.pic.indexOf(videoItem) > -1) {
                item.fileType = 'video';
              }
            });
          });
          setDataList(res.data);
          setSpinShow(false);
        }
      });
  }, []);

  useEffect(() => {
    if (bannerSwiper) {
      bannerSwiper.slideTo(0, 0);
      bannerSwiper.destroy();
      bannerSwiper = null;
    }
    bannerSwiper = new Swiper('.banner-swiper-container', {
      loop: true,
      autoplay: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true
      }
    });
    return () => {
      if (bannerSwiper) { // 销毁swiper
        bannerSwiper.destroy();
      }
    };
  }, [dataList]);

  return (
    <Spin size="large" spinning={spinShow}>
      <div className={`${styles['swiper-box']} banner-swiper-container`}>
        <div className="swiper-wrapper">
          {
            dataList.map(item => (
              <div className="swiper-slide" key={item.id}>
                {
                  item.fileType == 'video' ?
                    <video muted src={item.pic} autoPlay={true} loop={true}/>
                    :
                    <img src={item.pic}/>
                }
              </div>
            ))
          }
        </div>
        {/* <!-- 如果需要分页器 --> */}
        <div className="swiper-pagination"></div>
      </div>
    </Spin>
  );
};

export default Banners;
