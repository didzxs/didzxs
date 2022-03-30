import React, { useEffect, useState } from 'react';
import MyPagination from '../../components/common/MyPagination';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import request from '../../utils/request';

const CommunicationList = () => {
  let [page, setPage] = useState(1);
  let [pageSize] = useState(15);
  let [pageTotal, setPageTotal] = useState(0);
  let [dataList, setDataList] = useState([]);
  
  useEffect(() => {
    onSearch();
  }, [])

  const onSearch = (page = 1) => {
    setPage(page);
    request({url: '/api/order/potential/list', method: 'GET', params: {page, pageSize}})
      .then(res => {
        if(res && res.retcode == 0) {
          setDataList(res.page.list);
          setPageTotal(res.page.totalCount);
        }
      })
  }

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '客户名称', dataIndex: 'nick_name', align: 'center', width: 120 },
    { title: '手机号', dataIndex: 'mobile', align: 'center', width: 120 },
    { title: '项目名称', dataIndex: 'project_name', align: 'center', width: 150 },
    {
      title: '是否成交',
      dataIndex: 'is_deal',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '未成交', 1: '已成交'}[text]
      )
    },
  ];

  return (
    <div>
      <MyTable
        heightAuto={true}
        columns={columns}
        pagination={false}
        dataSource={PublicService.transformArrayData(dataList, true, true)}
        scroll={{x: 'max-content'}}
      />
      <MyPagination
        pageSize={pageSize}
        current={page}
        total={pageTotal}
        onChange={onSearch}
        onShowSizeChange={onSearch}
      />
    </div>
  );
}

export default CommunicationList;