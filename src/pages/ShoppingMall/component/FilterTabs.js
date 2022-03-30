import React, { useState, useImperativeHandle, forwardRef } from 'react';
import styles from './FilterTabs.less';

let FilterTabs = (props, ref) => {
  let { list = [], style = {}, allShow = true, initValue, onTabsChange } = props;

  let [tabValue, setTabValue] = useState(initValue);
  let [open, setOpen] = useState(false);

  const openBtnClick = () => {
    setOpen(!open);
  }

  const onTabsClick = (value) => {
    setTabValue(value);
    onTabsChange && onTabsChange(value);
  }

  useImperativeHandle(ref, () => ({
    resetValue: () => {
      setTabValue();
    }
  }))
  return (
    <div className={`${styles['filter-tabs']} ${open && styles['filter-tabs-open']}`} style={style}>
      {
        allShow &&
        <div className={`${styles['all']} ${initValue == undefined && styles['all-active']}`} onClick={onTabsClick.bind(this, undefined)}>
          <span>全部</span>
        </div>
      }
      <div className={styles['tabs']}>
        {
          list &&
          list.map((item, index) => (
            <div className={`${styles['tabs-item']} ${tabValue == item.value && styles['tabs-item-active']}`} key={index} onClick={onTabsClick.bind(this, item.value)}>
              <span>{item.label}</span>
            </div>
          ))
        }
      </div>
      <div className={styles['open-btn']} onClick={openBtnClick}>{open ? '-' : '+'}</div>
    </div>
  );
}

FilterTabs = forwardRef(FilterTabs);

export default FilterTabs;