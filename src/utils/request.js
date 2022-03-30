import PublicService from '../services/PublicService';
import 'isomorphic-fetch';
import { message } from 'antd';
import qs from 'qs';
import Util from './Util';
import { createHashHistory } from 'history';
import router from 'umi/router';

// require("es6-promise").polyfill();

let history = createHashHistory();

function parseJSON (response) {
  return response.json();
}

function checkStatus (response) {
  // token超期
  if (response.status === 401) {
    return history.push({
      pathname: '/login',
      state: {
        loginOut: true,
        message: '登录过期，请重新登录',
        messageType: 'error'
      }
    });
  }

  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function transformRequestData (data) {
  let obj = deleteUndefindeProps(data);
  return Util.isObject(obj) ? JSON.stringify(obj) : obj;
}

function deleteUndefindeProps (Obj) {
  let newObj;
  if (Obj instanceof Array) {
    newObj = []; // 创建一个空的数组
    let i = Obj.length;
    while (i--) {
      newObj[i] = deleteUndefindeProps(Obj[i]);
    }
    return newObj;
  } else if (Obj instanceof Object) {
    newObj = {}; // 创建一个空对象
    for (let k in Obj) {
      // 为这个对象添加新的属性
      newObj[k] = deleteUndefindeProps(Obj[k]);
    }
    return newObj;
  } else {
    return Util.isUndefined(Obj) ? null : Obj;
  }
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */

export default function request (options) {
  if (!Util.isObject(options)) {
    throw new Error('Http request configuration must be an object');
  }
  if (!Util.isString(options.url)) {
    throw new Error('Http request configuration url must be a string');
  }
  // if (options.headers && !Util.isObject(options.headers)) {

  //   throw new Error('Http request headers must be a string');
  // }
  // const defaultOpt = { method: "GET" };
  let params = PublicService.paramSerializer(options.params);
  if (params) options.url = `${options.url}?${params}`;
  if (options.method && options.method.toLowerCase() === 'export') {
    window.location = options.url;
    return {};
  }
  let opt = {};
  for (let k in options) {
    if (k !== 'params') {
      opt[k] = options[k];
    }
  }

  if (opt.form) {
    opt.headers = {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      ...opt.headers
    };
  }

  let headers;
  // if (!opt.headers) {
  let token = PublicService.getCookie('token');
  opt.headers = opt.headers || {};
  headers = new Headers({
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=UTF-8',
    token: token,
    ...opt.headers
  });
  // }

  opt.headers = headers;
  opt.credentials = 'include'; // 发送请求时带cookie
  if (opt.data || opt.form) {
    opt.body = opt.data ? transformRequestData(opt.data) : qs.stringify(opt.form);
  }

  // 请求地址加入公共路径
  return fetch(options.url, opt)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => {
      // if (!data.code) {
      //   notification.open({
      //     message: '提示',
      //     description: data.message,
      //     duration: 3,
      //   });
      // }

      let isHint = localStorage.getItem('logoutMsg'); // 判断是否提示过防止多次弹出，false 为已登录
      if (isHint == 'false' && data.retcode == 99) {
        console.log('data', data);
        localStorage.setItem('logoutMsg', true); // 用于登录状态提示判断
        message.error('登录过期，请重新登录');
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        document.cookie = 'username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        router.push('/Login');
      }
      return data;
    })
    .catch(err => {
      // notification.open({
      //   message: '提示',
      //   description: '网络错误',
      //   duration: 3,
      // });
    });
}
