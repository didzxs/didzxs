/**
 * 商品收发汇总表
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';

let f1;
const ProdSendAndReceiveSummary = (props) => {
  let { location } = props;
  
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
    // memberId: location.query.memberId, // 应收/付账款汇总表跳转默认参数
  });
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
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
    f1 && f1.props.form.setFieldsValue({
      memberId: location.query.memberId * 1 || undefined,
    })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/product/listProductSummary', method: 'GET', params: { page: pageIndex, pageSize, ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            category_name: '合计：',
            inSaleNumber: res.summary.inSaleNumber,
            inSaleCost: res.summary.inSaleCost,
            outPanNumber: res.summary.outPanNumber,
            kickCost: res.summary.kickCost,
            inChuRuCost: res.summary.inChuRuCost,
            outSaleNumber: res.summary.outSaleNumber,
            outPanCost: res.summary.outPanCost,
            inCaigouCost: res.summary.inCaigouCost,
            outChuRuNumber: res.summary.outChuRuNumber,
            inChuRuNumber: res.summary.inChuRuNumber,
            outSaleCost: res.summary.outSaleCost,
            inPanNumber: res.summary.inPanNumber,
            inCaigouNumber: res.summary.inCaigouNumber,
            inPanCost: res.summary.inPanCost,
            outChuRuCost: res.summary.outChuRuCost,
            outCaigouCost: res.summary.outCaigouCost,
            outCaigouNumber: res.summary.outCaigouNumber,
            kickNumber: res.summary.kickNumber,
          };
          res.page.list.push(total);

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

  const onExport = () => {
    Download('/api/product/exportProductSummary', {
      ...searchParams,
    });
  }

  useEffect(() => {
    onSearch();
  }, [pageIndex])

  const onPageChange = (page) => {
    setPageIndex(page);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
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
  ];

  let columns = [
    { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120, fixed: 'left' },
    // { title: '商品编号', dataIndex: 'sku_id', align: 'center', width: 120, fixed: 'left' },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120, fixed: 'left' },
    { title: '规格型号', dataIndex: 'sku_name', align: 'center', width: 120 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 120 },
    {
      title: '采购',
      children: [
        { title: '数量', dataIndex: 'inCaigouNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'inCaigouCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '销售退回',
      children: [
        { title: '数量', dataIndex: 'inSaleNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'inSaleCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '盘盈',
      children: [
        { title: '数量', dataIndex: 'inPanNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'inPanCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '其他入库',
      children: [
        { title: '数量', dataIndex: 'inChuRuNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'inChuRuCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '入库合计',
      children: [
        {
          title: '数量',
          dataIndex: 'number',
          align: 'center',
          width: 120,
          render: (text, record) => (
            record.inPanNumber + record.inSaleNumber + record.inCaigouNumber + record.inChuRuNumber
          )
        },
        {
          title: '成本',
          dataIndex: 'cost',
          align: 'center',
          width: 120,
          render: (text, record) => (
            record.inCaigouCost + record.inSaleCost + record.inPanCost + record.inChuRuCost
          )
        },
      ]
    },
    {
      title: '采购退回',
      children: [
        { title: '数量', dataIndex: 'outCaigouNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'outCaigouCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '销售',
      children: [
        { title: '数量', dataIndex: 'outSaleNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'outSaleCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '盈亏',
      children: [
        { title: '数量', dataIndex: 'outPanNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'outPanCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '其他出库',
      children: [
        { title: '数量', dataIndex: 'outChuRuNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'outChuRuCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    },
    {
      title: '出库合计',
      children: [
        {
          title: '数量',
          dataIndex: 'number1',
          align: 'center',
          width: 120,
          render: (text, record) => (
            record.outCaigouNumber + record.outSaleNumber + record.outPanNumber + record.outChuRuNumber
          )
        },
        {
          title: '成本',
          dataIndex: 'cost1',
          align: 'center',
          width: 120,
          render: (text, record) => (
            ((record.outCaigouCost + record.outSaleCost + record.outPanCost + record.outChuRuCost) / 100).toFixed(2)
          )
        }
      ]
    },
    {
      title: '结存',
      children: [
        { title: '数量', dataIndex: 'kickNumber', align: 'center', width: 120 },
        { title: '成本', dataIndex: 'kickCost', align: 'center', width: 120, render: (text) => text ? (text / 100).toFixed(2) : text },
      ]
    }
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

export default ProdSendAndReceiveSummary;