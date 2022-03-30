import React from 'react';
// import useMobileLayout from '../../MyHooks/useMobileLayout';
import { router } from 'umi';
import styles from './index.less';

const Footer = (props) => {
  // let isMobileLayout = useMobileLayout();
  const onJump = (item) => {
    if (item.type === 'url') {
      window.open(item.link, 'blank');
    } else {
      const { query } = item;
      router.push({
        pathname: item.link,
        query: {
          ...query
        }
      });
    }
  };
  let list = [
    { label: '关于我们', type: 'url', link: 'http://www.dingtai119.com/#/CompanyProfile' },
    { label: '联系我们', type: 'url', link: 'http://www.dingtai119.com/#/ContactUs' },
    { label: '人才招聘', type: 'url', link: 'http://www.dingtai119.com/#/TalentRecruitment' },
    { label: '产品中心', type: 'url', link: 'http://www.dingtai119.com/#/ProductClassify' },
    { label: '项目案例', type: 'url', link: 'http://www.dingtai119.com/#/ProjectCase' },
    // { label: '新闻资讯', type: 'url', link: 'http://www.dingtai119.com/#/CompanyNews' },
    { label: '帮助中心', type: 'route', link: 'HelpCenter', query: {} }
  ];

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <div className={styles['left']}>
          <div className={styles['title']}>网站导航</div>
          <ul className={styles['list']}>
            {
              list.map((item, index) => (
                <li className={styles['list-item']} key={index} onClick={onJump.bind(this, item)}>
                  {item.label}
                </li>
              ))
            }
          </ul>
        </div>

        <div className={styles['right']}>
          <div className={styles['title']}>400-119-8611</div>
          <p className={styles['text1']}>周一至周五 09:00~18:00</p>
          <div className={styles['qrCodeWrapper']}>
            <div className={styles['contentItem']}>
              <img src={require('@/assets/zhax.jpg')} alt='鼎泰智慧安消'/>
              <img src={require('@/assets/dtxf.jpg')} alt='鼎泰消防'/>
            </div>
            {/*<p className={styles['center']}>关注公众号</p>*/}
          </div>
          <p className={styles['address']}>地址：杭州市下城区石祥路59号新华经济园34幢</p>
          {/*<p>联系人：吴经理</p>*/}
        </div>
      </div>
      <div className={styles['footer']}>
        版权所有 ©浙江鼎泰消防科技有限公司
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">浙ICP备15038494号-1</a>
      </div>
    </div>
  );
};

export default Footer;
