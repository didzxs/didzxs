import React, { Component } from 'react';
import { Menu } from 'antd';
import Link from 'umi/link';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import NAV from './NavConfig';
import MyIcon from '../../components/common/MyIcon';
import styles from './index.less';

const SubMenu = Menu.SubMenu;


class LeftNav extends Component {
  state = {
    current: 'Index',
    openKeys: [],
    setNavTop: '', // 导航样式
    navSettings: [],
  };

  componentDidMount() {
    let t = this;
    let userType = localStorage.getItem('userType');
    let type = 1;
    if(userType != 9 && userType != 7) {
      type = 2;
    }
    if(userType == 10) {
      type = 3;
    }
    t.setState({
      navSettings: NAV[userType] || [],
    }, () => {
      t.getAddress();
    })
  }

  // 获取路由
  getAddress = () => {
    let { navSettings } = this.state;
    let address = window.location.href.substring(window.location.href.lastIndexOf('/') + 1, window.location.href.length);
    let current = '';
    let openKeys = [];
    navSettings.map((item, index) => {
      if (item.url && (item.url === address)) {
        current = item.key;
        openKeys.push(item.key);
      }
      item.sub && item.sub.map((itemSub, index) => {
        if (itemSub.url && (itemSub.url === address)) {
          current = itemSub.key;
          openKeys.push(item.key, itemSub.key);
        }
        itemSub.sub && itemSub.sub.map((itemSubSub, index) => {
          if (itemSubSub.url && (itemSubSub.url === address)) {
            current = itemSubSub.key;
            openKeys.push(item.key, itemSub.key, itemSubSub.key);
          }
        });
      });
    });
    this.setState({
      current,
      openKeys,
    });
  };

  // 控制左边导航栏只展示一个父节点
  onOpenChange = (openKeys) => {
    let { navSettings } = this.state;
    const latestOpenKey = openKeys.find(key => this.state.openKeys.indexOf(key) === -1);
    if (latestOpenKey && latestOpenKey.length > 2) {
      let [firstKey, ...all] = this.state.openKeys;
      let nextKeys = openKeys.pop();
      this.setState({
        openKeys: [firstKey, nextKeys],
      });
    } else {
      let rootSubmenuKeys = [];
      navSettings.map((item, index) => {
        rootSubmenuKeys.push(item.key);
      });
      if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
        this.setState({ openKeys });
      } else {
        this.setState({
          openKeys: latestOpenKey ? [latestOpenKey] : [],
        });
      }
    }
  };

  handleClick = (e) => {
    this.setState({ current: e.key });
  };

  // 菜单渲染
  setMenu = (data) => {
    if(data) {
      return data.map((item) => {
        if (item.sub || item.sub && item.sub.length) {
          return (
            <SubMenu
              key={item.key}
              title={
                <span>
                  <MyIcon className={styles.navItem} type={item.icon}/>
                  <span className='wp-nav-font'>{item.title}</span>
                </span>
              }>
              {this.setMenu(item.sub)}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item key={item.key}>
              <Link to={item.url}>
                <MyIcon className={styles.navItem} type={item.icon}/>
                <span className='wp-nav-font'>{item.title}</span>
              </Link>
            </Menu.Item>
          );
        }
      });
    }
  };

  render() {
    let t = this;
    let { navSettings, current, openKeys } = t.state;
    let { collapsed, theme, mode, className } = this.props;
    return (
      <div className={`${styles.nav} ${className}`}>
        {
          collapsed &&
          <Menu
            theme={theme}
            mode={mode || 'vertical'}
            selectedKeys={[current]}
            onClick={this.handleClick.bind(t)}>
            {
              this.setMenu(navSettings)
            }
          </Menu>
        }
        {
          !collapsed &&
          <Menu
            theme={theme}
            mode={mode || 'inline'}
            openKeys={openKeys}
            onOpenChange={this.onOpenChange}
            selectedKeys={[current]}
            onClick={this.handleClick.bind(t)}
          >
            {
              this.setMenu(navSettings)
            }
          </Menu>
        }
      </div>

    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default withRouter(connect(mapStateToProps)(LeftNav));
