import React, { Component } from 'react';
import router from 'umi/router';
import { Button, Checkbox, Form, Icon, Input, message } from 'antd';
import { Toast } from 'antd-mobile';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import styles from './index.less';
import UserRoles from './UserRoles';

class Login extends Component {

  handleSubmit = (e) => {
    e.preventDefault();

    let isMobile = false;
    if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)) {
      isMobile = true;
    }

    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        let data = {
          username: values.username,
          password: values.password,
        }
        request({url: '/api/login', method: 'POST', form: data, headers: {"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"}})
          .then(res => {
            if(res && res.retcode == 0) {
              localStorage.setItem('userId', res.uid);
              localStorage.setItem('isAdmin', res.roles.includes('admin'));
              localStorage.setItem('logoutMsg', false); // 登录过期提示判断
              PublicService.setCookie('username', res.nick_name);
              if(isMobile) {
                if(res.roles.includes('xiaoshou')) {
                  router.push('/h5/IntentionToOrder-wfp?assigned=-2');
                  localStorage.setItem('userType', 'xiaoshou');
                } else if(res.roles.includes('xiaoshou-mgr')) {
                  router.push('/h5/IntentionToOrder-wfp?assigned=-2');
                  localStorage.setItem('userType', 'xiaoshou_mgr');
                } else {
                  Toast.info('请使用销售账号登录');
                }
                return;
              }

              // 确认角色页面权限
              let role = UserRoles.find(item => (res.roles.includes(item.type))) || {};
              if (role.hasOwnProperty('home_link') && role.hasOwnProperty('role')) {
                message.success('登录成功');

                localStorage.setItem('userType', role.role);
                router.push(role.home_link);
              }else{
                message.error('登录失败，账号权限有误，请联系管理员！');
              }

              // if(res.roles.includes('admin')) {
              //   router.push('/web/HomePage');
              // }
              // switch(true) {
              //   case res.roles.includes('admin'):
              //     localStorage.setItem('userType', 'admin');
              //     break;
              //   case res.roles.includes('yunying'):
              //     router.push('/web/CommodityEdit?status=0');
              //     localStorage.setItem('userType', 'yunying');
              //     break;
              //   case res.roles.includes('yunying-mgr'):
              //     router.push('/web/CommodityEdit?status=0');
              //     localStorage.setItem('userType', 'yunying_mgr');
              //     break;
              //   case res.roles.includes('gongcheng'):
              //     router.push('/web/ProjectOrder');
              //     localStorage.setItem('userType', 'gongcheng');
              //     break;
              //   case res.roles.includes('gc-weibao'):
              //     router.push('/web/ProjectOrder');
              //     localStorage.setItem('userType', 'gc_weibao');
              //     break;
              //   case res.roles.includes('gc-zhihuixiaofang'):
              //     router.push('/web/ProjectOrder');
              //     localStorage.setItem('userType', 'gc_zhihuixiaofang');
              //     break;
              //   case res.roles.includes('gc-gongcheng'):
              //     router.push('/web/ProjectOrder');
              //     localStorage.setItem('userType', 'gc_gongcheng');
              //     break;
              //   case res.roles.includes('gc-chengben'):
              //     router.push('/web/ProjectOrder');
              //     localStorage.setItem('userType', 'gc_chengben');
              //     break;
              //   case res.roles.includes('huiyuan'):
              //     router.push('/web/ShoppingMall');
              //     localStorage.setItem('userType', 'huiyuan');
              //     break;
              //   case res.roles.includes('kefu'):
              //     router.push('/web/IntentionToOrder');
              //     localStorage.setItem('userType', 'kefu');
              //     break;
              //   case res.roles.includes('kefu_mgr'):
              //     router.push('/web/IntentionToOrder');
              //     localStorage.setItem('userType', 'kefu_mgr');
              //     break;
              //   case res.roles.includes('xiaoshou-mgr'):
              //     router.push('/web/IntentionToOrder-wfp?assigned=-2');
              //     localStorage.setItem('userType', 'xiaoshou_mgr');
              //     break;
              //   case res.roles.includes('xiaoshou'):
              //     router.push('/web/IntentionToOrder-wfp?assigned=-2');
              //     localStorage.setItem('userType', 'xiaoshou');
              //     break;
              //   case res.roles.includes('xiaoshou-shangzhi'):
              //     router.push('/web/OrderList-kf');
              //     localStorage.setItem('userType', 'xiaoshou_sz');
              //     break;
              //   case res.roles.includes('cangku'):
              //     router.push('/web/OrderList-cangku?orderType=1');
              //     localStorage.setItem('userType', 'cangku');
              //     break;
              //   case res.roles.includes('cangku-qiantai'):
              //     router.push('/web/OrderList-cangku?orderType=1');
              //     localStorage.setItem('userType', 'cangku_qt');
              //     break;
              //   case res.roles.includes('caiwu'):
              //     router.push('/web/HomePage');
              //     localStorage.setItem('userType', 'caiwu');
              //     break;
              //   case res.roles.includes('caiwu-chuna'):
              //     router.push('/web/OrderForm');
              //     localStorage.setItem('userType', 'caiwu_cn');
              //     break;
              //   case res.roles.includes('caigou'):
              //     router.push('/web/OrderForm');
              //     localStorage.setItem('userType', 'caigou');
              //     break;
              //   case res.roles.includes('hr'):
              //     router.push('/web/TalentRecruitment');
              //     localStorage.setItem('userType', 'hr');
              //     break;
              //   default:
              //     break;
              // }
            } else {
              message.error(res.msg || '登录失败');
            }
          })
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles['container']}>
        <div className={styles['login-main']}>
          <div className={styles['login-title']}>用户登录</div>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Form.Item>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: '请输入帐号!' }],
              })(
                <Input
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="帐号"
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请输入密码!' }],
              })(
                <Input
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  type="password"
                  placeholder="密码"
                />,
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(<Checkbox>记住密码</Checkbox>)}
              <Button type="primary" htmlType="submit" className={styles["login-form-button"]}>
                登录
              </Button>
            </Form.Item>
          </Form>
          <div className={styles['copyright']}>Copyright © 2021 - 鼎泰</div>
        </div>
      </div>
    );
  }
}

export default Form.create()(Login);
