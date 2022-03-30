/**
 * 应收/付账款汇总表
 *
 * 菜单权限：超管、财务、销售(应收)、采购(应付)
 * 销售只能查看自己的数据，根据userId过滤
 */

import React, { useEffect, useState } from 'react';
import router from 'umi/router';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';
import moment from 'moment';

const ForSupplier = (props) => {
  let { location } = props;

  let [searchParams, setSearchParams] = useState({
    // type: 1, // location.query.type || -1, // 1: 应付(供应商) 2: 应收(会员) 3：按销售汇总应收
    salesId: location.query.salesId || undefined
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    onSearch();
  }, [searchParams]);

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listPaySummary', method: 'GET', params: { ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            name: '合计：',
            t_begin_need_pay: res.total_t_begin_need_pay,
            t_prepay: res.total_t_prepay,
            t_last_need_pay: res.total_t_last_need_pay,
            t_need_pay: res.total_t_need_pay
          };
          res.data.push(total);

          setTableData(res.data);
        }
        setTableLoading(false);
      });
  };

  const onSearchClick = (val) => {
    if (typeof val.time === 'object' && Array.isArray(val.time)) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    console.log('val', val);
    setSearchParams(val);
  };

  const onExport = () => {
    console.log('searchParams', searchParams);
    let val = searchParams;
    if (typeof val.time === 'object' && Array.isArray(val.time)) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
      delete val.time;
    }

    Download('/api/accountF/exportPaySummary', {
      ...val
    });
  };

  const onRowDoubleClick = (record, event) => {
    event.stopPropagation();
    router.push({
      pathname: 'AccountsPayable',
      query: {
        supplierId: record.id
      }
    });
  };

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time'
    }, {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '请输入供应商名称或会员'
    }
  ];

  let columns = [
    { title: '名称', dataIndex: 'name', align: 'center', width: 140 },
    {
      title: '往来单位性质',
      dataIndex: 'organ_type',
      align: 'center',
      width: 140,
      render: (text) => (
        { 1: '供应商', 2: '会员', 3: '销售' }[text]
      )
    },
    {
      title: '期初余额',
      dataIndex: 't_begin_need_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '本期应付',
      dataIndex: 't_need_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '本期付款',
      dataIndex: 't_prepay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '期末余额',
      dataIndex: 't_last_need_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    }
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick}/>
      <Container
        heightAuto={true}
        exportBtn={onExport}
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content' }}
          onRow={(record) => {
            return {
              onDoubleClick: onRowDoubleClick.bind(this, record)
            };
          }}
        />
      </Container>
    </div>
  );
};

export default ForSupplier;
