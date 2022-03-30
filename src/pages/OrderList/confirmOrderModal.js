/**
 * 确认收款-销售（商支） - 客服确认订单
 */

import React, { useEffect, useState } from 'react';
import { Button, InputNumber, message, Select } from 'antd';
import FormModal from '../../components/common/FormModal';
import Util from '../../utils/Util';
import config from '../../config';
import request from '../../utils/request';
import moment from 'moment';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';

let myForm;
const OrderUpdateModal = (props) => {
  let { modalShow, record, onModalClose, onSearch } = props;

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  let [memberList, setMemberList] = useState([{ value: 1, label: 'jia' }]);
  let [salesList, setSalesList] = useState([]);
  let [accountList, setAccountList] = useState([]);

  let [accountItemList, setAccountItemList] = useState([{}]);

  let [accountItemListTotal, setAccountItemListTotal] = useState({}); // 合计行：收款总金额

  useEffect(() => {
    // 收款总金额
    let obj = { ...accountItemListTotal };
    obj.inAccountId = '合计：';
    obj.type = 'total';
    obj.key = 'total';

    let amount = 0;
    accountItemList.map(item => {
      amount += item.amount * 1 || 0;
    });

    obj.amount = Util.toFixed2(amount);

    // 计算总金额
    onAmountChange(amount);

    setAccountItemListTotal(obj);
  }, [accountItemList]);

  useEffect(() => {
    // 会员
    request({ url: '/api/user/getMembers/', method: 'GET', params: { page: 1, pageSize: 100000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              ...item,
              value: item.id,
              label: item.nick_name,
              disabled: !item.begin_check
            });
          });
          setMemberList(list);
        }
      });
    // 销售
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: 5 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.nick_name
            });
          });
          setSalesList(list);
        }
      });
    // 账户列表
    request({ url: '/api/account/list', method: 'GET', params: { page: 1, pageSize: 100000, status: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          res.page.list.map(item => {
            list.push({
              value: item.id,
              label: item.name,
              disabled: !item.beginCheck
            });
          });
          setAccountList(list);
        }
      });
  }, []);

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    // 客户
    const organ = memberList.find(_x => (_x.id === val.organId)) || {};
    const organName = organ.hasOwnProperty('nick_name') ? organ.nick_name : '';

    // 收款人
    const handsPerson = salesList.find(_item => (_item.value === val.handsPersonId)) || {};
    const handsPersonName = handsPerson.hasOwnProperty('label') ? handsPerson.label : '';

    let list = [...accountItemList];
    let amountList = [];
    let amount = 0;
    list.map(item => {
      let _account = accountList.find(_acc => (_acc.value == item.inAccountId)) || {}; // inAccountId：结算账户Id

      amountList.push({
        amount: item.amount && Util.toFixed0(item.amount * 100),
        inAccountId: item.inAccountId,
        outAccountName: _account && _account.label
      });
    });
    let data = {
      'orderId': record.oid,
      'payed': Util.toFixed0(accountItemListTotal.amount * 100),
      'discounts': val.discounts ? Util.toFixed0(val.discounts * 100) : 0,
      'organId': val.organId,                                                 // 客户Id
      'organName': organName,                                                 // 客户
      'handsPersonId': val.handsPersonId,                                     // 收款人Id
      'handsPersonName': handsPersonName,                                     // 收款人
      'operatedAt': moment(val.operatedAt).format('YYYY-MM-DD'),
      'comment': val.comment || '',                                           // 备注
      'accountItemList': amountList
    };
    console.log('data', data);

    request({ url: '/api/order/confirmPay', method: 'POST', data })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          onSearch();
          onModalClose(false);
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      });
  };

  const modalCancel = () => {
    onModalClose(false);
  };

  // 计算优惠金额
  const onAmountChange = (val) => {
    const num = Util.toFixed2(record.total - (val * 100)) / 100;

    myForm && myForm.props.form.setFieldsValue({
      discounts: num < 10 ? num : 0
    });
  };

  let onSelectChange = (index, listType, type, val) => {
    let list = [...{ accountItem: accountItemList }[listType]];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;
      }
    });
    setAccountItemList(list);
  };

  let onInputNumChange = (index, listType, type, val) => {
    if ((type == 'amount' || type == 'totalAmount') && !(/(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0)$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/.test(val))) {
      // 最多保留2位小数 // 大于0的数字---》改为允许负值
      return message.warning('请输入数字，且最多保留2位小数！');
    }
    let list = [...{ accountItem: accountItemList }[listType]];

    if (Array.isArray(list) && list.length > index) {
      let item = list[index];
      if (type == 'totalAmount' && (Math.abs(val) > Math.abs((item.billAmount - item.payed) / 100))) {
        item[type] = (item.billAmount - item.payed) / 100;
        return message.warning('核销金额大于未核销金额！');
      }
      list[index][type] = val;
    }
    setAccountItemList(list);
  };

  let onDeleteItem = (index, type) => {
    let list = [...{ accountItem: accountItemList }[type]];
    if (type == 'accountItem' && list.length == 1) {
      return message.warning('至少保存一条有效分录数据！');
    }
    list.splice(index, 1);

    setAccountItemList(list);
  };

  // 已选择客户
  const onOrganChange = (val) => {
    const checked = memberList.find(_x => (_x.id === val));

    myForm && myForm.props.form.setFieldsValue({
      handsPersonId: checked.sales_id
    });
  };

  let onAddItem = () => {
    let list = [...accountItemList];
    list.push({});
    setAccountItemList(list);
  };

  let disabled = !!record.checkStatus;
  let modalColumns = [
    {
      title: <><span style={{ color: 'red' }}>*</span>结算账户</>,
      dataIndex: 'inAccountId',
      align: 'center',
      width: 140,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <Select value={text} onChange={onSelectChange.bind(this, index, 'accountItem', 'inAccountId')}
                         disabled={disabled}>
            {
              accountList.map(item => (
                <Select.Option value={item.value} key={item.value} disabled={item.disabled}>{item.label}</Select.Option>
              ))
            }
          </Select>;
        }
      }
    }, {
      title: <><span style={{ color: 'red' }}>*</span>收款金额</>,
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => {
        if (record.type == 'total') {
          return text;
        } else {
          return <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'accountItem', 'amount')}
                              disabled={disabled} style={{ width: '100%' }}/>;
        }
      }
    }, {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record, index) => (
        record.type != 'total' &&
        <a onClick={onDeleteItem.bind(this, index, 'accountItem')} style={{ color: 'red' }}>删除</a>
      )
    }
  ];

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18
  };

  let modalItems = [
    {
      type: 'select',
      label: '客户',
      paramName: 'organId',
      itemProps: {
        options: memberList,
        showSearch: true,
        onChange: onOrganChange
      },
      initialValue: record.om && record.om.member_id || null,
      disabled: true,
      ...colConfig
    }, {
      type: 'select',
      label: '收款人',
      paramName: 'handsPersonId',
      itemProps: {
        options: salesList
      },
      initialValue: record.om && record.om.sales_id,
      disabled,
      ...colConfig
    }, {
      type: 'datePicker',
      label: '单据日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: record.operatedAt && moment(record.operatedAt) || moment(),
      disabled,
      ...colConfig
    }, {
      type: 'blank',
      content: <div style={{ position: 'relative' }}>
        {record.checkStatus && <img src={require('../../assets/audit.png')} style={{
          position: 'absolute',
          top: '50%',
          right: 0,
          transform: 'translateY(-70%)'
        }}/> || ''}
      </div>,
      span: 24
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 25px 20px' }}>
        {!disabled && <Button onClick={onAddItem}>+ 新增</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData([...accountItemList, accountItemListTotal], true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24
    }, {
      type: 'number',
      label: '订单总额：',
      paramName: 'total',
      initialValue: record.total && Util.toFixed2(record.total / 100),
      itemProps: {
        formatter: value => `${value}元`
      },
      disabled: true,
      ...colConfig
    }, {
      type: 'number',
      label: '优惠金额：',
      paramName: 'discounts',
      itemProps: {
        formatter: value => `${value}元`,
        max: 10,
        min: 0
      },
      ...colConfig
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: record.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }
  ];

  return (
    <div>
      <FormModal
        visible={modalShow}
        width={820}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={'更新订单'}
        disabled={false}
        disabledType="readOnly"
        footerShow={true}
        onModalSave={onModalSave}
        onCancel={modalCancel}
      />
    </div>
  );
};

export default OrderUpdateModal;
