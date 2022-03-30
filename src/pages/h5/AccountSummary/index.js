/**
 * 应收/付账款汇总表
 * 
 * 菜单权限：超管、财务、销售(应收)、采购(应付)
 * 销售只能查看自己的数据，根据userId过滤
 */

import React, { useEffect, useState } from 'react';
import router from 'umi/router';
import request from '../../../utils/request';
import Filtrate from '../../../components/common/Filtrate';
import Container from '../../../components/common/Container';
import MyTable from '../../../components/common/MyTable';
import PublicService from '../../../services/PublicService';
import Download from '../../../utils/Download';
import MobileHeader from '../components/MobileHeader';

const AccountSummary = (props) => {
  let { location } = props;

  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let basicParams = {};
  if(userType == 'xiaoshou') {
    basicParams.salesId = userId;
  }

  let [searchParams, setSearchParams] = useState({
    type: location.query.type || -1, // 1: 应付(供应商) 2: 应收(会员) 3：按销售汇总应收
    salesId: location.query.salesId || undefined,
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  let [searchType, setSearchType] = useState(location.query.type);

  let [roleList, setRoleList] = useState([]);
  let [salesList, setSalesList] = useState([]);

  useEffect(() => {
    request({url: '/api/role/list/', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setRoleList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        if(item.name == 'xiaoshou') {
          getUserList(item.id, setSalesList);
        }
      })
    }
  }, [roleList])

  const getUserList = (id, setType) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {page: 1, pageSize: 100000, roleId: id}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name,
            })
          })
          setType(list);
        }
      })
  }

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listPayGetSummary', method: 'GET', params: { ...basicParams, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            name: '合计：',
            all_need_get: res.totalGet,
            all_need_pay: res.totalPay,
          };
          res.data.push(total);

          setTableData(res.data);
        }
        setTableLoading(false);
      })
  }

  const onSearchClick = (val) => {
    if(val.type && val.type.length == 1) {
      val.type = val.type[0];
    } else {
      val.type = -1;
    }
    if(location.query.type) {
      val.type = location.query.type;
    }
    setSearchParams(val);
  }

  const onExport = () => {
    Download('/api/accountF/exportPayGetSummary', {
      ...basicParams,
      ...searchParams,
    });
  }

  const onRowDoubleClick = (record, event) => {
    event.stopPropagation();
    if(location.pathname.indexOf('XS') > -1) {
      router.push({
        pathname: 'AccountSummary',
        query: {
          type: 2,
          salesId: record.id,
        }
      })
    } else {
      if(record.organ_type == 1) {
        router.push({
          pathname: 'AccountsPayable',
          query: {
            supplierId: record.id
          }
        })
      } else {
        router.push({
          pathname: 'AccountsReceivable',
          query: {
            memberId: record.id
          }
        })
      }
    }
  }

  const onTypeChange = (val) => {
    setSearchType(val);
  }

  let searchItems = [
    {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '请输入供应商名称或会员',
      span: 12
    }, 
    ...(
      (userType == 'admin' || userType == 'caiwu') && location.pathname.indexOf('XS') < 0 && !location.query.type &&
      [{
        type: 'checkbox',
        label: '',
        paramName: 'type',
        itemProps: {
          options: [
            { value: 1, label: '供应商' },
            { value: 2, label: '会员' },
          ],
          onChange: onTypeChange,
        },
      }] || []
    ),
    ...(
      (userType == 'admin' || userType == 'caiwu' || userType == 'xiaoshou_mgr') && searchType == 2 && !location.query.salesId &&
      [{
        type: 'select',
        label: '销售',
        paramName: 'salesId',
        itemProps: {
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true),
        },
        span: 12
      }] || []
    )
  ];

  let columns = [
    { title: '名称', dataIndex: 'name', align: 'center', width: 120 },
    {
      title: '往来单位性质',
      dataIndex: 'organ_type',
      align: 'center',
      width: 120,
      render: (text) => (
        {1: '供应商', 2: '会员', 3: '销售'}[text]
      )
    },
    {
      title: '应收款余额',
      dataIndex: 'all_need_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '应付款余额',
      dataIndex: 'all_need_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '待开发票金额',
      dataIndex: 'all_need_receipt',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    ...(
      (searchParams.type == 1 || searchParams.type == -1) &&
      [{
        title: '期初应付',
        dataIndex: 'begin_need_pay',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }] || []
    ),
    ...(
      (searchParams.type == 2 || searchParams.type == 3 || searchParams.type == -1) &&
      [{
        title: '期初应收',
        dataIndex: 'begin_need_get',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }] || []
    ),
  ];

  return (
    <div>
      <MobileHeader />
      <Filtrate items={searchItems} onSearch={onSearchClick} btnStyle={{marginTop: '15px'}} />
      <Container
        headerShow={false}
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
            }
          }}
        />
      </Container>
    </div>
  );
}

export default AccountSummary;