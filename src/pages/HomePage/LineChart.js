import Chart from 'echarts-for-react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/legend';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';


const lineChart = ({xAxisData = [], data, height = 260}) => {
  const option = {
    backgroundColor: '#fff',
    color: ['#73A0FA', '#73DEB3', '#FFB761'],
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '25',
      right: '25',
      bottom: '24',
      top: '75',
      containLabel: true
    },
    legend: {
      orient: 'horizontal',
      // icon: "rect",
      show: true,
      left: 'center',
      top: 20,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
    },
    yAxis: [{
      type: 'value',
      name: '销售笔数',
      axisLabel: {
        color: '#999',
        textStyle: {
          fontSize: 12
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F3F4F4'
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
    }, {
      type: 'value',
      position: 'right',
      name: '总额',
      axisLabel: {
        color: '#999',
        textStyle: {
          fontSize: 12
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#F3F4F4'
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      },
    }],
    series: [{
        name: '销售笔数',
        type: 'line',
        smooth: true,
        data: data.seriesData
      },
      {
        name: '销售总额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: data.seriesData1
      },
    ]
  }
  return ( 
    <div style={{height: height}}>
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

export default lineChart;
