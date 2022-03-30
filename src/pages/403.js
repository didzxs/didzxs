import React, { Component } from 'react';

class Error extends Component {
  render() {
    const imgEle = {
      height: 360,
      width: '100%',
      backgroundImage: 'url("https://gw.alipayobjects.com/zos/rmsportal/wZcnGqRDyhPOEYFcZDnb.svg")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: '90% 0',
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
        <div style={{ width: '50%', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ ...imgEle }}/>
        </div>
        <div style={{ flex: 'auto' }}>
          <h1 style={{ ...h1 }}>403</h1>
          <div style={{ ...desc }}>抱歉，您似乎没有权限进入该页面！</div>
        </div>
      </div>
    );
  }
}

export default Error;
