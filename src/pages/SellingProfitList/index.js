/**
 * 销售利润列表
 */

import React, { useState, useEffect } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import Download from '../../utils/Download';

let f1;
const SellingProfitList = () => {
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let [roleList, setRoleList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [salesList, setSalesList] = useState([]);
  let [memberList, setMemberList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET', params: { page: 1, pageSize: 10000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.data.map(item => {
            list.push({
              label: item.name,
              value: item.id,
              ...item
            })
          })
          setRoleList(list);
        }
      })
    // 获取商品分类
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          res.data.map(item => {
            item.title = item.name;
            item.label = item.name;
            item.value = item.id;
            item.children = item.categories;
            item.children &&
            item.children.map((child) => {
              child.title = child.name;
              child.label = child.name;
              child.value = child.id;

              child.children = child.categories;
              child.children &&
              child.children.map(child1 => {
                child1.title = child1.name;
                child1.label = child1.name;
                child1.value = child1.id;
              })
            })
          })

          setCategoryList(res.data);
        }
      })
    getMemberList();
  }, [])

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        if(item.name == 'xiaoshou') {
          getSalesmanList(item.id);
        }
      })
    }
  }, [roleList])

  // 获取销售列表
  const getSalesmanList = (id) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {roleId: id, page: 1, pageSize: 100000}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name })
          })
          setSalesList(list);
        }
      })
  }

  // 获取会员列表
  const getMemberList = () => {
    let basicParams = {};
    if(userType == 'xiaoshou') {
      basicParams.salesId = userId;
    }
    request({url: '/api/user/getMembers/', method: 'GET', params: {page: 1, pageSize: 100000, ...basicParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({ value: item.id, label: item.nick_name })
          })
          setMemberList(list);
        }
      })
  }

  useEffect(() => {
    onSearch();
  }, [searchParams, pageIndex])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/order/listSaleEarn', method: 'GET', params: { page: pageIndex, pageSize, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            ctime: '合计：',
            number: res.summary.number,
            cost_price: res.summary.cost_price,
            payed: res.summary.payed,
            price: res.summary.price,
            sale_cost: res.summary.sale_cost,
            sale_cross: res.summary.sale_cross,
            sale_cross_rate: res.summary.sale_cross_rate,
            sale_earn: res.summary.sale_earn,
            total: res.summary.total,
          };
          res.page.list.push(total);

          setTableData(res.page.list);
          setPageTotal(res.page.totalCount);
        }
        setTableLoading(false);
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

  const onExport = () => {
    Download('/api/order/exportSaleEarn', {
      page: pageIndex,
      pageSize,
      ...searchParams,
    });
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '会员',
      paramName: 'huiyuan_id',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true),
        showSearch: true
      }
    }, {
      type: 'select',
      label: '销售',
      paramName: 'sale_id',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
      }
    }, {
      type: 'treeSelect',
      label: '分类',
      paramName: 'cid',
      itemProps: {
        treeData: categoryList
      }
    }, {
      type: 'select',
      label: '收款状态',
      paramName: 'payStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未收款' },
          { value: 1, label: '部分收款' },
          { value: 2, label: '已全部收款' },
        ]
      }
    }
  ];

  let columns = [
    // { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '单据日期', dataIndex: 'ctime', align: 'center', width: 100 },
    { title: '单据编号', dataIndex: 'ordersn', align: 'center', width: 120 },
    { title: '业务类别', dataIndex: 'stype', align: 'center', width: 100 },
    { title: '会员名', dataIndex: 'member_name', align: 'center', width: 100 },
    { title: '销售名', dataIndex: 'sales_name', align: 'center', width: 100 },
    { title: '数量', dataIndex: 'number', align: 'center', width: 100 },

    {
      title: '销售收入',
      dataIndex: 'sale_earn',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '销售成本',
      dataIndex: 'sale_cost',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '毛利率(%)',
      dataIndex: 'sale_cross_rate',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text * 100).toFixed(2) || 0 : text
      )
    },
    {
      title: '毛利',
      dataIndex: 'sale_cross',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '应收金额',
      dataIndex: 'total',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '已收金额',
      dataIndex: 'payed',
      align: 'center',
      width: 100,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '整单备注', dataIndex: 'comment', align: 'center', width: 200 },
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

export default SellingProfitList;
