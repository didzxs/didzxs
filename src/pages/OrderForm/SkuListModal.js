/**
 * 购货单选择商品弹窗
 */
import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const SkuListModal = (props) => {
  let { modalShow, onSelectedSkuList, modalClose } = props;

  let [classifyList, setClassifyList] = useState([]);

  let [skuList, setSkuList] = useState([]);
  let [searchParams, setSearchParams] = useState({});
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    // 获取商品分类
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          res.data.map(item => {
            item.title = item.name;
            item.value = item.id;
            item.children = item.categories;
            item.children &&
            item.children.map((child) => {
              child.title = child.name;
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

          setClassifyList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    onSearch(pageIndex);
  }, [pageIndex, searchParams])

  const onSearchClick = (val) => {
    setPageIndex(1);
    setSearchParams(val);
  }

  const onSearch = (page = 1) => {
    setTableLoading(true);
    setPageIndex(page);
    request({url: '/api/open/sku/list', method: 'GET', params: {page, pageSize, ...searchParams}})
      .then(res => {
        if(res && res.retcode == 0) {
          setSkuList(res.page.list);
          setPageTotal(res.page.totalPage * res.page.pageSize);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      })
  }

  const onModalSave = () => {
    onSelectedSkuList(selectedRows);
    modalClose(false);
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let searchItems = [
    {
      type: 'treeSelect',
      label: '分类',
      paramName: 'cid',
      itemProps: {
        treeData: classifyList
      },
    }, {
      type: 'input',
      label: '关键字查询',
      paramName: 'k'
    }
  ];

  let columns = [
    {
      title: '图片',
      dataIndex: 'pic',
      align: 'center',
      width: 100,
      render: (text) => (
        <img src={text} style={{maxWidth: '100%', height: '50px'}} />
      )
    },
    { title: '商品编号', dataIndex: 'sku_sn', align: 'center', width: 120 },
    { title: '品牌', dataIndex: 'brandList', align: 'center', width: 120 },
    { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 120 },
    { title: 'sku名称', dataIndex: 'name', align: 'center', width: 120 },
    { title: '规格型号', dataIndex: 'properties', align: 'center', width: 120 },
    { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 120 },
    { title: '单位', dataIndex: 'unit_name', align: 'center', width: 100 },
    // { title: '库存基本数量', dataIndex: 'stores', align: 'center', width: 130 },
    { title: '库存', dataIndex: 'stores', align: 'center', width: 100 },
    // { title: '录入数量', dataIndex: 'name8', align: 'center', width: 100 },
    // { title: '备注', dataIndex: 'name9', align: 'center', width: 160 },
  ];

  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  let modalItems = [
    {
      type: 'blank',
      content: <div>
        <Filtrate items={searchItems} onSearch={onSearchClick}/>
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          rowSelection={rowSelection}
          dataSource={PublicService.transformArrayData(skuList, true, true)}
          scroll={{x: 'max-content', y: 475}}
          rowKey='id'
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={onSearch}
          onShowSizeChange={onSearch}
        />
      </div>,
      span: 24,
    }
  ];
  return (
    <FormModal
      visible={modalShow}
      items={modalItems}
      title={'选择商品'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default SkuListModal;