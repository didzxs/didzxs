import React, { useEffect, useState } from 'react';
import { router } from 'umi';
import { Button, Form, Input, message } from 'antd';
import styles from './Search.less';

const Search = (props) => {
  let [searchVal, setSearchVal] = useState(props.value);
  const [options, setOptions] = useState([]);
  let [history, setHistory] = useState([]);
  let [searchList, setSearchList] = useState([]);
  let [historyShow, setHistoryShow] = useState(false);

  const onInputChange = (e) => {
    function checkAdult (x) {
      return x.includes(e.target.value);
    }

    let list = history.filter(checkAdult);
    setSearchList(list);
    console.log('list', list);
    setSearchVal(e.target.value);
  };

  const onJump = (type, params = {}) => {
    if (type == 'SearchProduct-keyword' && !params.keyword) {
      message.warning('请输入关键字！');
    }

    if (params.hasOwnProperty('keyword')) {
      setKeywordHistory(params.keyword);
    }

    if (props.location && props.location.pathname.indexOf('keyword') > -1 && type == 'SearchProduct-keyword') {
      props.onSearch(params.keyword);
      return;
    }
    // 意向订单创建材料订单
    if (props.location && props.location.query.orderId) {
      params.orderId = props.location.query.orderId;
    }
    router.push({
      pathname: type,
      query: {
        ...params
      }
    });
  };

  const onKeyDown = (e) => {
    if (e.keyCode == 13) {
      onJump('SearchProduct-keyword', { keyword: searchVal, type: 'keywordSearch' });
    }
  };

  // 获取历史记录
  useEffect(() => {
    if (localStorage.getItem('searchHistory')) {
      let search_arr = localStorage.getItem('searchHistory');
      let history_arr = [];
      try {
        history_arr = JSON.parse(search_arr);
      } catch (err) {
        history_arr = search_arr.split(',') || [];
      }
      setSearchList([...history_arr]);
      setHistory(history_arr);
    }
    // 点击详情页，返回搜索列表页时，会携带参数 keyword
    if (props.keyword) {
      setSearchVal(props.keyword);
    }
  }, []);

  // 存储历史记录
  const setKeywordHistory = (search_value) => {
    let list = [...history];
    /* 如果搜索结果与本地存储相同，则不需要存储 */
    if (search_value != '' && !list.includes(search_value)) {
      /* 将搜索结果插入到历史记录中 */
      list.push(search_value);
      setHistory(list);
      localStorage.setItem('searchHistory', list);
    }
  };

  // 获取焦点
  const onInputFocus = () => {
    setHistoryShow(true);
  };

  // 取消焦点
  const onInputBlur = () => {
    setTimeout(() => {
      setHistoryShow(false);
    }, 300);
  };

  // 点击搜索历史时
  const onCheckSearch = (val) => {
    console.log('onCheckSearch', val);
    setSearchVal(val);
    setHistoryShow(false);

    onJump('SearchProduct-keyword', {
      keyword: val,
      type: 'keywordSearch'
    })
  };

  // 清除搜索记录
  const onClearHistory = () => {
    localStorage.removeItem('searchHistory');
    setHistory([]);
    setSearchList([]);
    setHistoryShow(false);
  };

  return (
    <div className={styles['header-box']}>
      <div className={styles['header']}>
        <div className={styles['left']} onClick={onJump.bind(this, 'ShoppingMall', {})}>
          <img src={require('../../assets/logo3.png')}/>
        </div>
        <Form layout="inline" className={styles['right']}>
          <Form.Item className={styles['search-box']}>
            <Form.Item name="field" style={{ 'margin': '0px' }}>
              <Input
                name="field"
                autoComplete="off"
                className={styles['search-input']}
                placeholder="请输入你想搜索的商品"
                value={searchVal}
                onChange={onInputChange}
                onKeyDown={onKeyDown}
                onFocus={onInputFocus}
                onBlur={onInputBlur}
              />
            </Form.Item>
            <Button className={styles['search-btn']} onClick={onJump.bind(this, 'SearchProduct-keyword', {
              keyword: searchVal,
              type: 'keywordSearch'
            })}>搜索</Button>
          </Form.Item>
          <Button className={styles['shopping-cart-btn']} onClick={onJump.bind(this, 'MyShoppingCart', {})}>
            <i className="iconfont icon-weibiaoti--"></i>我的购物车
          </Button>
        </Form>
      </div>

      { // 搜索历史记录
        historyShow && searchList && searchList.length != 0 && <div className={styles['history_wrap']}>
          <div className={styles['history']}>
            <div className={styles['history_header']}>
              <div className={styles['history_box']}>
                <p>搜索历史</p>
                <p className={styles['clear-history']} onClick={onClearHistory}>清空</p>
              </div>
            </div>
            <ul className={styles['search-history-list']}>
              {searchList.map(item => (<li onClick={onCheckSearch.bind(this, item)}>{item}</li>))}
            </ul>
          </div>
        </div>
      }
    </div>
  );
};

export default Search;
