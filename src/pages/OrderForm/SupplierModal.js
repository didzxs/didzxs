/**
 * 供应商弹窗
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const SupplierModal = (props) => {
  let { modalShow, onSelectedSupplier, modalClose } = props;

  let [skuList, setSkuList] = useState([]);
  let [searchParams, setSearchParams] = useState({});
  let [pageSize] = useState(10);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);


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
    request({url: '/api/supplier/list', method: 'GET', params: {page, pageSize, status: 1, ...searchParams}})
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
    onSelectedSupplier(selectedRows[0]);
    modalClose(false);
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let searchItems = [
    {
      type: 'input',
      label: '供应商名称',
      paramName: 'searchName',
    }, {
      type: 'input',
      label: '联系人名称',
      paramName: 'searchContactName'
    }, {
      type: 'input',
      label: '联系人电话',
      paramName: 'searchContactMobile'
    }
  ];

  let columns = [
    { title: '编号', dataIndex: 'id', align: 'center', width: 80 },
    { title: '名称', dataIndex: 'name', align: 'center', width: 120 },
    { title: '联系人', dataIndex: 'contact_name', align: 'center', width: 100 },
    { title: '手机号', dataIndex: 'contact_mobile', align: 'center', width: 120 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 200 },
  ];

  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys([selectedRowKeys[selectedRowKeys.length - 1]]);
      setSelectedRows([selectedRows[selectedRows.length - 1]]);
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
          scroll={{y: 475}}
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
      title={'选择供应商'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default SupplierModal;