/**
 * 账户资金汇总
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import router from 'umi/router';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';

const AccountCapitalCollect = () => {

  let [accountList, setAccountList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    request({url: '/api/account/list', method: 'GET', params: {page: 1, pageSize: 10000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              label: item.name,
              value: item.id,
            })
          })
          setAccountList(list);
        }
      })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/summaryCapitalDetail', method: 'GET', params: { ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          setTableData(res.data);
        }
        setTableLoading(false);
      })
  }

  const onSearchClick = (val) => {
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;

    setSearchParams(val);
  }

  const onRowDoubleClick = (record, event) => {
    event.stopPropagation();
    router.push({
      pathname: 'AccountCapitalList',
      query: {
        accountId: record.account_id
      }
    })
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '账户',
      paramName: 'accountId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(accountList, 'value', 'label', true, true)
      }
    },
  ];

  let columns = [
    { title: '账户名称', dataIndex: 'name', align: 'center', width: 140 },
    {
      title: '总支出',
      dataIndex: 'totalOutAmount',
      align: 'center',
      width: 140,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '总收入',
      dataIndex: 'totalInAmount',
      align: 'center',
      width: 140,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} />
      <Container
        heightAuto={true}
        headerShow={false}
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
            }
          }}
        />
      </Container>
    </div>
  );
}

export default AccountCapitalCollect;