export default class Util {
  // 递归格式化工具
  static EcursiveFormat = (json, fn, leverName = "children") => {
    return json.map((v) => {
      const children = v[leverName];
      const item = fn(v);
      if (children) {
        item.children = Util.EcursiveFormat(children, fn);
      }
      return item;
    });
  };

  static isUndefined(value) {
    return typeof value === "undefined";
  }

  static isDefined(value) {
    return typeof value !== "undefined";
  }

  static isObject(value) {
    // http://jsperf.com/isobject4
    return value !== null && typeof value === "object";
  }

  static isString(value) {
    return typeof value === "string";
  }

  static isNumber(value) {
    let reg = /^[-|+]?[0-9]+(\.?[0-9]+)?$/;
    return typeof value === "number" || reg.test(value);
  }

  static isDate(value) {
    return toString.call(value) === "[object Date]";
  }

  static isFunction(value) {
    return typeof value === "function";
  }

  static isRegExp(value) {
    return toString.call(value) === "[object RegExp]";
  }

  static isBoolean(value) {
    return typeof value === "boolean";
  }

  static isElement(node) {
    return !!(
      node &&
      (node.nodeName || // we are a direct element
        (node.prop && node.attr && node.find))
    ); // we have an on and find method part of jQuery API
  }

  static isArray = Array.isArray;

  /**
   * 数字转字符串
   */
  static numToString(num) {
    if (Util.isNumber(num)) {
      return num + "";
    } else {
      return num;
    }
  }

  /**
   * 获取年份
   */
  static getAllYear(num) {
    let year = new Date().getFullYear();
    let arr = [];
    for (let i = 0; i < num; i++) {
      arr.push({
        value: year - i,
        text: year - i,
      });
    }
    return arr;
  }

  /**
   * moment时间转成0点
   */
  static momentFirstTime(date) {
    date.set({
      month: 0,
      date: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    return date;
  }

  /**
   * 时间转时间戳
   */
  static getTime(date) {
    let time = new Date(date.toString()).getTime();
    return time;
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
      }
    }
    return tableWidth;
  }
  static transformArrayData(data, needColNum, needKey, currentPage, pageSize) {
    // 需要添加table序号
    if (needColNum) {
      for (let i = 0; i < data.length; i++) {
        // 有分页
        if (currentPage && pageSize) {
          data[i]["num"] = pageSize * (currentPage - 1) + i + 1;
          // 无分页
        } else {
          data[i]["num"] = i + 1;
        }
      }
      // 需要添加唯一标识key
    }
    // 添加Key
    if (needKey) {
      for (let i = 0; i < data.length; i++) {
        // 若数据不存在key字段,则增加唯一标识key
        if (!data[i]["key"]) data[i]["key"] = i;
      }
    }
    if (!needColNum && !needColNum) {
      console.info(
        "检查transformArrayData方法参数(needColNum,needKey),返回数据结构未改变"
      );
    }
    return data;
  }

  /**
   * 金额由分转为元时保留两位小数
   * @param {*} number
   */
  static toFixed2 (number) {
    return number.toFixed(2) * 1;
  }

  /**
   * 金额由元转为分时取整
   * @param {*} number
   */
  static toFixed0 (number) {
    return number.toFixed(0) * 1;
  }
}
