import React, { Component } from 'react';
import Link from 'umi/link';
import { Button } from 'antd';

class Error extends Component {
  render() {
    const imgEle = {
      height: 180,
      width: '100%',
      maxWidth: 430,
      backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/RVRUAYdCGeYNBWoKiIwB.svg")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '50% 50%;',
      backgroundSize: 'contain',
    };
    const h1 = {
      color: '#434e59',
      fontSize: '72px',
      fontWeight: '600',
      lineHeight: '72px',
      marginBottom: '24px',
    };
    const desc = {
      color: 'rgba(0,0,0,.45)',
      fontSize: '20px',
      lineHeight: '28px',
    };
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end'}}>
          <div style={{ ...imgEle }}/>
        </div>
        <div style={{ flex: 'auto' }}>
          <h1 style={{ ...h1 }}>500</h1>
          <div style={{ ...desc }}>抱歉，服务器出错了</div>
          <Button style={{ marginTop: 20 }} type={'primary'}><Link to="/Index">返回首页</Link></Button>
        </div>
      </div>
    );
  }
}

export default Error;
