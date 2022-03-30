import React from 'react';
import styles from './Title.less';

const Title = (props) => {
  let { title, style = {} } = props;
  return (
    <div className={styles['container']}>
      <h3 className={styles['title']} style={style}>{title}</h3>
    </div>
  );
}

export default Title;