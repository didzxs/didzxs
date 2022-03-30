/**
 * 材料订单弹窗--待收款源单列表
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';

const OrderModal = (props) => {
  let { modalShow, onSelectedRow, modalClose, params = {} } = props;

  let basicParams = params;

  let [memberList, setMemberList] = useState([]);
  let [tableData, setTableData] = useState([]);
  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  });
  let [sorterParams, setSorterParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

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
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams, sorterParams])

  const onSearchClick = (val) => {
    if(val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    setSearchParams(val);
  }

  const onTableChange = (pagination, filters, sorter) => {
    let val = {};
    if(sorter.order) {
      val.sort = {snSelf: 1, billDate: 2, billAmount: 3}[sorter.columnKey];
      val.orderBy = {ascend: 1, descend: 2}[sorter.order];
    }
    setSorterParams(val);
  }

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/accountF/listNeedShouO', method: 'GET', params: { ...basicParams, ...searchParams, ...sorterParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            if(item.pay_type == 1 && item.ret_status > 0) {
              item.billAmount = 0 - item.billAmount;
              item.payed = 0 - item.payed;
            }
          })
          setTableData(res.data);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      })
  }

  const onModalSave = () => {
    onSelectedRow(selectedRows);
    modalClose(false);
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'input',
      label: '关键字搜索',
      paramName: 'search',
      placeholder: '请输入单据号或备注关键字'
    }, 
    // {
    //   type: 'select',
    //   label: '会员',
    //   paramName: 'memberId',
    //   itemProps: {
    //     options: PublicService.transformProjectInfoToSelect(memberList, 'value', 'label', true, true)
    //   }
    // }
  ];

  let columns = [
    { title: '源单编号', dataIndex: 'snSelf', align: 'center', width: 120, sorter: true },
    {
      title: '业务类别',
      dataIndex: 'pay_type',
      align: 'center',
      width: 120,
      render: (text, record) => {
        if(record.pay_type == 1 && record.ret_status > 1) {
          return '非账期订单推退货单';
        } else {
          return {1: '非账期订单', 2: '账期订单'}[text];
        }
      }
    },
    { title: '单据日期', dataIndex: 'billDate', align: 'center', width: 120, sorter: true },
    { title: '会员名称', dataIndex: 'member_name', align: 'center', width: 100 },
    {
      title: '单据金额',
      dataIndex: 'billAmount',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '已核销金额',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '未核销金额',
      dataIndex: 'a',
      align: 'center',
      width: 120,
      render: (text, record) => {
        return (record.billAmount - record.payed) / 100;
      }
    },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 200 },
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
        <Filtrate items={searchItems} onSearch={onSearchClick} />
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={true}
          rowSelection={rowSelection}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content', y: 475 }}
          onChange={onTableChange}
          rowKey='id'
        />
      </div>,
      span: 24,
    }
  ];
  return (
    <FormModal
      visible={modalShow}
      items={modalItems}
      title={'选择源单'}
      disabled={false}
      disabledType='readOnly'
      footerShow={true}
      saveTitle='确定'
      onModalSave={onModalSave}
      onCancel={modalCancel}
    />
  );
}

export default OrderModal;