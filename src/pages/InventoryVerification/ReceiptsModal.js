/**
 * 生成盘点单据
 */

import React, { useState } from 'react';
import { message, Button, InputNumber, Input } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import FormModal from '../../components/common/FormModal';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import SkuListModal from '../OrderForm/SkuListModal';
import SupplierModal from '../OrderForm/SupplierModal';

let myForm;
const ReceiptsModal = (props) => {
  let { modalShow, modalTitle, modalClose, type, id } = props;

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [selectedSupplier, setSelectedSupplier] = useState({});

  let [selectedSkuList, setSelectedSkuList] = useState([]);
  let [skuListModalShow, setSkuListModalShow] = useState(false);

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    let rules = {number: '数量', price: '入库单价'};
    for(let i = 0; i < selectedSkuList.length; i++) {
      for(let key in rules) {
        if(!selectedSkuList[i][key] && selectedSkuList[i][key] != 0) {
          message.warning(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    val.storeCheckMasterId = id;

    val.type = type; // 1: 其他入库单 2: 其他出库单
    val.organId = selectedSupplier.id;
    val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD');

    val.number = 0;
    val.totalAmount = 0;

    selectedSkuList.map(item => {
      val.number += item.number;
      val.totalAmount += item.price * item.number * 100;
    })

    val.totalAmount && (val.totalAmount = val.totalAmount.toFixed(0))

    let list = [];
    selectedSkuList.map(item => {
      list.push({
        prodId: item.prod_id,
        prodName: item.prod_name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        skuId: item.id,
        skuName: item.properties,
        unitName: item.unit_name,
        number: item.number,
        price: item.price * 100,
        amount: item.amount * 100,
        comment: item.comment,
      })
    })
    val.inOutDetailList = list;

    request({url: '/api/inout/', method: 'POST', data: val})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          modalClose(false);
        } else {
          message.error(res.msg);
        }
      })
  }

  const modalCancel = () => {
    modalClose(false);
  }

  let onOtherModalShow = (setType) => {
    setType(true);
  }

  // 已选择的sku
  const onSelectedSkuList = (list) => {
    let selectedList = [...selectedSkuList];
    // 数量设置默认值
    list.map(item => {
      item.number = item.number ? item.number : 1;
      item.price = item.cost_price / 100;
      item.amount = item.price * item.number;
    })
    let newList = selectedList.concat(list);
    newList.map((item, index) => {
      item.key = index;
    })
    setSelectedSkuList(newList);
  }

  // 已选择的供应商
  const onSelectedSupplier = (item) => {
    setSelectedSupplier(item);
    myForm && myForm.props.form.setFieldsValue({
      organName: item.name
    })
  }

  let onInputNumChange = (index, type, val) => {
    let list = [...selectedSkuList];
    list.map((item, i) => {
      if (i == index) {
        if (type == 'price') {
          // val = val < 1 ? 1 : val;
          item.amount = item.number * val;
        }
        if (type == 'number') {
          // 数量小于1时默认赋值为1
          item.amount = item.price * (val || 1) || 0;
        }

        item[type] = val;
      }
    })
    setSelectedSkuList(list);
  }

  let onInputChange = (index, type, e) => {
    let list = [...selectedSkuList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = e.target.value;
      }
    })
    setSelectedSkuList(list);
  }

  const onDeleteSku = (index) => {
    let list = [...selectedSkuList];
    list.splice(index, 1);
    setSelectedSkuList(list);

    let allCaigouFee = myForm.props.form.getFieldValue('gouhuoFee');
    if (allCaigouFee) {
      myForm && myForm.props.form.setFieldsValue({
        caigouFee: undefined
      })
    }
  }

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19,
  };

  let modalColumns = [
    {
      title: '商品',
      dataIndex: 'prod_name',
      align: 'center',
      width: 120,
      render: (text, record) => (
        text || record.prodName
      )
    },
    {
      title: '商品类别',
      dataIndex: 'category_name',
      align: 'center',
      width: 120,
      render: (text, record) => (
        text || record.categoryName
      )
    },
    {
      title: '规格型号',
      dataIndex: 'properties',
      align: 'center',
      width: 120,
      render: (text, record) => (
        text || record.skuName
      )
    },
    {
      title: '单位',
      dataIndex: 'unit_name',
      align: 'center',
      width: 100,
      render: (text, record) => (
        text || record.unitName
      )
    },
    // { title: '库存', dataIndex: 'stores', align: 'center', width: 100 },
    {
      title: <><span style={{ color: 'red' }}>*</span>数量</>,
      dataIndex: 'number',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <InputNumber value={text || 1} min={0} onChange={onInputNumChange.bind(this, index, 'number')} />
      )
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>{type == 1 ? '入库单价' : '出库单位成本'}</>,
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'price')} disabled={type == 2} />
      )
    },
    {
      title: type == 1 ? '入库金额' : '出库成本',
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        text.toFixed(2)
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index, 'comment')} />
      )
    },
    {
      title: '操作',
      dataIndex: 'key',
      align: 'center',
      width: 100,
      fixed: 'right',
      render: (text, record, index) => (
        <a style={{ display: 'inline-block', color: 'red', height: '35px', lineHeight: '35px' }} onClick={onDeleteSku.bind(this, index)}>删除</a>
      )
    }
  ];

  let modalItems = [
    {
      type: 'select',
      label: '供应商',
      paramName: 'organName',
      rules: [{ ...config.reg.required }],
      disabled: true,
      span: 9,
      labelCol: 8,
      wrapperCol: 16,
    },
    {
      type: 'blank',
      label: '',
      content: <div style={{ marginTop: '-12px' }}>
        <Button onClick={onOtherModalShow.bind(this, setSupplierModalShow)}>选择</Button>
      </div>,
      span: 3,
    },
    {
      type: 'datePicker',
      label: '单据日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: moment(),
      ...colConfig
    }, {
      type: 'select',
      label: '业务类型',
      paramName: 'serviceType',
      itemProps: {
        options: [
          { value: 1, label: '盘亏' },
          { value: 2, label: '盘盈' },
          { value: 3, label: '样品' },
          { value: 4, label: '报废' },
          { value: 5, label: '其他' },
        ]
      },
      initialValue: type == 1 ? 2 : 1,
      disabled: true,
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 15px 20px' }}>
        <Button onClick={onOtherModalShow.bind(this, setSkuListModalShow)}>+ 选择</Button><p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData(selectedSkuList, true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    },
  ];
  return (
    <div>
      <FormModal
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={modalTitle}
        disabled={false}
        disabledType='readOnly'
        footerShow={true}
        onModalSave={onModalSave}
        onCancel={modalCancel}
      />
      {
        skuListModalShow &&
        <SkuListModal
          modalShow={skuListModalShow}
          modalClose={setSkuListModalShow}
          onSelectedSkuList={onSelectedSkuList}
        />
      }
      {
        supplierModalShow &&
        <SupplierModal
          modalShow={supplierModalShow}
          modalClose={setSupplierModalShow}
          onSelectedSupplier={onSelectedSupplier}
        />
      }
    </div>
  );
}

export default ReceiptsModal;
