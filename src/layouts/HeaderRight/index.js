import React, { Component } from 'react';
import { Avatar, Dropdown, Icon, Menu, message } from 'antd';
import router from 'umi/router';
import request from '../../utils/request';
import config from '../../config';
import { currentUser } from './testData';
import PublicService from '../../services/PublicService';
import FormModal from '../../components/common/FormModal';
import styles from './index.less';

class HeaderRight extends Component {

  state = {
    username: '',
    modalShow: false,
    modalBtnLoading: false
  };

  componentDidMount () {
    // 需要登录才可以展示
    let isHint = localStorage.getItem('logoutMsg'); // 登录过期提示判断
    let _userName = PublicService.getCookie('username');
    let u_Type = localStorage.getItem('userType'); // 用户角色

    if (!isHint || isHint == 'true' || !_userName) {
      router.push('/Login');
      return;
    }
    this.setState({
      username: _userName || ''
    });
  }

  onMenuClick = (e) => {
    if (e.key == 'editPassword') {
      this.setState({
        modalShow: true
      });
    }
    if (e.key == 'logout') {
      request({ url: '/api/logout', method: 'POST' })
        .then(res => {
          if (res && res.retcode == 0) {
            message.success('退出登录成功');
            localStorage.removeItem('userId');
            localStorage.removeItem('isAdmin');
            localStorage.setItem('logoutMsg', true); // 登录过期提示判断
            document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            router.push('/Login');
          } else {
            message.error(res.msg);
          }
        });
    }
  };

  onModalSave = (val) => {
    this.setState({
      modalBtnLoading: true
    });
    request({ url: '/api/user/chPassword', method: 'POST', form: { ...val } })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('修改成功, 请重新登录');
          router.push('/Login');
        } else {
          message.error(res.msg);
        }
        this.setState({
          modalBtnLoading: false
        });
      });
  };

  modalCancel = () => {
    this.setState({
      modalShow: false
    });
  };

  render () {
    let t = this;
    let { username, modalShow, modalBtnLoading } = t.state;
    let { theme } = t.props;

    let modalItems = [
      {
        type: 'input',
        label: '原始密码',
        paramName: 'oldPassword',
        rules: [{ ...config.reg.required }],
        span: 24,
        labelCol: 5,
        wrapperCol: 19
      }, {
        type: 'input',
        label: '新密码',
        paramName: 'newPassword',
        rules: [{ ...config.reg.required }],
        span: 24,
        labelCol: 5,
        wrapperCol: 19
      }
    ];

    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={t.onMenuClick}>
        {/* <Menu.Item key="userCenter">
          <Icon type="user"/>
          个人中心
        </Menu.Item> */}
        <Menu.Item key="editPassword">
          <Icon type="setting"/>
          修改密码
        </Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="logout">
          <Icon type="logout"/>
          退出登录
        </Menu.Item>
      </Menu>
    );
    return (
      <div className={`${styles.right} ${theme === 'light' ? styles.themeLight : styles.themeDark}`}>
        <Dropdown overlay={menu}>
          <span className={`${styles.action} ${styles.account}`}>
            <Avatar size="small" className={styles.avatar} src={currentUser.avatar}/>
            {username}
          </span>
        </Dropdown>

        {
          modalShow &&
          <FormModal
            width={500}
            visible={modalShow}
            items={modalItems}
            modalBtnLoading={modalBtnLoading}
            wrappedComponentRef={ref => this.myForm = ref}
            title={'修改密码'}
            disabledType="readOnly"
            footerShow={true}
            onModalSave={t.onModalSave}
            onCancel={t.modalCancel}
          />
        }
      </div>
    );
  }
}


export default HeaderRight;
