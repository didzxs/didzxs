import React from 'react';
// import { router } from 'umi';
import styles from './Notice.less';

const Notice = (props) => {
  const imgList = [
    require('../../../assets/notice/notice_1.png'),
    require('../../../assets/notice/notice_2.png'),
    require('../../../assets/notice/notice_3.png'),
    require('../../../assets/notice/notice_4.png'),
  ];
  // const noticeList = [
  //   { title: '多', line1: '品类丰富 一站购齐', line2: '数千款商品 多仓直发' },
  //   { title: '专', line1: '深耕消防 精准采销', line2: '供应链完整 品质保障' },
  //   { title: '省', line1: '阳光采购 品牌直供', line2: '性价比高 综合成本低' },
  //   { title: '心', line1: '高效下单 及时响应', line2: '专车配送 售后无忧' }
  // ];

  return (
    <div className={styles['notice-box']}>
      {
          imgList.map(item => (
            <img className={styles['responsive']} src={item} alt=""/>
          ))
        }
      {/*{
        noticeList.length && noticeList.map(item => (<div className={`${styles['responsive']} ${styles['flex-box']}`}>
          <div className={styles['flex-left']}>{item.title}</div>
          <div className={styles['flex-right']}>
            <p className={styles['line1']}>{item.line1}</p>
            <p className={styles['line2']}>{item.line2}</p>
          </div>
        </div>))
      }*/}
    </div>
  );
};

export default Notice;
