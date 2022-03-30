import React, { Component } from 'react';
import { connect } from 'dva';
import withRouter from 'umi/withRouter';
import { ConfigProvider, Icon, Layout } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import LeftNav from './LeftNav';
import HeaderRight from './HeaderRight';
import Login from './Login';
import WithBreadcrumbs from './WithBreadcrumbs';
import styles from './index.less';
import NAV from './LeftNav/NavConfig';
import { canTurnTo } from '../utils/tools';
import NonJurisdiction from '../components/NonJurisdiction';

const logo = require('../assets/logo.png');
const { Header, Sider, Content } = Layout;

class App extends Component {

  state = {
    collapsed: false
  };

  componentWillMount () {
  }

  componentDidMount () {
    let width = document.body.clientWidth;
    // if (width < 1500) {
    //   this.setState({
    //     collapsed: true,
    //   });
    // }
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  // 渲染标题
  renderLogo = () => {
    const t = this;
    let { collapsed } = t.state;
    return (
      <div className={styles.logo}>
        <img src={logo}/>
        {
          !collapsed &&
          <div className={styles.logoText}>鼎泰</div>
        }
      </div>
    );
  };

  checkUser = () => {
    let t = this;
    let pathname = t.props.location.pathname;
    const userType = localStorage.getItem('userType');
    const name = pathname.split('/');

    if (name.length) {
      return canTurnTo(name[name.length - 1], [userType], NAV[userType]);
    }
  };

  render () {
    let t = this;
    const { collapsed } = t.state;
    const { navTheme, layout: PropsLayout, children } = this.props;
    const isTop = PropsLayout === 'topMenu';

    console.log(t.props.location, 787878);
    let pathname = t.props.location.pathname;

    if (pathname == '/Login' || pathname == '/login') {
      return (
        <Login/>
      );
    }

    // 在这里做权限校验
    const userJudge = t.checkUser();
    if (!userJudge) {
      // 提示用户没有权限查看当前页面
      return (
        <NonJurisdiction/>
      );
    }

    return (
      <ConfigProvider locale={zh_CN}>
        <Layout>
          {
            !isTop &&
            <Sider
              width="240"
              className={styles.sidebar}
              trigger={null}
              collapsible
              theme={navTheme}
              collapsed={collapsed}>
              {t.renderLogo()}
              <LeftNav theme={navTheme} collapsed={collapsed}/>
            </Sider>
          }

          <Layout>
            <Header className={`${styles.header} ${navTheme === 'light' ? styles.light : ''}`}>
              <div className={styles.headerLeft}>
                {
                  isTop ?
                    <>
                      {t.renderLogo()}
                      <LeftNav className={styles.topNav} mode={'horizontal'} theme={navTheme} collapsed={collapsed}/>
                    </>
                    :
                    <div className={styles.trigger}>
                      <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} onClick={this.toggle}/>
                      <WithBreadcrumbs/>
                    </div>
                }
              </div>

              <HeaderRight theme={navTheme}/>
            </Header>
            <Content>
              <div className={styles.content}>
                {children || <h1>此处为你的组件</h1>}
              </div>
            </Content>
          </Layout>
        </Layout>
      </ConfigProvider>
    );
  }
}

export default withRouter(connect(({ setting }) => ({
  layout: setting.layout,
  ...setting
}))(App));
