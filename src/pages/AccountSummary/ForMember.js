/**
 * 应收账款汇总表
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
// import MyPagination from '../../components/common/MyPagination';

const ForMember = (props) => {
  let { location } = props;
  let basicParams = {};
  let [searchParams, setSearchParams] = useState({
    // type: 2, // 1: 应付(供应商) 2: 应收(会员) 3：按销售汇总应收
    salesId: location.query.salesId || undefined
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  let [roleList, setRoleList] = useState([]);
  let [salesList, setSalesList] = useState([]);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setRoleList(res.data);
        }
      });
  }, []);

  useEffect(() => {
    if (roleList.length) {
      roleList.map(item => {
        if (item.name == 'xiaoshou') {
          getUserList(item.id, setSalesList);
        }
      });
    }
  }, [roleList]);

  const getUserList = (id, setType) => {
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: id } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name
            });
          });
          setType(list);
        }
      });
  };

  useEffect(() => {
    onSearch();
  }, [searchParams]);

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listGetSummary', method: 'GET', params: { ...searchParams, ...basicParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.push({
            nick_name: '合计：',
            t_begin_need_get: res.total_t_begin_need_get,
            t_need_get: res.total_t_need_get,
            t_last_need_get: res.total_t_last_need_get,
            t_get: res.total_t_get
          });

          setTableData(res.data);
        }
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const onSearchClick = (val) => {
    if (typeof val.time === 'object' && Array.isArray(val.time)) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
      delete val.time;
    }
    setSearchParams(val);
  };

  const onExport = () => {
    Download('/api/accountF/exportPayGetSummary', {
      ...searchParams,
      ...basicParams
    });
  };

  // 双击某一行
  const onRowDoubleClick = (record, event) => {
    event.stopPropagation();
    router.push({
      pathname: 'AccountsReceivable',
      query: {
        memberId: record.id
      }
    });
  };

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '请输入供应商名称或会员'
    },{
      type: 'select',
      label: '销售',
      paramName: 'salesId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
      }
    }
  ];

  let columns = [
    { title: '名称', dataIndex: 'nick_name', align: 'center', width: 140 },
    // {
    //   title: '会员初始应收',
    //   dataIndex: 'begin_need_get',
    //   align: 'center',
    //   width: 120,
    //   render: (text) => (
    //     text ? (text / 100).toFixed(2) : text
    //   )
    // },
    {
      title: '期初应收余额',
      dataIndex: 't_begin_need_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '本期应收',
      dataIndex: 't_need_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '本期已收',
      dataIndex: 't_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '期末应收余额',
      dataIndex: 't_last_need_get',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '授权额度',
      dataIndex: 'pre_balance',
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
        headerShow={false}
        exportBtn={onExport}
        heightAuto={true}
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
        {/*<MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={this.onSearch}
          onShowSizeChange={this.onSearch}
        />*/}
      </Container>
    </div>
  );
};

export default ForMember;
