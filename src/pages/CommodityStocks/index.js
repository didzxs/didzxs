/**
 * 仓库盘点
 */
import React, { useState, useEffect } from 'react';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import Download from '../../utils/Download';

const CommodityStocks = (props) => {
  let { location } = props;

  let [categoryList, setCategoryList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    id: location.query.id,
  });
  let [pageSize] = useState(100);
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
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams, pageIndex])

  const onSearch = () => {
    setTableLoading(true);

    let url = '/api/open/sku/list';
    let basicParams = {};
    if (location.query.id) {
      url = '/api/storeCheck/info';
      basicParams.id = location.query.id;
    }

    request({ url, method: 'GET', params: { page: pageIndex, pageSize, ...searchParams, ...basicParams } })
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
    setSearchParams(val);
  }

  const onPageChange = (page) => {
    setPageIndex(page);
  }

  const onExport = () => {
    Download('/api/product/sku/export', {
      page: pageIndex,
      pageSize,
      ...searchParams,
    });
  }

  let searchItems = [
    {
      type: 'treeSelect',
      label: '分类',
      paramName: 'cid',
      itemProps: {
        treeData: categoryList
      }
    }, {
      type: 'input',
      label: '搜索关键字',
      paramName: 'k',
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '上架' },
          { value: 0, label: '下架' },
        ]
      }
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    ...(
      location.pathname.indexOf('Detail') < 0 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 100 },
        { title: '商品编号', dataIndex: 'id', align: 'center', width: 100 },
        { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 100 },
        // { title: '商品备注', dataIndex: 'comment', align: 'center', width: 160 },
        { title: '规格型号', dataIndex: 'properties', align: 'center', width: 120 },
        { title: '单位', dataIndex: 'unit_name', align: 'center', width: 100 },
        { title: '系统库存', dataIndex: 'stores', align: 'center', width: 100 }
      ] || [
        { title: '商品类别', dataIndex: 'categoryName', align: 'center', width: 100 },
        { title: '商品编号', dataIndex: 'skuId', align: 'center', width: 100 },
        { title: '商品名称', dataIndex: 'prodName', align: 'center', width: 100 },
        { title: '规格型号', dataIndex: 'skuName', align: 'center', width: 120 },
        { title: '单位', dataIndex: 'unitName', align: 'center', width: 100 },
        { title: '系统库存', dataIndex: 'sysNumber', align: 'center', width: 100 }
      ]
    ),
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} />
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

export default CommodityStocks;