/**
 * 销售数据-销售排名
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';
import Util from '../../utils/Util';

let f1;
const SalesStatistics = (props) => {
  let { location } = props;
  let userType = localStorage.getItem('userType');
  let userId = localStorage.getItem('userId');

  let basicParams = {};
  if(location.pathname.indexOf('SP') > -1) {
    basicParams.type = 1;
    userType == 'xiaoshou' && (basicParams.sale_id = userId);
  } else if(location.pathname.indexOf('HY') > -1) {
    basicParams.type = 2;
    userType == 'xiaoshou' && (basicParams.sale_id = userId);
  } else if(location.pathname.indexOf('XS') > -1) {
    basicParams.type = 3;
  }

  let [memberList, setMemberList] = useState([]);
  let [salesList, setSalesList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [sorterParams, setSorterParams] = useState({});
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
    // 获取商品分类
    request({ url: '/api/open/listProdCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
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

    // sku列表
    request({ url: '/api/open/sku/list', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.prod_name + ' - ' + item.properties,
            })
          })
          setSkuList(list);
        }
      })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams, sorterParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/order/saleSort', method: 'GET', params: { ...basicParams, ...searchParams, ...sorterParams } })
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

  const onExport = () => {
    Download('/api/order/exportSaleSort', {
      ...basicParams,
      ...searchParams,
    });
  }

  const onTableChange = (pagination, filters, sorter) => {
    let val = {};
    if(sorter.order) {
      val.sort = {sku_id: 1, prod_name: 2, member_name: 2, sales_name: 2, count: 3, number: 4, sale_earn: 5, cost_price: 6, sale_cost: 7, sale_cross: 8, sale_cross_rate: 9}[sorter.columnKey];
      val.orderBy = {ascend: 1, descend: 2}[sorter.order];
    }
    setSorterParams(val);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'treeSelect',
      label: '商品分类',
      paramName: 'category_id',
      itemProps: {
        treeData: categoryList,
      },
    }, {
      type: 'select',
      label: 'sku',
      paramName: 'sku_id',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(skuList, 'value', 'label', true, true),
        style: { width: '240px' }
      },
    },
    ...(
      (userType == 'admin' || userType.indexOf('kefu') > -1 || userType.indexOf('xiaoshou') > -1 || userType == 'hr') &&
      [{
        type: 'select',
        label: '客户',
        paramName: 'huiyuan_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true)
        },
      }] || []
    ),
    ...(
      (userType == 'admin' || userType.indexOf('kefu') > -1 || userType == 'xiaoshou_mgr' || userType == 'hr') &&
      [{
        type: 'select',
        label: '销售人员',
        paramName: 'sale_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
        },
      }] || []
    ),
  ];

  let columns = [
    ...(
      basicParams.type == 1 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
        { title: '商品编号', dataIndex: 'sku_id', align: 'center', width: 120, sorter: true },
        { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 160, sorter: true },
        { title: '规格型号', dataIndex: 'pname', align: 'center', width: 100 },
        { title: '基本单位', dataIndex: 'unit_name', align: 'center', width: 100 }
      ] || []
    ),
    ...(
      basicParams.type == 2 &&
      [
        { title: '客户名称', dataIndex: 'member_name', align: 'center', width: 120, sorter: true },
      ] || []
    ),
    ...(
      basicParams.type == 3 &&
      [
        { title: '销售名称', dataIndex: 'sales_name', align: 'center', width: 120, sorter: true },
      ] || []
    ),
    { title: '销售笔数', dataIndex: 'count', align: 'center', width: 100, sorter: true },
    { title: '销售基本数量', dataIndex: 'number', align: 'center', width: 140, sorter: true },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text) => (
        Util.isNumber(text) ? (text / 100 || 0).toFixed(2) : text
      )
    },
    {
      title: '售价金额',
      dataIndex: 'sale_earn',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        Util.isNumber(text) ? (text / 100).toFixed(2) : text
      )
    },
    ...(
      (userType == 'admin' || userType == 'caiwu') &&
      [{
        title: '单位成本',
        dataIndex: 'cost_price',
        align: 'center',
        width: 120,
        sorter: true,
        render: (text) => (
          Util.isNumber(text) ? (text / 100).toFixed(2) : text
        )
      },
      {
        title: '销售成本',
        dataIndex: 'sale_cost',
        align: 'center',
        width: 120,
        sorter: true,
        render: (text) => (
          Util.isNumber(text) ? (text / 100).toFixed(2) : text
        )
      },
      {
        title: '销售毛利',
        dataIndex: 'sale_cross',
        align: 'center',
        width: 120,
        sorter: true,
        render: (text) => (
          Util.isNumber(text) ? (text / 100).toFixed(2) : text
        )
      },
      {
        title: '毛利率(%)',
        dataIndex: 'sale_cross_rate',
        align: 'center',
        width: 120,
        sorter: true,
        render: (text) => (
          Util.isNumber(text) ? (parseFloat(text) * 100).toFixed(2) || 0 : text
        )
      }] || []
    ),
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
          onChange={onTableChange}
        />
      </Container>
    </div>
  );
}

export default SalesStatistics;
