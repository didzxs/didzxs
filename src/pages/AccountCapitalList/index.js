/**
 * 账户资金列表
 */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';

let f1;
const AccountCapitalList = (props) => {
  let { location } = props;

  let [accountList, setAccountList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
    accountId: location.query.accountId,
  });
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
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

    f1 && f1.props.form.setFieldsValue({
      accountId: location.query.accountId * 1 || undefined,
    })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams, pageIndex])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listCapitalDetail', method: 'GET', params: { page: pageIndex, pageSize, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          setTableData(res.page.list);
        }
        setTableLoading(false);
        setPageTotal(res.page.totalCount);
      })
  }

  const onSearchClick = (val) => {
    setPageIndex(1);
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;

    setSearchParams(val);
  }

  const onPageChange = (page) => {
    setPageIndex(page);
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
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '日期', dataIndex: 'operated_at', align: 'center', width: 100 },
    { title: '账户名称', dataIndex: 'account_name', align: 'center', width: 100 },
    { title: '供应商', dataIndex: 'organ_name', align: 'center', width: 100 },
    {
      title: '支出',
      dataIndex: 'out_amount',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '收入',
      dataIndex: 'in_amount',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '余额',
      dataIndex: 'balance',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '类别',
      dataIndex: 'relate_type',
      align: 'center',
      width: 120,
      render: (text) => (
        {1: '收款', 2: '付款', 3: '资金转账', 4: '订单现金支付'}[text]
      )
    },
    { title: '简介', dataIndex: 'short_desc', align: 'center', width: 200 },
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} wrappedComponentRef={ref => f1 = ref} />
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
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </Container>
    </div>
  );
}

export default AccountCapitalList;