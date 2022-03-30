/**
 * 帮助中心
 */
import React, { useEffect, useState } from 'react';
// import request from '../../../utils/request';
import Header from '../Header';
import MyProviderContainer from '../component/MyProviderContainer';
import SearchHeader from '../Search';
import styles from './index.less';

const HelpCenter = (props) => {
  let { location } = props;
  let [supportInfo, setSupportInfo] = useState([]);
  let [currentInfo, setCurrentInfo] = useState({});

  console.log('location', location);

  useEffect(() => {
    getSupportList();
  }, []);

  const getSupportList = () => {
    const list = [
      {
        header: '售后指南', children: [
          {
            title: '售后政策',
            checked: 0,
            content: <div>
              <p>本商城所售商品均支持7天无理由退货；</p>
              <p>非产品质量原因收货超7天原则上不支持退货退款，可在收货15天内选择换货。</p>
              <p>请您在提出退换货申请时将所需证明材料（包裹、商品、发货单、快递单等清晰照片）反馈给售后人员。</p>
              <p>我们承诺在24小时之内（工作时间周一至周五9:00至18:00，法定节假日、停电等无法正常处理的情况除外）</p>
              <p>承接您的售后问题，提供准确、合理的解决方案，包括是否属于退换货范围、与仓储核实是否错漏、补发申请单等。</p>
            </div>
          },
        ]
      }
    ];
    list[0].children[0].checked = 1;
    setCurrentInfo(list[0].children[0]);
    setSupportInfo(list);
    // let basicParams = {};
    // if (location.query.type == 'brandSearch') {
    //   basicParams.brandId = location.query.id;
    // }
    // if (location.query.type == 'keywordSearch') {
    //   basicParams.k = location.query.keyword;
    // }
    // request({ url: '/api/...', method: 'GET', params: { page, pageSize: 20, ...basicParams } })
    //   .then(res => {
    //     if (res && res.retcode == 0) {
    //     }
    //   });
  };

  const onSelectOption = (index, ind) => {
    const list = [...supportInfo];
    list.forEach((item, _index) => {
      item.children.forEach((child, _ind) => {
        child.checked = 0;
        if (_index === index && _ind === ind){
          child.checked = 1;
        }
      });
    });

    console.log('list', list);
    setCurrentInfo(list[index].children[ind]);
    setSupportInfo(list);
  };
  console.log('supportInfo', supportInfo);
  console.log('currentInfo', currentInfo);

  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header/>
        <SearchHeader/>
        <div className={styles['wrapper']}>
          <div className={styles['leftMenu']}>
            {/*<div className={styles['menuChild']}>
                <div className={styles['header']}>售后指南</div>
                <div className={styles['child']}>售后政策</div>
                <div className={styles['child']}>售后政策</div>
              </div>*/}
            {
              supportInfo.map((item, index) => {
                return (
                  <div className={styles['menuChild']} key={index}>
                    <div className={styles['header']}>{item.header}</div>
                    {
                      Array.isArray(item.children) && item.children.length > 0 &&
                      item.children.map((child, ind) => (
                        <div
                          className={`${styles['child']} ${child.checked ? styles['childActive'] : ''}`}
                          key={ind} onClick={onSelectOption.bind(this, index, ind)}>{child.title}</div>
                      ))
                    }
                  </div>
                );
              })
            }
          </div>
          <div className={styles['right']}>
            <div className={styles['header']}>{currentInfo.title}</div>
            <div className={styles['content']}>{currentInfo.content}</div>
          </div>
        </div>

      </div>
    </MyProviderContainer>
  );
};

export default HelpCenter;
