import React from 'react';
import { router } from 'umi';
import { Icon } from 'antd';
import styles from './index.less';

const sidebarTool = (props) => {

  const onJump = (type, params = {}) => {
    router.push({
      pathname: type,
      query: {
        ...params
      }
    });
  };

  const Building = () => (
    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25.728 25" version="1.1"
         fill="currentColor">
      {/*<path
        d="M832 896V212.8c0-8.8-7.2-16-16-16H640V80c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16v816h-64v64h768v-64h-64z m-64-635.2V864H640V768h64v-64h-64v-64h64v-64h-64v-64h64v-64h-64v-64h64v-64h-64v-59.2h128zM256 128h320v736H256V128z m64 64h64v64h-64v-64z m128 0h64v64h-64v-64zM320 320h64v64h-64v-64z m128 0h64v64h-64v-64zM320 448h64v64h-64v-64z m128 0h64v64h-64v-64zM320 576h64v64h-64v-64z m128 0h64v64h-64v-64zM320 704h64v64h-64v-64z m128 0h64v64h-64v-64z"/>*/}
      <path d="M24.763,23.07H22.29V4.138C22.287,1.854,20.437,0.003,18.152,0H7.576
		C5.292,0.003,3.441,1.854,3.438,4.138V23.07H0.965C0.432,23.07,0,23.502,0,24.035C0,24.568,0.432,25,0.965,25h23.798
		c0.533,0,0.965-0.432,0.965-0.965C25.728,23.502,25.296,23.07,24.763,23.07L24.763,23.07z M5.367,4.138
		c0-1.218,0.991-2.209,2.207-2.209h10.578c1.217,0,2.208,0.991,2.208,2.209V23.07h-3.855v-5.776c0-0.533-0.432-0.965-0.965-0.965
		h-5.353c-0.533,0-0.965,0.432-0.965,0.965v5.776H5.367V4.138z M11.152,22.575v-4.316h3.423v4.316H11.152z M8.005,8.736h9.717
		c0.533,0,0.965-0.432,0.965-0.965V4.599c0-0.533-0.432-0.965-0.965-0.965H8.005c-0.533,0-0.965,0.432-0.965,0.965v3.172
		C7.04,8.304,7.473,8.736,8.005,8.736L8.005,8.736z M8.97,5.564h7.788v1.243H8.97V5.564z M17.723,15.084
		c0.533,0,0.965-0.432,0.965-0.965v-3.174c0-0.533-0.432-0.965-0.965-0.965H8.005c-0.533,0-0.965,0.432-0.965,0.965v3.172
		c0,0.533,0.432,0.965,0.965,0.965h9.717V15.084z M8.97,11.911h7.788v1.243H8.97V11.911z M8.97,11.911"/>
    </svg>
  );
  const Professional = () => (
    <svg width="100%" height="100%" viewBox="0 0 1024 1024" version="1.1"
         xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path
        d="M626.2 588.4C686 549 727.6 480.3 734.6 400H764c15.5 0 28-12.5 28-28s-12.5-28-28-28c0-154.6-97.3-280-252-280S260 189.4 260 344c-15.5 0-28 12.5-28 28s12.5 28 28 28h29.4c6.9 80.3 48.6 149 108.3 188.4C268.5 635.2 176 758.6 176 904c0 14.3 5.5 28.7 16.4 39.6S217.7 960 232 960h560c14.3 0 28.7-5.5 39.6-16.4S848 918.3 848 904c0-145.4-92.5-268.8-221.8-315.6z m-34.4-451.8L575.6 232H447.4l-15.9-95.1C455.2 126.1 482 120 512 120c29.7 0 56.3 6.1 79.8 16.6z m-211 36.3l11.4 68.3c4.5 27 27.9 46.8 55.2 46.8h128.1c27.3 0 50.6-19.7 55.2-46.6l11.8-69.2C684.4 213.3 708 274.7 708 344H316c0-69 23.3-130 64.8-171.1zM232 904c0-117.3 74.3-223 184.8-263 19.9-7.2 34.1-25 36.5-46.1 2.5-21-7.1-41.7-24.8-53.3-46.7-30.8-75.4-82.9-81.9-141.6h330.6c-6.4 58.7-35.1 110.8-81.9 141.6-17.7 11.7-27.3 32.3-24.8 53.3s16.6 38.9 36.5 46.1c110.7 40 185 145.7 185 263H232z"/>
    </svg>
  );

  // 改为圆角的方形
  const toolList = [
    { text: '个人中心', icon: 'user', link: 'PersonalInfo', params: {} },
    { text: '购物车', icon: 'shopping-cart', link: 'MyShoppingCart', params: {} },
    { text: '消防公司', component: Building, link: 'BrandPavilion', params: {} },
    { text: '工程中心', component: Professional, link: 'ProjectOrder', params: {} }
  ];

  return (
    <div className={styles['sidebar-box']}>
      <div className={styles['tool']}>
        {
          toolList.length && toolList.map((item, index) => (
            <div className={styles['tool-child']} onClick={onJump.bind(this, item.link, item.params)}>
              { // icon 格式图标 || 自定义图标 格式图标
                (item.hasOwnProperty('icon') || item.hasOwnProperty('component')) && <>
                  <Icon type={item.icon || null} component={item.component || null} className={styles['tool-icon']}/>
                  <span className={styles['tool-name']}>{item.text}</span>
                </>
              }
              { // 图片 格式图标
                item.hasOwnProperty('icon_img') && <>
                  <img src={item.icon_img} alt="" className={styles['tool-icon']}/>
                  <span className={styles['tool-name']}>{item.text}</span>
                </>
              }
            </div>
          ))
        }
      </div>
    </div>
  );
};

export default sidebarTool;
