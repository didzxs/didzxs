import React from 'react';
import { Steps } from 'antd';
import styles from './MySteps.less';

const { Step } = Steps;

const MySteps = (props) => {
  let { current = 0 } = props;

  let steps = [
    { title: '我的购物车' },
    { title: '确认订单' },
    { title: '成功提交订单' },
  ]
  return (
    <div className={styles['container']}>
      <Steps current={current}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
    </div>
  );
}

export default MySteps;