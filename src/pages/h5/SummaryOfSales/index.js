/**
 * 销售汇总表
 * 
 * 销售只能查自己的数据，后端已过滤不需要前端处理
 * 销售不能查看毛利等信息
 */


import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../../utils/request';
import Filtrate from '../../../components/common/Filtrate';
import Container from '../../../components/common/Container';
import MyTable from '../../../components/common/MyTable';
import PublicService from '../../../services/PublicService';
import Download from '../../../utils/Download';
import MobileHeader from '../components/MobileHeader';

let f1;
const SummaryOfSales = (props) => {
  let { location } = props;

  let userType = localStorage.getItem('userType');

  let basicParams = {};
  if(location.pathname.indexOf('SP') > -1) {
    basicParams.type = 1;
  } else if(location.pathname.indexOf('KH') > -1) {
    basicParams.type = 2;
  } else if(location.pathname.indexOf('XS') > -1) {
    basicParams.type = 3;
  } else if(location.pathname.indexOf('FL') > -1) {
    basicParams.type = 4;
  }

  let [memberList, setMemberList] = useState([]);
  let [salesList, setSalesList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
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
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/order/saleSummary', method: 'GET', params: { ...basicParams, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          // res.data.map(item => {
          //   if(!item.oid) {
          //     item.category_name = '小记：';
          //     item.sale_earn = item.groupEarn;
          //     item.cost_price = item.groupCostPrice;
          //     item.sale_cross = item.groupCross;
          //     item.price = item.groupPrice;
          //     item.number = item.groupNumber;
          //     item.sale_cost = item.groupCost;
          //     item.sale_cross_rate = item.groupCrossRate;
          //   }
          // })
          let total = {
            category_name: '合计：',
            member_name: '合计',
            sales_name: '合计',
            cost_price: res.summary.cost_price,
            number: res.summary.number,
            price: res.summary.price,
            sale_cost: res.summary.sale_cost,
            sale_cross: res.summary.sale_cross,
            sale_cross_rate: res.summary.sale_cross_rate,
            sale_earn: res.summary.sale_earn,
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
    Download('/api/order/exportSaleSummary', {
      ...basicParams,
      ...searchParams,
    });
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, 
    ...(
      location.pathname.indexOf('SP') > -1 &&
      [{
        type: 'treeSelect',
        label: '商品分类',
        paramName: 'category_id',
        itemProps: {
          treeData: categoryList,
        },
        span: 12
      }, {
        type: 'select',
        label: 'sku',
        paramName: 'sku_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(skuList, 'value', 'label', true, true),
          style: { width: '240px' }
        },
        span: 12,
      }] || []
    ), 
    ...(
      location.pathname.indexOf('FL') > -1 &&
      [{
        type: 'treeSelect',
        label: '商品分类',
        paramName: 'category_id',
        itemProps: {
          treeData: categoryList,
        },
        span: 12,
      }] || []
    ), 
    {
      type: 'select',
      label: '客户',
      paramName: 'huiyuan_id',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true)
      },
      span: 12,
    },
    ...(
      userType != 'xiaoshou' &&
      [{
        type: 'select',
        label: '销售人员',
        paramName: 'sale_id',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(salesList, 'value', 'label', true, true)
        },
        span: 12,
      }] || []
    ), 
  ];

  let columns = [
    ...(
      location.pathname.indexOf('SP') > -1 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
        { title: '商品编号', dataIndex: 'sku_sn', align: 'center', width: 140 },
        { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 160 },
        { title: '规格型号', dataIndex: 'pname', align: 'center', width: 100 },
        { title: '基本单位', dataIndex: 'unit_name', align: 'center', width: 100 },
      ] || []
    ),
    ...(
      location.pathname.indexOf('KH') > -1 &&
      [
        { title: '客户名称', dataIndex: 'member_name', align: 'center', width: 120 },
      ] || []
    ),
    ...(
      location.pathname.indexOf('XS') > -1 &&
      [
        { title: '销售名称', dataIndex: 'sales_name', align: 'center', width: 120 },
      ] || []
    ),
    ...(
      location.pathname.indexOf('FL') > -1 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
      ] || []
    ),
    { title: '基本数量', dataIndex: 'number', align: 'center', width: 100 },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100 || 0).toFixed(2) : text
      )
    },
    {
      title: '销售收入',
      dataIndex: 'sale_earn',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    ...(
      (userType == 'admin' || userType == 'caiwu' || userType == 'caiwu_cn') &&
      [{
        title: '销售成本',
        dataIndex: 'sale_cost',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }, {
        title: '单位成本',
        dataIndex: 'cost_price',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }, {
        title: '销售毛利',
        dataIndex: 'sale_cross',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text / 100).toFixed(2) : text
        )
      }, {
        title: '毛利率(%)',
        dataIndex: 'sale_cross_rate',
        align: 'center',
        width: 120,
        render: (text) => (
          text ? (text * 100).toFixed(2) : text
        )
      }] || []
    ),
  ];

  return (
    <div>
      <MobileHeader />
      <Filtrate items={searchItems} onSearch={onSearchClick} wrappedComponentRef={ref => f1 = ref} style={{overflowX: 'auto'}} btnStyle={{marginTop: '15px'}} />
      <Container
        heightAuto={true}
        headerShow={false}
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

export default SummaryOfSales;