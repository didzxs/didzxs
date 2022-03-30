import React, { Component } from 'react';
import styles from './index.less';
import { Button } from 'antd';
import { router } from 'umi';

class NonJurisdiction extends Component {
  componentDidMount () {
    console.log('router', router);
  }

  onJump = (path) => {
    router.push(path);
  };

  render () {
    let t = this;
    let { id = 'Jurisdiction' } = t.props;

    return (
      <div id={id} className={styles['container']}>
        <div className={styles['flex-center']}>
          抱歉，您没有权限查看当前页面！
        </div>
        <div className={styles['flex-center']}>
          <Button onClick={router.goBack} style={{ marginRight: '20px' }}>返回</Button>
          <Button type="primary" onClick={t.onJump.bind(this, '/Login')} style={{ marginRight: '20px' }}>去登录</Button>
          {/*<Button type="primary" onClick={t.onJump.bind(this, '')}>返回首页</Button>*/}
        </div>
      </div>
    );
  }
}

export default NonJurisdiction;
