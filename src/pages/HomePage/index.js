/**
 * 首页
 */

import React, { Component } from 'react';
import { Card, Tabs, Select, DatePicker } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import request from '../../utils/request';
import LineChart from './LineChart';
import SupplierArrears from './SupplierArrears';
import SalesRank from './salesRank/index';
import styles from './index.less';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

let userType = localStorage.getItem('userType');
let userId = localStorage.getItem('userId');

class HomePage extends Component {
  state = {
    summaryData: {},
    tabsKey: '1',
    saleData: [],
    caigouData: [],
    keySummaryData: {},
    keyParams1: {
      startTime: moment().format('YYYY-MM-01'),
      endTime: moment().format('YYYY-MM-DD'),
      type: '1',
    },
    keyParams2: {
      startTime: moment().format('YYYY-MM-01'),
      endTime: moment().format('YYYY-MM-DD'),
      type: '1',
    },
    keyParams3: {},
  }

  componentDidMount() {
    this.getSummaryData();
    this.getSaleData();
    this.getCaigouData();
    this.getKeyDataStatistics();
  }

  // 汇总数据
  getSummaryData = () => {
    request({url: '/api/stats/homeSummary', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          this.setState({
            summaryData: res.data,
          })
        }
      })
  }

  // 销货数据
  getSaleData = () => {
    let { keyParams1 } = this.state;
    let basicParams = {};
    if(userType == 'huiyuan') {
      basicParams.huiyuan_id = userId;
    }
    if(userType == 'xiaoshou') {
      basicParams.saleId = userId;
    }
    request({url: '/api/stats/homeSale', method: 'GET', params: {...basicParams, ...keyParams1}})
      .then(res => {
        if(res && res.retcode == 0) {
          this.setState({
            saleData: res.data,
          })
        }
      })
  }

  // 采购数据
  getCaigouData = () => {
    let { keyParams2 } = this.state;
    request({url: '/api/caigou/listSort', method: 'GET', params: { ...keyParams2 }})
      .then(res => {
        if(res && res.retcode == 0) {
          this.setState({
            caigouData: res.data,
          })
        }
      })
  }

  // 关键数据统计
  getKeyDataStatistics = () => {
    request({url: '/api/stats/keySummary', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          this.setState({
            keySummaryData: res.data,
          })
        }
      })
  }

  onTabsChange = (key) => {
    this.setState({
      tabsKey: key
    })
  }

  renderExtra = () => {
    let { tabsKey, keyParams1, keyParams2, keyParams3 } = this.state;
    if(tabsKey == 1) {
      return <>
        <RangePicker onChange={(val) => {
            keyParams1.startTime = moment(val[0]).format('YYYY-MM-DD');
            keyParams1.endTime = moment(val[1]).format('YYYY-MM-DD');
            this.setState({
              keyParams1,
            }, () => {
              this.getSaleData();
            })
          }}
          value={[moment(keyParams1.startTime), moment(keyParams1.endTime)]}
          size='small'
          style={{marginRight: '10px'}}
        />
        <Select onChange={(val) => {
            keyParams1.type = val;
            this.setState({
              keyParams1
            }, () => {
              this.getSaleData();
            })
          }}
          value={keyParams1.type}
          size='small'
          style={{minWidth: '100px'}}
        >
          <Option value="1">按天</Option>
          <Option value="2">按周</Option>
          <Option value="3">按月</Option>
          <Option value="4">按季度</Option>
          <Option value="5">按年</Option>
        </Select>
      </>
    } else if(tabsKey == 2) {
      return <>
        <Select onChange={(val) => {
            keyParams2.type = val;
            this.setState({
              keyParams2
            }, () => {
              this.getCaigouData();
            })
          }}
          value={keyParams2.type}
          size='small'
          style={{minWidth: '100px', marginRight: '10px'}}
        >
          <Option value="1">按商品</Option>
          <Option value="3">按供应商</Option>
        </Select>
        <RangePicker onChange={(val) => {
            keyParams2.startTime = moment(val[0]).format('YYYY-MM-DD');
            keyParams2.endTime = moment(val[1]).format('YYYY-MM-DD');
            this.setState({
              keyParams2,
            }, () => {
              this.getCaigouData();
            })
          }}
          value={[moment(keyParams2.startTime), moment(keyParams2.endTime)]}
          size='small'
        />
      </>
    } else {
      return
    }
  }

  onJump = (type) => {
    router.push({
      pathname: type,
    })
  }

  render() {
    let t = this;
    const { summaryData, tabsKey, saleData, caigouData, keySummaryData, keyParams2 } = t.state;

    let list = [
      {label: '未审核采购单', dataParams: 'unCheckCaigou', style: {background: 'rgb(252, 133, 86)'}, pathname: 'OrderForm'},
      {label: '未审核其他出入库单', dataParams: 'unCheckInOut', style: {background: 'rgb(71, 192, 86)'}, pathname: 'OtherStockOut'},
      {label: '滞销', dataParams: 'unSaleable', style: {background: 'rgb(91, 143, 212)'}, pathname: 'UnsoldGoodsWarning'},
      {label: '待发货订单', dataParams: 'needSendOrder', style: {background: 'rgb(252, 133, 86)'}, pathname: 'OrderList-cangku'},
      {label: '未核销收付款单', dataParams: 'unVerify', style: {background: 'rgb(71, 192, 86)'}, pathname: 'VerificationSheet'},
      {label: '库存预警', dataParams: 'storeWarning', style: {background: 'rgb(91, 143, 212)'}, pathname: 'InventoryWarning'},
    ];

    let list1 = [
      {label: '库存成本', data: keySummaryData.store_cost / 100 || 0},
      {label: '客户欠款', data: keySummaryData.all_need_get / 100 || 0},
      {label: '销售收入(本月)', data: keySummaryData.sale_earn / 100 || 0},
      {label: '库存总量', data: keySummaryData.stores || 0},
      {label: '采购金额(本月)', data: keySummaryData.gouhuo_fee / 100 || 0},
      {label: '销售成本', data: keySummaryData.sale_cost / 100 || 0},
      {label: '供应商欠款', data: keySummaryData.all_need_pay / 100 || 0},
      {label: '销售毛利(本月)', data: keySummaryData.sale_cross / 100 || 0},
    ]

    let xAxisData = [], seriesData = [], seriesData1 = [];
    saleData.map(item => {
      xAxisData.push(item.startTime);

      seriesData.push(item.number);
      seriesData1.push(item.total);
    })

    return (
      <div className={styles['container']}>
        <div className={`${styles['card-container']} ${styles['card-container1']}`}>
          <Card
          >
            <div className={styles['content']}>
              {
                list.map((item, index) => {
                  return <div className={styles['summary-item']} key={index} style={item.style} onClick={this.onJump.bind(this, item.pathname)}>
                    <span className={styles['label']}>{item.label}</span>
                    <span className={styles['data']}>{summaryData[item.dataParams]}</span>
                  </div>
                })
              }
            </div>
          </Card>
        </div>

        <div className={`${styles['card-container']} ${styles['card-container3']}`}>
          <Card
            title='关键数据统计'
          >
            <div className={styles['content']}>
              {
                list1.map((item, index) => {
                  return <div className={styles['summary-item']} key={index} style={item.style}>
                    <span className={styles['label']}>{item.label}：</span>
                    <span className={styles['data']}>{item.data}</span>
                  </div>
                })
              }
            </div>
          </Card>
        </div>

        {
          // 供应商欠款报表
          (userType == 'admin' || userType == 'caiwu') &&
          <SupplierArrears />
        }

        <div className={`${styles['card-container']} ${styles['card-container2']}`}>
          <Card title={
            <div className={styles['card-title']}>
              <Tabs activeKey={tabsKey} onChange={t.onTabsChange}>
                <TabPane tab="销货" key="1"></TabPane>
                <TabPane tab="购货" key="2"></TabPane>
                {/* <TabPane tab="仓库" key="3"></TabPane> */}
              </Tabs>
            </div>}
            extra={t.renderExtra()}
          >
            {
              tabsKey == 1 &&
              <LineChart
                height={350}
                xAxisData={xAxisData}
                data={{seriesData, seriesData1}}
              />
            }
            {
              tabsKey == 2 &&
              <div className={styles['caigou-data-box']}>
                {
                  caigouData.map((item, index) => (
                    <div className={styles['caigou-data-item']} key={index}>
                      <div className={styles['num']}>{index + 1}</div>
                      <div className={styles['data']}>
                        {
                          keyParams2.type == 1 &&
                          <div className={styles['left']}>
                            <span>{item.prod_name}</span>
                            <span>{item.sku_name}</span>
                          </div>
                        }
                        {
                          keyParams2.type == 3 &&
                          <div className={styles['left']}>
                            <span>{item.supplier_name}</span>
                          </div>
                        }
                        <div className={styles['right']}>
                          ￥{item.gouhuo_fee}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            }
          </Card>
        </div>

        {/* 销售排名 */}
        <SalesRank />
      </div>
    );
  }
}

export default HomePage;
