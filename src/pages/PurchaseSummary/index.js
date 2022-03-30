/**
 * 采购汇总表
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';

const PurchaseSummary = (props) => {
  let { location } = props;

  let [supplierList, setSupplierList] = useState([]);
  let [categoryList, setCategoryList] = useState([]);
  let [skuList, setSkuList] = useState([]);

  let [searchParams, setSearchParams] = useState({});
  let [sorterParams, setSorterParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    request({ url: '/api/supplier/list', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.name,
            })
          })
          setSupplierList(list);
        }
      })
    // 获取商品分类
    request({ url: '/api/open/listProdCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            item.label = item.name;
            item.value = item.id;
            item.children = item.categories;
            item.children &&
              item.children.map((child) => {
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

  const onSearch = () => {
    setTableLoading(true);

    let basicParams = {
      type: location.query.type, // 1:商品 2:供应商
      startTime: moment().format('YYYY-MM-01'),
      endTime: moment().format('YYYY-MM-DD'),
    }
    request({url: '/api/caigou/listSummary', method: 'GET', params: {...basicParams, ...searchParams, ...sorterParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          let total = {
            supplier_name: '合计：', // type: 1
            category_name: '合计', // type: 2
            number: res.numberTotal,
            gouhuo_fee: res.gouhuoFeeTotal,
            caigou_fee: res.caigouFeeTotal,
          };
          res.data.push(total);

          setTableData(res.data);
        }
        setTableLoading(false);
      })
  }

  useEffect(() => {
    onSearch();
  }, [searchParams, sorterParams])

  const onSearchClick = (val) => {
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;

    setSearchParams(val);
  }

  // 处理表格排序数据
  const handleSorter = (pagination, filters, sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { operated_at: 1, gouhuo_fee: 2 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    setSorterParams(val);
  }

  const onExport = () => {
    let basicParams = {
      type: location.query.type, // 1:商品 2:供应商
      startTime: moment().format('YYYY-MM-01'),
      endTime: moment().format('YYYY-MM-DD'),
    }
    Download('/api/caigou/exportSummary', {
      ...basicParams,
      ...searchParams,
      ...sorterParams,
    });
  }

  let searchItems = [
    ...(
      location.query.type == 2 &&
      [{
        type: 'select',
        label: '供应商',
        paramName: 'supplierId',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
        },
      }] || []
    ), 
    ...(
      location.query.type == 1 &&
      [{
        type: 'treeSelect',
        label: '商品分类',
        paramName: 'categoryId',
        itemProps: {
          treeData: categoryList,
        },
      }, {
        type: 'select',
        label: 'sku',
        paramName: 'skuId',
        itemProps: {
          showSearch: true,
          options: PublicService.transformProjectInfoToSelect(skuList, 'value', 'label', true, true),
          style: { width: '240px' }
        },
      }] || []
    ), {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    },
  ];

  let columns = [
    ...(
      location.query.type == 1 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
        { title: '商品编号', dataIndex: 'sku_sn', align: 'center', width: 120 },
        { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120 },
        { title: '规格型号', dataIndex: 'sku_name', align: 'center', width: 120 },
        { title: '单位', dataIndex: 'unit_name', align: 'center', width: 120 },
      ] || []
    ),
    ...(
      location.query.type == 2 &&
      [
        { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 120 }
      ] || []
    ),
    // { title: '仓库', dataIndex: 'warehouse', align: 'center', width: 120 },
    { title: '数量', dataIndex: 'number', align: 'center', width: 120 },
    {
      title: '单价',
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text, record) => {
        if(record.number == 0) {
          return 0;
        // } else if (record.number < 0) {
        //   return ((0 - record.gouhuo_fee / record.number) / 100 || 0).toFixed(2);
        } else {
          return ((record.gouhuo_fee / record.number) / 100 || 0).toFixed(2);
        }
      }
    },
    {
      title: '采购金额',
      dataIndex: 'gouhuo_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '采购费用',
      dataIndex: 'caigou_fee',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
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
          onChange={handleSorter}
          scroll={{x: 'max-content'}}
        />
      </Container>
    </div>
  );
}

export default PurchaseSummary;