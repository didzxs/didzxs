/**
 * 供应商欠款报表
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Card, Select, DatePicker } from 'antd';
import request from '../../utils/request';
import styles from './SupplierArrears.less';
import router from 'umi/router';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SupplierArrears = () => {
  let [supplierList, setSupplierList] = useState([]);

  let [keyParams, setKeyParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [supplierSummaryData, setSupplierSummaryData] = useState({});

  useEffect(() => {
    request({url: '/api/supplier/list', method: 'GET', params: {page: 1, pageSize: 100000, status: 1}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              label: item.name,
              value: item.id,
            })
          })
          setSupplierList(list);
        }
      })
  }, [])

  useEffect(() => {
    if(supplierList.length) {
      let data = {...keyParams};
      data.supplierId = supplierList[0].value ;
      setKeyParams(data);
    }
  }, [supplierList])

  useEffect(() => {
    if(keyParams.supplierId) {
      getSupplierSummary();
    }
  }, [keyParams])

  // 关键数据统计
  const getSupplierSummary = () => {
    request({url: '/api/stats/supplierSummary', method: 'GET', params: {...keyParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          setSupplierSummaryData(res.data);
        }
      })
  }

  const onJump = (pathname) => {
    router.push({
      pathname,
    })
  }

  const renderExtra = () => {
    return <>
      <Select onChange={(val) => {
          let data = {...keyParams};
          data.supplierId = val;
          setKeyParams(data);
        }}
        value={keyParams.supplierId}
        size='small'
        style={{minWidth: '100px', marginRight: '10px'}}
      >
        {
          supplierList.map((item, index) => (
            <Option value={item.value} key={index}>{item.label}</Option>
          ))
        }
      </Select>
      <RangePicker onChange={(val) => {
          let data = {...keyParams};
          data.startTime = moment(val[0]).format('YYYY-MM-DD');
          data.endTime = moment(val[1]).format('YYYY-MM-DD');
          setKeyParams(data);
        }}
        value={[moment(keyParams.startTime), moment(keyParams.endTime)]}
        size='small'
      />
    </>
  }

  let list = [
    {label: '累计欠款', data: supplierSummaryData.totalUnpayed / 100 || 0, pathname: 'AccountSummary'},
    {label: '累计开票', data: supplierSummaryData.totalReceipted / 100 || 0, pathname: 'MarketReceipt'},
    {label: '累计采购额', data: supplierSummaryData.gouhuoFeeTotal / 100 || 0, pathname: 'OrderForm'},
    {label: '累计付款', data: supplierSummaryData.totalPayed / 100 || 0, pathname: 'AccountSummary'},
    {label: '累计欠票', data: supplierSummaryData.totalUnReceipted / 100 || 0, pathname: 'MarketReceipt'},
    {label: '目前欠款', data: supplierSummaryData.allNeedPay / 100 || 0, pathname: 'AccountSummary'},
  ]

  return (
    <div className={styles['card-container']}>
      <Card
        title='供应商欠款报表'
        extra={renderExtra()}
      >
        <div className={styles['content']}>
          {
            list.map((item, index) => {
              return <div className={styles['summary-item']} key={index} style={item.style} onClick={onJump.bind(this, item.pathname)}>
                <span className={styles['label']}>{item.label}：</span>
                <span className={styles['data']}>{item.data}</span>
              </div>
            })
          }
        </div>
      </Card>
    </div>
  );
}

export default SupplierArrears;