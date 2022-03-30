/**
 * 个人信息
 */

import React, { useEffect, useState } from 'react';
import { Card } from 'antd';
import request from '../../utils/request';
import Container from '../../components/common/Container';
import styles from './index.less';

const PersonalInfo = () => {
  let [data, setData] = useState({});

  useEffect(() => {
    let userId = localStorage.getItem('userId');
    request({url: '/api/user/memberInfo/', method: 'GET', params: {uid: userId}})
      .then(res => {
        if(res && res.retcode == 0) {
          setData(res.data);
        }
      })
  }, [])
  return (
    <div className={styles['container']}>
      <Container heightAuto={true}>
        <Card title="个人信息" className={styles['my-info']} style={{ width: 300 }}>
          <p>姓名：{data.nick_name}</p>
          <p>手机号：{data.mobile}</p>
          <p>授权额度：{data.pre_balance && data.pre_balance / 100 || ''}</p>
          {/*<p>剩余额度：{data.post_balance && data.post_balance / 100 || ''}</p>*/}
          <p>皇冠：👑</p>
          {/* <p>应付统计按账期：</p> */}
        </Card>
      </Container>

    </div>
  );
}

export default PersonalInfo;
