/**
 * 应收账款明细表
 * 
 * 超管、财务管理、销售主管、销售可查看
 * 销售只能查看自己的数据，后端已做处理
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';

let f1;
const AccountsReceivable = (props) => {
  let { location } = props;

  let userType = localStorage.getItem('userType');

  let [memberList, setMemberList] = useState([]);
  let [salesList, setSalesList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
    memberId: location.query.memberId, // 应收/付账款汇总表跳转默认参数
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    // 会员
    request({ url: '/api/user/getMembers/', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
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

    // 销售
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: 5 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setSalesList(list);
        }
      })
    f1 && f1.props.form.setFieldsValue({
      memberId: location.query.memberId * 1 || undefined,
    })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listGetDetail', method: 'GET', params: { ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            organ_name: '合计：',
            to_get: res.summary.totalToGet,
            pre_get: res.summary.totalPreGet,
          };
          res.data.push(total);

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

  const onExport = () => {
    Download('/api/accountF/exportGetDetail', {
      ...searchParams,
    });
  }

  let searchItems = [
    {
      type: 'select',
      label: '客户',
      paramName: 'memberId',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true)
      },
    }, 
    ...(
      userType !== 'xiaoshou' &&
      [{
        type: 'select',
        label: '销售人员',
        paramName: 'salesId',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
        },
      }] || []
    ), 
    {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    },
  ];

  let columns = [
    { title: '客户', dataIndex: 'organ_name', align: 'center', width: 120 },
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 140 },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 160 },
    { title: '业务类型', dataIndex: 's_name', align: 'center', width: 100 },
    {
      title: '增加应收款',
      dataIndex: 'to_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '增加预收款',
      dataIndex: 'pre_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '应收款余额',
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    ...(
      userType != 'xiaoshou' &&
      [{ title: '销售人员', dataIndex: 'sales_name', align: 'center', width: 100 }] ||
      []
    ),
    { title: '备注', dataIndex: 'comment', align: 'center', width: 220 },
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} wrappedComponentRef={ref => f1 = ref} />
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
        />
      </Container>
    </div>
  );
}

export default AccountsReceivable;