import React from 'react';
import { Divider, Dropdown, Icon, Menu } from 'antd';
import Link from 'umi/link';
import HeaderRight from '../../../layouts/HeaderRight';
import NAV from '../../../layouts/LeftNav/NavConfig';
import styles from './index.less';

const { SubMenu } = Menu;

const Header = () => {

  const renderMenu = () => {
    return <Menu
      mode={'vertical'}
    >
      {
        setMenuItem(NAV.huiyuan)
      }
    </Menu>;
  };

  // 菜单渲染
  const setMenuItem = (data) => {
    if (data) {
      return data.map((item) => {
        if (item.sub || item.sub && item.sub.length) {
          return (
            <SubMenu
              key={item.key}
              title={
                <span>
                  <span className="wp-nav-font">{item.title}</span>
                </span>
              }>
              {setMenuItem(item.sub)}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item key={item.key}>
              <Link to={item.url}>
                <span className="wp-nav-font">{item.title}</span>
              </Link>
            </Menu.Item>
          );
        }
      });
    }
  };
  return (
    <div className={styles['container']}>
      <div className={styles['section']}>
        <div className={styles['section-left']}>
          <div className="location">
            <Icon type="environment" className={styles['environment']}/>
            <span>杭州市</span>
          </div>
          <Divider type="vertical" className={styles['vertical-line']}/>
          <div className="tip">
            <Icon type="sound" className={styles['notice']}/>
            <span>感谢您的信任与支持，全体鼎泰人将竭诚为您服务！</span>
          </div>
        </div>
        <div className={styles['section-right']}>
          <Dropdown overlay={renderMenu()}>
            <span className={`${styles['menu-box']}`}>
              <i className="iconfont icon-caidan"></i>
              菜单
            </span>
          </Dropdown>
          <HeaderRight theme="light"/>
        </div>
      </div>
    </div>
  );
};

export default Header;
