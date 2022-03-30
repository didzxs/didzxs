import moment from 'moment';
import Util from '../utils/Util';


export default class PublicService {

  /**
   * @param allProjectInfo 所有项目信息数组
   * @param valueIndex select option的value
   * @param textIndex select option的text
   * @param addAll 添加option {value: '', text: '全部'}
   * @param paramsAll 添加全部元素
   * @returns {Array} 根据需要生成的select option配置
   */
  static transformProjectInfoToSelect(allProjectInfo, valueIndex, textIndex, addAll, paramsAll) {
    let selectOpts = [];
    if (addAll) {
      selectOpts.push({ value: '', label: '全部' });
    }
    if (allProjectInfo && allProjectInfo.length !== 0) {
      for (let i = 0, l = allProjectInfo.length; i < l; i++) {
        if (paramsAll) {
          selectOpts.push({
            ...allProjectInfo[i],
            value: allProjectInfo[i][valueIndex],
            label: allProjectInfo[i][textIndex],
          });
        } else {
          selectOpts.push({ value: allProjectInfo[i][valueIndex], label: allProjectInfo[i][textIndex] });
        }

      }
    }
    return selectOpts;
  }

  /**
   * @param data 数据源
   * @param valueIndex option的value
   * @param labelIndex option的label
   * @param addAll 添加option {value: '', text: '全部'}
   * @param paramsAll 添加全部元素
   * @returns {Array} 根据需要生成的select option配置
   */
  static transformOptions(data, valueIndex = 'id', labelIndex = 'name', addAll, paramsAll) {
    let options = [];
    if (addAll) {
      options.push({ value: '', label: '全部' });
    }
    if (data && data.length) {
      for (let i = 0; i < data.length; i++) {
        let option = {
          value: `${data[i][valueIndex]}`,
          label: data[i][labelIndex],
          text: data[i][labelIndex],
        };

        if (paramsAll) {
          option = { ...data[i], ...option };
        }

        options.push(option);
      }
    }
    return options;
  }

  /**
   * 时间格式化
   * @param text 时间戳
   * @param format 转换格式(默认为YYYY-MM-DD)
   */
  static setTime = (text, format = 'YYYY-MM-DD') => {
    return moment(text).format(format);
  };


  /**
   * 生成随机id
   * @param len 长度
   * */
  static RandomId(len = 6) {
    return Math.random().toString(36).substr(3, len);
  }

  /**
   * 格式化金钱
   * @param num 值
   * */
  static FormatMoney(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * 生成随机颜色
   * @param len 长度
   * */
  static RandomColor(len = 6) {
    return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padEnd(6, '0');
  }

  /**
   * 验证数据类型
   * @param tgt 目标
   * @param type 预测类型
   * */
  static DataType(tgt, type) {
    const dataType = Object.prototype.toString.call(tgt).replace(/\[object /g, '').replace(/\]/g, '').toLowerCase();
    return type ? dataType === type : dataType;
  }

  // 验证手机号码和座机
  static checkTel(value) {
    let isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
    let isMob = /^((\+?86)|(\(\+86\)))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
    if (isMob.test(value) || isPhone.test(value)) {
      return true;
    } else {
      return false;
    }
  };

  // 校验经度是否符合规范
  static checkLong(val) {
    let longReg = /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,4})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,6}|180)$/;
    if (!longReg.test(val)) {
      return '经度整数为0-180,小数为0到4位!';
    }
    return false;
  }

  // 校验纬度是否符合规范
  static checkLat(val) {
    let latReg = /^(\-|\+)?([0-8]?\d{1}\.\d{0,4}|90\.0{0,6}|[0-8]?\d{1}|90)$/;
    if (!latReg.test(val)) {
      return '纬度整数为0-90,小数为0到4位!';
    }
    return false;
  }

  /**
   * 实现对象的深克隆
   * obj 为需要克隆对象
   * **/
  static deepClone(obj) {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (!obj) {
      return;
    }
    let newObj = obj.constructor === Array ? [] : {};  //开辟一块新的内存空间
    for (let i  in  obj) {
      newObj[i] = this.deepClone(obj[i]);                 //通过递归实现深层的复制
    }
    return newObj;
  }


  /**
   * @param data 需要转换结构的源数据
   * @param needColNum 需要增加table序号列数据
   * @param needKey 需要增加唯一标识key
   * @param currentPage 当前页
   * @param pageSize 每页数据数目
   * @returns {*} 转换后的数据
   */
  static transformArrayData(data, needColNum, needKey, currentPage, pageSize) {
    // 需要添加table序号
    if (needColNum) {
      for (let i = 0; i < data.length; i++) {
        // 有分页
        if (currentPage && pageSize) {
          data[i]['num'] = pageSize * (currentPage - 1) + i + 1;
          // 无分页
        } else {
          data[i]['num'] = i + 1;
        }
      }
      // 需要添加唯一标识key
    }
    // 添加Key
    if (needKey) {
      for (let i = 0; i < data.length; i++) {
        // 若数据不存在key字段,则增加唯一标识key
        if (!data[i]['key']) data[i]['key'] = i;
      }
    }
    if (!needColNum && !needKey) {
      console.info('检查transformArrayData方法参数(needColNum,needKey),返回数据结构未改变');
    }
    return data;
  }

  /**
   * @param array 需要去重的数组
   * @param keys 指定的根据字段
   * @returns {Array} 返回筛选后的数组对象
   */
  static uniqeByKeys(array, keys) {
    let result = [], hash = {};
    for (let i = 0; i < array.length; i++) {
      let elem = array[i][keys];
      if (!hash[elem]) {
        result.push(array[i]);
        hash[elem] = true;
      }
    }
    return result;
  }

  /**
   * @param data 需要转换结构的源数据
   * @param parentKey 父元素Key值
   * @param newKey 子元素key
   */
  static addKey(data, parentKey, newKey) {
    // 添加Key
    if (newKey) {
      for (let i = 0; i < data.length; i++) {
        // 增加唯一标识key
        data[i]['key'] = parentKey ? parentKey + '-' + i : i;
      }
    }
    return data;
  }

  /**
   * @param data 需要转换结构的源数据
   * @param keyName key名称
   * @param num 序号
   */
  static setKey(data, keyName, num) {
    data.map((item, index) => {
      item.key = item[keyName];
      if (num) {
        item.num = index + 1;
      }
    });
    return data;
  }

  /**
   *  返回指定的字段的一维数组
   *  @param data: 数据源，[{},{}]
   *  @param key: 指定键名
   *  @returns 返回一维数组
   *
   */
  static getDataByKey(data, key) {
    let list = [];
    if (data && data.length) {
      data.map(item => {
        list.push(item[key]);
      });
    }
    return list;
  }

  /***
   * @columns 表格的columns属性
   * @returns {number} table宽度
   */
  static getTableWidth(columns) {
    let tableWidth = 0;
    for (let i = 0; i < columns.length; i++) {
      if (columns[i].width) {
        tableWidth = tableWidth + parseInt(columns[i].width);
      } else {
        console.log('PublicService->getTableWidth: columns 中没有配置width属性');
      }
    }
    return tableWidth;
  }

  /**
   * @data 数据源(['1', '2'] ||  [{title: '标题', dataIndex: '对应字段', width: '表格宽度', format: '格式化时间'}])
   */
  static getTableColumns(data) {
    data.map((item, index) => {
      if (typeof item === 'string') {
        data[index] = {
          title: item,
          key: item + index,
          dataIndex: item + index,
          width: PublicService.getColumnWidth(item),
        };
      } else {
        let { title, dataIndex, width, format } = item;
        item.dataIndex = dataIndex ? dataIndex : title;
        item.width = width ? width : PublicService.getColumnWidth(title);
        if (format) {
          item.render = (text) => (<span>{text ? moment(text).format(format) : null}</span>);
        }
        if (item.children && item.children.length) {
          PublicService.getTableColumns(item.children);
        }
      }
    });
    return data;
  }

  /***
   * @title 文字
   * @returns {number} 列宽度
   */
  static getColumnWidth(str) {
    let strLen = 0;
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 255) //如果是汉字，则字符串长度加2
        strLen += 2;
      else
        strLen++;
    }
    return strLen * 8 + 30;
  }

  /**
   * @param params 导出文件所需参数
   * @returns {*}   返回导出拼接字符串
   */
  static paramSerializer(params) {
    if (!params) return '';
    let urlPart = [];
    for (let k in params) {
      let value = params[k];
      if (value === null || Util.isUndefined(value)) continue;
      if (Util.isArray(value)) {
        for (let i = 0, l = value.length; i < l; i++) {
          urlPart.push(k + '=' + value[i]);
        }
      } else {
        urlPart.push(k + '=' + value);
      }
    }
    return urlPart.join('&');
  }

  // 浏览器全屏方法
  static fullScreen(element) {
    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  }

  // 取消全屏
  static outFull(document) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitCancelFullScreen) {
      document.webkitCancelFullScreen();
    } else {
      window.parent.showTopBottom();
    }
  }

  static getCurSysDateFromMillforDay(mill, isChinese) {
    let d = new Date();
    d.setTime(mill);
    if (isChinese) {
      return '第' + d.getDate() + '天';
    }
    return d.getDate();
  }

  /**
   * 保存字段到cookie
   * @param c_name 要保存字段的名称
   * @param value 要保存字段的值
   * @param expireDays 过期时间
   */
  static setCookie(c_name, value, expireDays = 30) {
    document.cookie = c_name + '=' + escape(value);
    // cookie过期时间
    // let expireTimeCode = timeCode + (60 * 60 * 24 * expireDays);
    // if (expireDays)
    //   document.cookie = 'expireTimeCode=' + expireTimeCode
  }

  /**
   * 从cookie中取字段
   * @param c_name 要取得的字段名
   * @returns {string} 返回字段对应的值, 若字段不存在则返回空
   */
  static getCookie(c_name) {
    if (document.cookie.length > 0) {
      let c_start = document.cookie.indexOf(c_name + '=');
      if (c_start !== -1) {
        c_start = c_start + c_name.length + 1;
        let c_end = document.cookie.indexOf(';', c_start);
        if (c_end == -1) c_end = document.cookie.length;
        return unescape(document.cookie.substring(c_start, c_end));
      }
    }
    return '';
  };

  /**
   * 清空cookie中某字段
   * @param name 要清空的字段名
   */
  static clearCookie(name) {
    this.setCookie(name, '', -1);
  }

  /**
   * 返回localStorage中的用户信息
   * @param sessionName 要获取的对象信息
   * @param name 要获取的对象中的信息
   */
  static getSessionItem(sessionName, name) {
    let content = '';
    if (name) {
      const session = JSON.parse(localStorage.getItem(sessionName));
      if (session) {
        content = session[name];
      }
    } else {
      content = localStorage.getItem(sessionName);
    }
    return content;
  }

  // 年份选择
  static yearSelect() {
    let curYear = new Date().getFullYear();
    let yearSelectOpt = [];
    for (let i = curYear - 100; i < curYear + 100; i++) {
      yearSelectOpt.push({
        text: i,
        value: i,
      });
    }
    return yearSelectOpt;
  }

  /**
   * 将数组按键名取出单一值
   * @param arr [] 目标数组
   * @param key [] 取出数据的属性名
   * @param where ()
   * @returns [] 一维数组
   */
  static arrDataBy(arr, key, where) {
    let data = [];
    for (let i = 0; i < arr.length; i++) {
      let val = arr[i][key];
      if (where) {
        if (typeof where === 'function') {
          let B = where(arr[i]);
          if (B) {
            data.push(val);
          }
        } else if (typeof where === 'string') {
          if (arr[i][where]) {
            data.push(val);
          }
        }
      } else {
        data.push(val);
      }
    }
    return data;
  }

  /**
   * 循环两个数据，根据条件返回新的数组
   * @param arr 目标数组
   * @param arr2 数组2
   * @param keys 条件名称
   * @returns [] 符合条件的数据
   */
  static arrByKey(arr = [], arr2 = [], keys = []) {
    let list = [];
    arr.map(item => {
      let num = 0; // 记录比对成功次数
      arr2.map(subItem => {
        keys.map(key => {
          item[key] === subItem[key] && num++;
        });
      });
      // 比对成功的次数等于比较字段长度，视为比对成功
      num === keys.length && list.push({ ...item });
    });
    return list;
  }

  /**
   * 将数组根据目标键名中取出
   * @param arr 目标数组
   * @param keys 目标键名
   * @param exclude 是否为排除目标键名模式，默认为false
   *  false: 按键名获取字段; true: 获取键名以外的字段
   * @return []
   * */
  static arrToKeyData(arr = [], keys = [], exclude = false) {
    let data = [];
    arr.map((item, index) => {
      data[index] = {};
      let keyNames = Object.keys(item); // 获取arr键名集合
      keys.map(key => {
        keyNames.map(keyName => {
          // 判断是否为排除模式
          if (keyName === key && !exclude) {
            data[index][keyName] = item[key];
          } else if (keyName !== key && exclude) {
            data[index][keyName] = item[key];
          }
        });
      });
    });
    return data;
  };

  /***
   * 将对象数组按照对象某一属性分组
   * 每组的数据保存属性data中
   * @param arr 目标数组
   * @param index 分组根据的属性名
   */
  static arrGroupBy(arr, index) {
    let map = {};
    let dest = [];
    for (let i = 0; i < arr.length; i++) {
      let ai = arr[i];
      if (!map[ai[index]]) {
        dest.push({
          [index]: ai[index],
          data: [ai],
        });
        map[ai[index]] = ai;
      } else {
        for (let j = 0; j < dest.length; j++) {
          let dj = dest[j];
          if (dj[index] === ai[index]) {
            dj.data.push(ai);
            break;
          }
        }
      }
    }
    return dest;
  }

  /***
   * 将对象数组按照对象某一属性分组
   * 每组的数据保存属性data中
   * @param startTime 开始日期
   * @param endTime 结束日期
   * @param format 格式化
   * @param symbol 转换符号
   * @return "" 返回字符"xxxx~xxxx"
   */
  static transformTime(startTime, endTime, format = 'YYYY-MM-DD HH:mm:ss', symbol = '~') {
    startTime = startTime ? moment(startTime).format(format) : '--';
    endTime = endTime ? moment(endTime).format(format) : '--';
    return startTime + symbol + endTime;
  }

  /***
   * 获取url参数
   * @param name 目标参数名称
   */
  static getQueryString(name) {
    let reg = new RegExp('(^|&?)' + name + '=([^&]*)(&|$)');
    let r = window.location.href.substr(1).match(reg);
    if (r !== null) {
      return unescape(r[2]);
    }
    return null;
  }

  // 高德转天地图
  static onConvertFrom(lng, lat) {
    //定义一些常量
    let PI = 3.1415926535897932384626;
    let a = 6378245.0;
    let ee = 0.00669342162296594323;

    function gcj02towgs84(lng, lat) {
      if (out_of_china(lng, lat)) {
        return [lng, lat];
      } else {
        let dlat = transformlat(lng - 105.0, lat - 35.0);
        let dlng = transformlng(lng - 105.0, lat - 35.0);
        let radlat = lat / 180.0 * PI;
        let magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        let sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * PI);
        let mglat = lat + dlat;
        let mglng = lng + dlng;
        return [lng * 2 - mglng, lat * 2 - mglat];
      }
    }

    function transformlat(lng, lat) {
      let ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
      return ret;
    }

    function transformlng(lng, lat) {
      let ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
      ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
      return ret;
    }

    function out_of_china(lng, lat) {
      return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    }

    return gcj02towgs84(lng, lat);
  }

  // 天地图转高德
  static onConvertFrom2(LNG, LAT) {
    //转换常数
    let pi = 3.14159265358979324;
    let a = 6378245.0;
    let ee = 0.00669342162296594323;

    function transformLon(x, y) {
      let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
      return ret;
    }

    function transformLat(x, y) {
      let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
      return ret;
    }

    function outOfChina(lng, lat) {
      return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
    }

    function transform(wgLat, wgLon) {
      let point = {};
      if (outOfChina(wgLat, wgLon)) {
        point.lat = wgLat;
        point.lon = wgLon;
        return point;
      }
      let dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
      let dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
      let radLat = wgLat / 180.0 * pi;
      let magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      let sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
      point.lat = wgLat + dLat - 0.00345;
      point.lon = wgLon + dLon - 0.00145;
      return point;
    }

    return transform(LNG, LAT);
  }

  /**
   * 自定义函数名：PrefixZero
   * @param num： 被操作数
   * @param n： 固定的总位数
   */
  static PrefixZero(num, n) {
    return (Array(n).join(0) + num).slice(-n);
  }

  // 自定义上传文件
  static myUploadFn({ param, name, serverURL, type } = {}, callback) {
    let { file } = param;

    // 判断是否存在文件
    if (!file) {
      callback({});
      return false;
    }

    // 判断类型
    if (file.type && type) {
      let typeB = file.type.indexOf(type) === -1;
      if (typeB) {
        callback({});
        return false;
      }
    }

    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    const successFn = (response) => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      let data = JSON.parse(xhr.responseText);
      if (data.rc === 0 || data.code === 1) {
        callback(data.ret || data.data);
      }
    };

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      callback({});
    };

    xhr.addEventListener('load', successFn, false);
    xhr.addEventListener('error', errorFn, false);
    xhr.addEventListener('abort', errorFn, false);

    fd.append(`${name}`, file);
    xhr.open('POST', serverURL, true);
    xhr.send(fd);
  }

  /**
   * 修改网站图标和标题
   */
  static changeTitleAndIcon({ title, icon }) {
    if (icon) {
      const changeFavicon = link => {
        let $favicon = document.querySelector('link[rel="icon"]');
        // If a <link rel="icon"> element already exists,
        // change its href to the given link.
        if ($favicon !== null) {
          $favicon.href = link;
          // Otherwise, create a new element and append it to <head>.
        } else {
          $favicon = document.createElement('link');
          $favicon.rel = 'icon';
          $favicon.href = link;
          document.head.appendChild($favicon);
        }
      };
      changeFavicon(icon); // 动态修改网站图标
    }
    if (title) {
      document.title = title; // 动态修改网站标题
    }
  }

  static transformFileSize(limit) {
    let size = '';
    if (limit < 0.1 * 1024) {                            //小于0.1KB，则转化成B
      size = limit.toFixed(2) + 'B';
    } else if (limit < 0.1 * 1024 * 1024) {            //小于0.1MB，则转化成KB
      size = (limit / 1024).toFixed(2) + 'KB';
    } else if (limit < 0.1 * 1024 * 1024 * 1024) {        //小于0.1GB，则转化成MB
      size = (limit / (1024 * 1024)).toFixed(2) + 'MB';
    } else {                                            //其他转化成GB
      size = (limit / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
    }

    let sizeStr = size + '';                        //转成字符串
    let index = sizeStr.indexOf('.');                    //获取小数点处的索引
    let dou = sizeStr.substr(index + 1, 2);            //获取小数点后两位的值
    if (dou === '00') {                                //判断后两位是否为00，如果是则删除00
      return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2);
    }
    return size;
  }

  /**
   * 文本内容超出部分省略号显示
   * @param text 文本内容
   * @param lens 要省略文本长度(不传默认为10)
   */
  static stringToEllipsisText = (text, lens) => {
    let val = text;
    let strLen = 0;
    lens = lens * 2;
    for (let i = 0; i < text.length; i++) {
      //如果是汉字，则字符串长度加2
      if (text.charCodeAt(i) > 255) {
        strLen += 2;
      } else {
        strLen++;
      }
      if (strLen >= lens) {
        val = text.substr(0, strLen) + '...';
        break;
      }
    }
    return val;
  };
}
