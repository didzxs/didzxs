/**
 * 应付账款明细表
 *
 * 菜单权限：超管、财务、采购
 */

import React, { useEffect, useState } from 'react';
import moment from 'moment';
import request from '../../utils/request';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import Download from '../../utils/Download';

let f1;
const AccountsPayable = (props) => {
  let { location } = props;

  let [supplierList, setSupplierList] = useState([]);

  let [searchParams, setSearchParams] = useState({
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
    supplierId: location.query.supplierId, // 应收/付账款汇总表跳转默认参数
  });
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    // 供应商
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
      f1 && f1.props.form.setFieldsValue({
        supplierId: location.query.supplierId * 1 || undefined,
      })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);

    request({ url: '/api/accountF/listPayDetail', method: 'GET', params: { ...searchParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          let total = {
            organ_name: '合计：',
            to_pay: res.summary.totalToPay,
            pre_pay: res.summary.totalPrePay,
            amount: res.summary.totalToPay + res.summary.totalPrePay
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
    Download('/api/accountF/exportPayDetail', {
      ...searchParams,
    });
  }

  let searchItems = [
    {
      type: 'select',
      label: '供应商',
      paramName: 'supplierId',
      itemProps: {
        showSearch: true,
        options: PublicService.transformProjectInfoToSelect(supplierList, 'value', 'label', true, true)
      },
    }, {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    },
  ];

  let columns = [
    { title: '供应商', dataIndex: 'organ_name', align: 'center', width: 120 },
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 140 },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 160 },
    { title: '业务类型', dataIndex: 's_name', align: 'center', width: 100 },
    {
      title: '增加应付款',
      dataIndex: 'to_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '增加预付款',
      dataIndex: 'pre_pay',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '应付款余额',
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 220 },
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
      </Container>
    </div>
  );
}

export default AccountsPayable;
