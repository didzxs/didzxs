import React, { useEffect, useState } from 'react';
import Chart from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import request from '../../utils/request';
import moment from 'moment';
import Filtrate from '../../components/common/Filtrate';
import PublicService from '../../services/PublicService';

const EngineeringStatistic = () => {
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01 00:00:00'),
    endTime: moment().format('YYYY-MM-DD 23:59:59'),
  });
  let [data, setData] = useState([{}]);

  let [kefuList, setKefuList] = useState([]);
  let [saleList, setSaleList] = useState([]);
  let [memberList, setMemberList] = useState([]);

  useEffect(() => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {page: 1, pageSize: 100000, roleId: 4}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setKefuList(list);
        }
      })
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {page: 1, pageSize: 100000, roleId: 5}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setSaleList(list);
        }
      })
    request({url: '/api/user/getMembers/', method: 'GET', params: {page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setMemberList(list);
        }
      })
  }, [])

  useEffect(() => {
    request({url: '/api/stats/projectSummary', method: 'GET', params: {...searchParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          let type = {1: '维保', 2: '维修', 3: '检测评估', 4: '智慧消防', 5: '工程项目托管', 6: '维保勘查', 7: '工程勘察', 8: '排查', 9: '图纸设计', 10: '图审', 11: '报建', 12: '验收', 13: '标书', 14: '预结算流程'};
          let list = [];
          res.data.map(item => {
            for(let key in item) {
              list.push({
                value: item[key] / 100 || 0,
                name: type[key],
              })
            }
          })
          
          setData(list);
        }
      })
  }, [searchParams]);

  const onSearchClick = (val) => {
    if(val.time.length == 2) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD 00:00:00');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD 23:59:59');
    }
    delete val.time;
    setSearchParams(val);
  }

  let scale = 1;
  let echartData = data;
  var rich = {
    yellow: {
      color: "#ffc72b",
      fontSize: 30 * scale,
      padding: [5, 4],
      align: 'center'
    },
    total: {
      color: "#ffc72b",
      fontSize: 40 * scale,
      align: 'center'
    },
    label: {
      padding: 20,
      color: "#fff",
      fontSize: 30 * scale,
      align: 'center'
    },
    white: {
      color: "#fff",
      align: 'center',
      fontSize: 14 * scale,
      padding: [21, 0]
    },
    blue: {
      color: '#49dff0',
      fontSize: 16 * scale,
      align: 'center'
    },
    hr: {
      borderColor: '#0b5263',
      width: '100%',
      borderWidth: 1,
      height: 0,
    }
  }
  let option = {
    backgroundColor: '#031f2d',
    title: {
      text: '工程订单收益分类占比统计',
      left: 'center',
      top: '10%',
      padding: [24, 0],
      textStyle: {
        color: '#fff',
        fontSize: 18 * scale,
        align: 'center'
      }
    },
    legend: {
      selectedMode: false,
      formatter: function (name) {
        var total = 0; //各科正确率总和
        var averagePercent; //综合正确率
        echartData.forEach(function (value, index, array) {
          total += value.value;
        });
        return '{label|总金额}\n{total|' + total + '}';
      },
      data: [echartData[0] && echartData[0].name],
      // itemGap: 50,
      left: 'center',
      top: 'center',
      icon: 'none',
      align: 'center',
      textStyle: {
        color: "#fff",
        fontSize: 16 * scale,
        rich: rich
      },
    },
    series: [{
      name: '',
      type: 'pie',
      radius: ['42%', '50%'],
      hoverAnimation: false,
      color: ['#c487ee', '#deb140', '#49dff0', '#034079', '#6f81da', '#00ffb4'],
      label: {
        normal: {
          formatter: function (params, ticket, callback) {
            var total = 0; //考生总数量
            var percent = 0; //考生占比
            echartData.forEach(function (value, index, array) {
              total += value.value;
            });
            percent = ((params.value / total) * 100).toFixed(1);
            return '{white|' + params.name + '}\n{hr|}\n{yellow|' + params.value + '}\n{blue|' + percent + '%}';
          },
          rich: rich
        },
      },
      labelLine: {
        normal: {
          length: 55 * scale,
          length2: 0,
          lineStyle: {
            color: '#0b5263'
          }
        }
      },
      data: echartData
    }]
  };

  let searchItems = [
    {
      type: 'rangePicker',
      label: '时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01 00:00:00')), moment(moment().format('YYYY-MM-DD 23:59:59'))]
    },
    {
      type: 'select',
      label: '客服',
      paramName: 'kefuId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(kefuList, 'value', 'label', true, true)
      },
    },
    {
      type: 'select',
      label: '销售',
      paramName: 'salesId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(saleList, 'value', 'label', true, true)
      },
    },
    {
      type: 'select',
      label: '会员',
      paramName: 'memberId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true),
        showSearch: true,
      },
    },
  ];
  return (
    <div style={{height: 'calc(100% - 90px)'}}>
      <Filtrate items={searchItems} onSearch={onSearchClick} />
      <Chart 
        echarts={echarts}
        option={option}
        notMerge={true}
        lazyUpdate={true}
        style={{height: '100%'}}
      /> 
    </div>
  );
}

export default EngineeringStatistic;