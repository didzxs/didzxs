/**
 * 盘点记录
 */

import React from 'react';
import { Icon, message, Popconfirm } from 'antd';
import moment from 'moment';
import router from 'umi/router';
import request from '../../utils/request';
import Template from '../Template';

let f1;
const InventoryRecords = () => {

  const onDelete = (id) => {
    request({ url: `/api/storeCheck/${id}`, method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const handleSearchData = (val) => {
    if(val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    return val;
  }

  // 双击
  const onRowDoubleClick = (record) => {
    router.push({
      pathname: 'InventoryVerificationDetail',
      query: {
        id: record.id,
      }
    })
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }
  ];

  let columnStyle = {
    margin: '0 auto',
    padding: '5px 0',
    borderBottom: '1px solid #e8e8e8',
    width: '100px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  }
  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '盘点时间', dataIndex: 'checked_at', align: 'center', width: 120 },
    { title: '盘点编号', dataIndex: 'sn_self', align: 'center', width: 120 },
    { title: '创建人', dataIndex: 'creator_name', align: 'center', width: 120 },
    {
      title: '类型',
      dataIndex: 'type',
      align: 'center',
      width: 120,
      render: (text, record) => {
        let results = [];
        if(record.results) {
          let arr = record.results.split(',');
          arr.map(item => {
            let a = item.split('|');
            results.push(a[0]);
          })
        }
        
        return <>
          {
            results.map((item, index) => (
              <div key={index} title={item} style={columnStyle}>{{1: '盘亏出库单', 2: '盘盈入库单'}[item]}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '盘盈/盘亏单编号',
      dataIndex: 'code',
      align: 'center',
      width: 160,
      render: (text, record) => {
        let results = [];
        if(record.results) {
          let arr = record.results.split(',');
          arr.map(item => {
            let a = item.split('|');
            results.push(a[1]);
          })
        }
        
        return <>
          {
            results.map((item, index) => (
              <div key={index} title={item} style={{...columnStyle, width: '140px'}}>{item}</div>
            ))
          }
        </>;
      }
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 100,
      render: (text, record) => (
        <>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let basicParams = {
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
  };

  let params = {
    searchItems,
    columns,
    headerShow: false,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSearchData,
    tableProps: {
      onRow: (record) => {
        return {
          onDoubleClick: onRowDoubleClick.bind(this, record)
        }
      }
    },
    searchApi: { url: '/api/storeCheck/list', params: basicParams },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default InventoryRecords;