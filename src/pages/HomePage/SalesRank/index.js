/**
 * 销售排名
 */
import React, { useEffect, useState } from 'react';
import { Card, Empty, Select, DatePicker } from 'antd';
import request from '../../../utils/request';
import moment from 'moment';
import PieChart from './PieChart';
import LineChart from './LineChart';

const { Option } = Select;
const { RangePicker } = DatePicker;

const SalesRank = () => {
  let [keyParams, setKeyParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
    type: '1',
  });
  let [saleRankingData, setSaleRankingData] = useState([]);

  let [xAxisData, setXAxisData] = useState([]);

  useEffect(() => {
    getSaleRankingData();
  }, [keyParams])

  // 销售排名
  const getSaleRankingData = () => {
    request({url: '/api/stats/saleOrder', method: 'GET', params: {...keyParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          setSaleRankingData(res.data);
        }
      })
  }

  useEffect(() => {
    if(keyParams.type != 1) {
      let xAxisData = [];
      if(keyParams.type == 2) {
        saleRankingData.map(item => {
          xAxisData.push(item.member_name);
        })
      }
      if(keyParams.type == 3) {
        saleRankingData.map(item => {
          xAxisData.push(item.sales_name);
        })
      }
      if(keyParams.type == 4) {
        saleRankingData.map(item => {
          xAxisData.push(item.category_name);
        })
      }
      setXAxisData(xAxisData);
    }
  }, [saleRankingData])
  return (
    <div>
      <Card title={'销售排名'}
        extra={
          <>
            <RangePicker onChange={(val) => {
              let obj = {...keyParams};
              obj.startTime = moment(val[0]).format('YYYY-MM-DD');
              obj.endTime = moment(val[1]).format('YYYY-MM-DD');

              setKeyParams(obj);
            }}
              value={[moment(keyParams.startTime), moment(keyParams.endTime)]}
              size='small'
              style={{ marginRight: '10px' }}
            />
            <Select onChange={(val) => {
              let obj = {...keyParams};
              obj.type = val;
              setKeyParams(obj);
            }}
              value={keyParams.type}
              size='small'
              style={{ minWidth: '100px' }}
            >
              <Option value="1">按商品汇总</Option>
              <Option value="2">按会员汇总</Option>
              <Option value="3">按销售汇总</Option>
              <Option value="4">按商品分类汇总</Option>
            </Select>
          </>
        }
      >
        {
          saleRankingData.length > 0 &&
          <div>
            {
              keyParams.type == 1 &&
              <PieChart data={saleRankingData} /> ||
              <LineChart xAxisData={xAxisData} data={saleRankingData} />
            }
          </div>
          ||
          <Empty />
        }
      </Card>
    </div>
  );
}

export default SalesRank;