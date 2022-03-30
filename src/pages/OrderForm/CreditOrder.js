/**
 * 退货单
 */

import React, { useEffect, useState } from 'react';
import { Icon, Popconfirm, Divider, message, Button, InputNumber, Input } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import config from '../../config';
import request from '../../utils/request';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import SupplierModal from './SupplierModal';
import SkuListModal from './SkuListModal';
import Download from '../../utils/Download';
import Util from '../../utils/Util';
import Template from '../Template';

let f1, myForm;
const CreditOrder = (props) => {
  let userType = localStorage.getItem('userType');

  let [modalVal, setModalVal] = useState({});
  let [selectSupplier, setSelectSupplier] = useState({});
  let [selectedSkuList, setSelectedSkuList] = useState([]);

  let [detail, setDetail] = useState({});

  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [skuListModalShow, setSkuListModalShow] = useState(false);

  let [modalType, setModalType] = useState();

  useEffect(() => {
    let { location } = props;
    if(location.query.ghOrderId) {
      let isFirstJump = sessionStorage.getItem('toCreditOrder') == 1;
      if(isFirstJump) {
        getDetail(location.query.ghOrderId, 'fromOrderForm');
        onModalShow('新增', {});
        sessionStorage.setItem('toCreditOrder', 0);
      }
    }
  }, [])

  // 获取详情
  const getDetail = (id, type) => {
    if(!id) {
      return;
    }
    request({ url: `/api/caigou/info?id=${id}`, method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          // 如果是通过购货单生成退货单，只需获取购货单的基础信息
          if(type == 'fromOrderForm') {
            let data = {
              supplierId: res.data.supplierId,
              supplierName: res.data.supplierName,
              operatedAt: res.data.operatedAt,
              snRelate: res.data.snSelf,
              comment: res.data.comment,
            }
            setDetail(data);
          } else {
            setDetail(res.data);
          }
          res.data.caigouDetailList.map(item => {
            item.price = Util.toFixed2(item.price / 100);
            item.gouhuoFee = Util.toFixed2(item.gouhuoFee / 100);
          })
          setSelectedSkuList(res.data.caigouDetailList);
        }
      })
  }

  // 删除
  const onDelete = (id) => {
    request({ url: `/api/caigou/${id}`, method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    getDetail(record.id);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const getModalType = (type) => {
    setModalType(type);
    setDetail({});
    setSelectSupplier({});
    setSelectedSkuList([]);
  }

  const handleSearchData = (val) => {
    if (val.time.length) {
      val.startTime = moment(val.time[0]).format('YYYY-MM-DD');
      val.endTime = moment(val.time[1]).format('YYYY-MM-DD');
    }
    delete val.time;
    return val;
  }

  // 处理表格排序数据
  const handleSorter = (sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { operated_at: 1, gouhuo_fee: 2 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  const handleTableData = (res) => {
    let total = {
      operated_at: '合计：',
      number: res.summary.numberTotal,
      gouhuo_fee: res.summary.gouhuoTotal,
      payed: res.summary.payed,
      num: '',
    };
    res.page.list.push(total);
  }

  let handleSaveData = (val) => {
    if (modalVal.id) {
      val.id = modalVal.id;
    }
    if (detail.snRelate) {
      val.snRelate = detail.snRelate;
    }

    val.type = 2;
    val.supplierId = selectSupplier.id || detail.supplierId;

    val.operatedAt && (val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD'));
    val.gouhuoFee && (val.gouhuoFee = Util.toFixed0(val.gouhuoFee * 100));
    val.caigouFee = 0; // 暂时写死

    let list = [];
    selectedSkuList.map(item => {
      list.push({
        price: (item.price * 100).toFixed(0),
        number: item.number,
        gouhuoFee: Util.toFixed0(item.gouhuoFee * 100),
        caigouFee: 0, // 暂时写死
        skuId: item.id || item.skuId,
        skuName: item.properties || item.skuName,
        comment: item.comment,
        prodId: item.prod_id || item.prodId,
        prodName: item.prod_name || item.prodName,
        categoryId: item.category_id || item.categoryId,
        categoryName: item.category_name || item.categoryName,
        unitName: item.unit_name || item.unitName
      })
    })
    let rules = { number: '数量', price: '购货单价' };
    for (let i = 0; i < list.length; i++) {
      for (let key in rules) {
        if (!list[i][key] && list[i][key] != 0) {
          message.error(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    val.caigouDetailList = list;

    return val;
  }

  // 审核/反审核
  const onAudit = (type, id) => {
    request({ url: `/api/caigou/check/${modalVal.id || id}`, method: 'PUT', params: { type } })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          getDetail(modalVal.id);
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  let onOtherModalShow = (setType) => {
    setType(true);
  }

  useEffect(() => {
    let number = 0, price = 0;
    selectedSkuList.map(item => {
      let itemNum = item.number || 1;
      number += itemNum;
      price += item.gouhuoFee * 1 || 0;
    })
    setTimeout(() => {
      myForm && myForm.props.form.setFieldsValue({
        number,
        gouhuoFee: Util.toFixed2(price),
      })
    })
  }, [selectedSkuList])

  // 已选择的sku
  const onSelectedSkuList = (list) => {
    let selectedList = [...selectedSkuList];
    // 数量设置默认值
    list.map(item => {
      item.number = item.number ? item.number : 1;
      item.price = (item.cost_price / 100).toFixed(2);
      item.gouhuoFee = item.number * item.price;
    })
    let newList = selectedList.concat(list);
    newList.map((item, index) => {
      item.key = index;
    })
    setSelectedSkuList(newList);
  }

  // 已选择的供应商
  const onSelectedSupplier = (item) => {
    setSelectSupplier(item);
    myForm && myForm.props.form.setFieldsValue({
      supplierName: item.name
    })
  }

  let onInputNumChange = (index, type, val) => {
    if((type == 'price' || type == 'gouhuoFee') && !(/(^([-]?)[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^([-]?)(0){1}$)|(^([-]?)[0-9]\.[0-9]([0-9])?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('最多保留2位小数！');
    }

    let list = [...selectedSkuList];
    list.map((item, i) => {
      if (i == index) {
        if (type == 'price') {
          // val = val < 1 ? 1 : val;
          item.gouhuoFee = Util.toFixed2(item.number * val);
        }
        if (type == 'number') {
          // 数量小于1时默认赋值为1
          item.gouhuoFee = Util.toFixed2(item.price * (val || 1)) || 0;
        }
        if(type == 'gouhuoFee') {
          item.price = Util.toFixed2(val / item.number);
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
  }

  const onPrint = (record) => {
    Download('/api/caigou/printCaigou', {
      id: record.id
    }, 'GET', '', 'view')
  }

  let searchItems = [
    {
      type: 'select',
      label: '支付状态',
      paramName: 'payStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未退款' },
          { value: 1, label: '部分退款' },
          { value: 2, label: '全部退款' },
        ]
      },
    }, {
      type: 'rangePicker',
      label: '单据时间',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-01-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'input',
      label: '关键字查询',
      paramName: 'search'
    }, {
      type: 'select',
      label: '审核状态',
      paramName: 'checkStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '已审核' },
          { value: 0, label: '未审核' },
        ]
      },
    }, {
      type: 'select',
      label: '开票状态',
      paramName: 'receiptStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未开票' },
          { value: 1, label: '部分开票' },
          { value: 2, label: '全部开票' },
        ]
      },
    }
  ];

  let columns = [
    {
      title: '单据日期',
      dataIndex: 'operated_at',
      align: 'center',
      width: 140,
      fixed: 'left',
      sorter: true,
    },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 120, fixed: 'left' },
    { title: '供应商', dataIndex: 'supplier_name', align: 'center', width: 150, fixed: 'left' },
    { title: '原购货单号', dataIndex: 'sn_relate', align: 'center', width: 150 },
    { title: '数量', dataIndex: 'number', align: 'center', width: 120 },
    {
      title: '购货金额',
      dataIndex: 'gouhuo_fee',
      align: 'center',
      width: 120,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '已退款',
      dataIndex: 'payed',
      align: 'center',
      width: 120,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    {
      title: '退款状态',
      dataIndex: 'pay_status',
      align: 'center',
      width: 120,
      render: (text) => (
        { 0: '未退款', 1: '部分退款', 2: '已退款' }[text]
      )
    },
    { title: '制单人', dataIndex: 'creator_name', align: 'center', width: 120 },
    { title: '审核人', dataIndex: 'checker_name', align: 'center', width: 120 },
    { title: '备注', dataIndex: 'comment', align: 'center', width: 220 },
    { title: '打印次数', dataIndex: 'comment1', align: 'center', width: 120 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 160,
      fixed: 'right',
      render: (text, record) => (
        record.id &&
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          <Divider type='vertical' />
          <a onClick={onPrint.bind(this, record)}>打印</a>
          {
            (userType == 'cangku' || userType == 'cangku_qt') && record.check_status == 0 &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否审核改数据?"
                onConfirm={onAudit.bind(this, 1, record.id)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>审核</a>
              </Popconfirm>
            </>
          }
          {
            userType == 'caiwu' && record.check_status == 1 &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否审核改数据?"
                onConfirm={onAudit.bind(this, 0, record.id)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>反审核</a>
              </Popconfirm>
            </>
          }
          <Divider type='vertical'/>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, text)}
            icon={<Icon type="question-circle-o" style={{color: 'red'}}/>}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    },
  ];

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18,
  };

  // 已审核、非采购人员不可编辑
  let disabled = (modalType != '新增' && !!detail.checkStatus) || userType != 'caigou';
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
        <InputNumber value={text || 1} min={0} onChange={onInputNumChange.bind(this, index, 'number')} disabled={disabled} />
      )
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>购货单价</>,
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'price')} disabled={disabled} />
      )
    },
    {
      title: '购货金额',
      dataIndex: 'gouhuoFee',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'gouhuoFee')} disabled={disabled} />
      )
    },
    {
      title: '备注',
      dataIndex: 'comment',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index, 'comment')} disabled={disabled} />
      )
    },
    ...(
      !disabled &&
      [{
        title: '操作',
        dataIndex: 'key',
        align: 'center',
        width: 100,
        fixed: 'right',
        render: (text, record, index) => (
          <a style={{ display: 'inline-block', color: 'red', height: '35px', lineHeight: '35px' }} onClick={onDeleteSku.bind(this, index)}>删除</a>
        )
      }] || []
    ),
  ];

  let modalItems = [
    {
      type: 'input',
      label: '供应商',
      paramName: 'supplierName',
      rules: [{ ...config.reg.required }],
      initialValue: detail.supplierName,
      disabled: true,
      ...(
        modalType == '新增' ? {
          span: 9,
          labelCol: 8,
          wrapperCol: 16,
        } : colConfig
      ),
    },
    ...(
      modalType == '新增' &&
      [{
        type: 'blank',
        label: '',
        content: <div style={{ marginTop: '-12px' }}>
          <Button onClick={onOtherModalShow.bind(this, setSupplierModalShow)}>选择</Button>
        </div>,
        span: 3,
      }] || []
    ),
    {
      type: 'datePicker',
      label: '单据日期',
      paramName: 'operatedAt',
      rules: [{ ...config.reg.required }],
      initialValue: detail.operatedAt && moment(detail.operatedAt) || moment(),
      disabled,
      ...colConfig
    }, {
      type: 'textArea',
      label: '备注',
      paramName: 'comment',
      initialValue: detail.comment,
      disabled,
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'blank',
      content: <div style={{ position: 'relative' }}>
        {detail.checkStatus && <img src={require('../../assets/audit.png')} style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-40%)' }} /> || ''}
      </div>,
      span: 24,
    }, {
      type: 'blank',
      content: <div style={{ padding: '10px 0 15px 20px' }}>
        <Button onClick={onOtherModalShow.bind(this, setSkuListModalShow)} disabled={disabled}>+ 选择</Button><p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData(selectedSkuList, true, true)}
          scroll={{ x: 'max-content' }}
        />
      </div>,
      span: 24,
    }, {
      type: 'number',
      label: '数量',
      paramName: 'number',
      initialValue: detail.number,
      disabled: true,
      ...colConfig
    }, {
      type: 'number',
      label: '购货费用',
      paramName: 'gouhuoFee',
      itemProps: {
        formatter: value => `${value}元`
      },
      initialValue: detail.gouhuoFee ? detail.gouhuoFee / 100 : detail.gouhuoFee,
      disabled: true,
      ...colConfig
    },
  ];

  // 弹窗按钮
  let modalBtnList = [];
  if ((userType == 'cangku' || userType == 'cangku_qt') && detail.checkStatus == 0) { // 仓库对未审核的单子进行审核
    modalBtnList = [{ title: '审核', onClick: onAudit.bind(this, 1), type: 'primary' }];
  } else if (userType == 'caiwu' && detail.checkStatus == 1) { // 财务对审核过的单子进行反审核
    modalBtnList = [{ title: '反审核', onClick: onAudit.bind(this, 2), type: 'primary' }];
  }

  let modalProps = {};
  if (userType != 'caigou' && modalType == '编辑' || detail.checkStatus) {
    modalProps.saveBtn = false;
  }

  let basicParams = {
    type: 2, // 1:购货单  2:退货单
    startTime: moment().format('YYYY-01-01'),
    endTime: moment().format('YYYY-MM-DD'),
  }

  let params = {
    searchItems,
    columns,
    modalItems,
    headerShow: userType == 'caigou',
    addBtnShow: userType == 'caigou',
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    tableProps: {
      scroll: { x: 'max-content' }
    },
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    handleSearchData: handleSearchData,
    handleSaveData: handleSaveData,
    handleSorter: handleSorter,
    handleTableData,
    modalBtnList,
    modalProps,
    searchApi: { url: '/api/caigou/list', params: { ...basicParams } },
    addApi: { url: '/api/caigou/', method: 'POST' },
    editApi: { url: '/api/caigou/', method: 'PUT' },
    exportApi: { url: '/api/caigou/export', params: { ...basicParams } }
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
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

export default CreditOrder;
