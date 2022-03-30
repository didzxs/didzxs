/**
 * 其他出入库单据
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm, Button, InputNumber, Input } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import SupplierModal from '../Modal/SupplierModal';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import SkuListModal from '../OrderForm/SkuListModal';
import Download from '../../utils/Download';
import Template from '../Template';

let myForm, f1;
const InventoryVerification = (props) => {
  let { location } = props;
  let userType = localStorage.getItem('userType');

  let [memberList, setMemberList] = useState([]);
  let [supplierModalShow, setSupplierModalShow] = useState(false);
  let [selectedSupplier, setSelectedSupplier] = useState({});

  let [selectedSkuList, setSelectedSkuList] = useState([]);
  let [skuListModalShow, setSkuListModalShow] = useState(false);

  let [modalVal, setModalVal] = useState({});
  let [modalType, setModalType] = useState();
  let [detail, setDetail] = useState({});

  useEffect(() => {
    request({url: '/api/user/getMembers/', method: 'GET', params: {page: 1, pageSize: 100000}})
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

  const getDetail = (id) => {
    request({ url: `/api/inout/info?id=${id}`, method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setDetail(res.data);

          let list = [];
          res.data.inOutDetailList.map(item => {
            list.push({
              ...item,
              price: item.price / 100,
              amount: item.amount / 100,
              prod_id: item.prodId,
              prod_name: item.prodName,
              category_id: item.categoryId,
              category_name: item.categoryName,
              id: item.skuId,
              properties: item.skuName,
              unit_name: item.unitName,
            })
          })
          setSelectedSkuList(list);
        }
      })
  }

  const onDelete = (id) => {
    request({ url: `/api/inout/${id}`, method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  // 审核/反审核
  const onAudit = (type, id) => {
    request({url: `/api/inout/check/${modalVal.id || id}`, method: 'PUT', params: {type}})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          getDetail(modalVal.id);
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    f1.onModalShow && f1.onModalShow(type, record);
    getDetail(record.id);
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const getModalType = (type) => {
    setModalType(type);
  }

  const handleSearchData = (val) => {
    if(val.time.length) {
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
      val.sort = { operated_at: 1, sn_self: 2, number: 3, total_amount: 4 }[sorter.columnKey];
      val.orderBy = { ascend: 1, descend: 2 }[sorter.order];
    }
    return val;
  }

  const handleTableData = (res) => {
    let total = {
      operated_at: '合计：',
      number: res.summary.numberTotal,
      total_amount: res.summary.AmountTotal,
    };
    res.page.list.push(total);
  }

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setSelectedSupplier({});
    setSelectedSkuList([]);
  }

  let handleSaveData = (val) => {
    let rules = {number: '数量', price: '入库单价'};
    for(let i = 0; i < selectedSkuList.length; i++) {
      for(let key in rules) {
        if(!selectedSkuList[i][key] && selectedSkuList[i][key] != 0) {
          message.warning(`请填写${rules[key]}`);
          return false;
        }
      }
    }

    if (modalVal.id) {
      val.id = modalVal.id;
    }

    val.type = location.pathname.indexOf('Out') > -1 ? 2 : 1; // 1: 其他入库单 2: 其他出库单
    if(location.pathname.indexOf('Out') > -1) {
      memberList.map(item => {
        if(item.value == val.organId) {
          val.organName = item.label;
        }
      })
    } else {
      val.organId = selectedSupplier.id || detail.organId;
    }
    val.operatedAt = moment(val.operatedAt).format('YYYY-MM-DD');

    val.number = 0;
    val.totalAmount = 0;

    selectedSkuList.map(item => {
      val.number += item.number;
      val.totalAmount += item.price * item.number * 100;
    })
    val.totalAmount && (val.totalAmount = val.totalAmount.toFixed(0));

    let list = [];
    selectedSkuList.map(item => {
      list.push({
        prodId: item.prod_id,
        prodName: item.prod_name,
        categoryId: item.category_id,
        categoryName: item.category_name,
        skuId: item.id,
        skuSn: item.sku_sn,
        skuName: item.properties,
        unitName: item.unit_name,
        number: item.number,
        price: (item.price * 100).toFixed(0),
        amount: (item.amount * 100).toFixed(0),
        comment: item.comment,
      })
    })
    val.inOutDetailList = list;

    return val;
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
      if(i == index) {
        if(type == 'price') {
          // val = val < 1 ? 1 : val;
          item.amount = item.number * val;
        }
        if(type == 'number') {
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
      if(i == index) {
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
    if(allCaigouFee) {
      myForm && myForm.props.form.setFieldsValue({
        caigouFee: undefined
      })
    }
  }

  const onPrint = (record) => {
    Download('/api/inout/print', {
      id: record.id
    }, 'GET', '', 'view')
  }

  let searchItems = [
    {
      type: 'rangePicker',
      label: '单据日期',
      paramName: 'time',
      initialValue: [moment(moment().format('YYYY-MM-01')), moment(moment().format('YYYY-MM-DD'))]
    }, {
      type: 'select',
      label: '审核状态',
      paramName: 'checkStatus',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '未审核' },
          { value: 1, label: '已审核' },
        ]
      }
    }, {
      type: 'input',
      label: '关键字',
      paramName: 'search',
      placeholder: '请输入单据号或供应商名称或备注'
    }, {
      type: 'select',
      label: '业务类型',
      paramName: 'serviceType',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 1, label: '盘亏' },
          { value: 2, label: '盘盈' },
          { value: 3, label: '样品' },
          { value: 4, label: '报废' },
          { value: 5, label: '其他' },
        ]
      }
    }
  ];

  let columns = [
    { title: '单据日期', dataIndex: 'operated_at', align: 'center', width: 120, sorter: true },
    { title: '单据编号', dataIndex: 'sn_self', align: 'center', width: 120, sorter: true },
    {
      title: '业务类别',
      dataIndex: 'service_type',
      align: 'center',
      width: 100,
      render: (text) => (
        {1: '盘亏', 2: '盘盈', 3: '样品', 4: '报废', 5: '其他'}[text]
      )
    },
    ...(
      location.pathname.indexOf('Out') > -1 &&
      [{ title: '客户', dataIndex: 'organ_name', align: 'center', width: 100 }] ||
      [{ title: '供应商', dataIndex: 'organ_name', align: 'center', width: 100 }]
    ),
    { title: '数量', dataIndex: 'number', align: 'center', width: 100, sorter: true },
    {
      title: '金额',
      dataIndex: 'total_amount',
      align: 'center',
      width: 100,
      sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    { title: '制单人', dataIndex: 'creator_name', align: 'center', width: 100 },
    { title: '审核人', dataIndex: 'checker_name', align: 'center', width: 100 },
    { title: '单据备注', dataIndex: 'comment', align: 'center', width: 200 },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 140,
      render: (text, record) => (
        text &&
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
          <Divider type='vertical' />
          <a onClick={onPrint.bind(this, record)}>打印</a>
          {
            userType == 'caiwu' &&
            <>
              <Divider type='vertical' />
              <Popconfirm
                title="是否审核改数据?"
                onConfirm={onAudit.bind(this, record.check_status == 1 ? 0 : 1, record.id)}
                icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}>
                <a>{record.check_status == 1 ? '反审核' : '审核'}</a>
              </Popconfirm>
            </>
          }
          <Divider type='vertical' />
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

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19,
  };

  // 已审核、非仓库人员不可编辑
  let disabled = (modalType != '新增' && !!detail.checkStatus) || userType.indexOf('cangku') < 0;
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
      title: '商品编号',
      dataIndex: 'sku_sn',
      align: 'center',
      width: 120,
      render: (text, record) => (
        text || record.skuSn
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
      title: <><span style={{color: 'red'}}>*</span>数量</>,
      dataIndex: 'number',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <InputNumber value={text || 1} min={0} onChange={onInputNumChange.bind(this, index, 'number')} disabled={disabled} />
      )
    },
    {
      title: <><span style={{color: 'red'}}>*</span>{location.pathname.indexOf('Out') > -1 ? '出库单位成本' : '入库单价'}</>,
      dataIndex: 'price',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'price')} disabled={disabled || location.pathname.indexOf('Out') > -1} /> // 出库不能修改价格
      )
    },
    {
      title: location.pathname.indexOf('Out') > -1 ? '出库成本' : '入库金额',
      dataIndex: 'amount',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        text
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
          <a style={{display: 'inline-block', color: 'red', height: '35px', lineHeight: '35px'}} onClick={onDeleteSku.bind(this, index)}>删除</a>
        )
      }] || []
    ),
  ];

  let modalItems = [
    ...(
      location.pathname.indexOf('Out') > -1 &&
      [
        {
          type: 'select',
          label: '会员',
          paramName: 'organId',
          itemProps: {
            options: memberList,
            showSearch: true,
          },
          initialValue: detail.organId,
          disabled,
          labelCol: 6,
          wrapperCol: 18,
        }
      ] || [
        {
          type: 'select',
          label: '供应商',
          paramName: 'organName',
          rules: [{ ...config.reg.required }],
          initialValue: detail.organName,
          disabled: true,
          ...(
            (modalType !== '查看' && !disabled) ? {
              span: 9,
              labelCol: 8,
              wrapperCol: 16,
            } : colConfig
          ),
        },
        ...(
          (modalType !== '查看' && !disabled) &&
          [{
            type: 'blank',
            label: '',
            content: <div style={{marginTop: '-12px'}}>
              <Button onClick={onOtherModalShow.bind(this, setSupplierModalShow)}>选择</Button>
            </div>,
            span: 3,
          }] || []
        ),
      ]
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
      rules: [{ ...config.reg.required }],
      initialValue: detail.serviceType,
      disabled,
      labelCol: 6,
      wrapperCol: 18,
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
      content: <div style={{position: 'relative'}}>
        { detail.checkStatus && <img src={require('../../assets/audit.png')} style={{position: 'absolute', top: '50%', right: 0, transform: 'translateY(-80%)'}} /> || '' }
      </div>,
      span: 24,
    }, {
      type: 'blank',
      content: <div style={{padding: '10px 0 15px 20px'}}>
        {!disabled && <Button onClick={onOtherModalShow.bind(this, setSkuListModalShow)}>+ 选择</Button>}<p></p>
        <MyTable
          heightAuto={true}
          columns={modalColumns}
          pagination={false}
          dataSource={PublicService.transformArrayData(selectedSkuList, true, true)}
          scroll={{x: 'max-content'}}
        />
      </div>,
      span: 24,
    },
  ];

  // 弹窗按钮
  let modalBtnList = [];
  if(userType == 'caiwu') {
    if (detail.checkStatus == 0) {
      modalBtnList = [{ title: '审核', onClick: onAudit.bind(this, 1), type: 'primary' }];
    } else if (detail.checkStatus == 1) {
      modalBtnList = [{ title: '反审核', onClick: onAudit.bind(this, 2), type: 'primary' }];
    }
  }

  let modalProps = {};
  if(userType.indexOf('cangku') < 0 || detail.checkStatus) {
    modalProps.saveBtn = false;
  }

  let basicParams = {
    type: location.pathname.indexOf('Out') > -1 ? 2 : 1,
    startTime: moment().format('YYYY-MM-01'),
    endTime: moment().format('YYYY-MM-DD'),
  };

  let params = {
    searchItems,
    addBtnShow: userType.indexOf('cangku') > -1,
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: false,
    modalBtnList,
    modalProps,
    handleSearchData,
    handleSorter,
    handleTableData,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel: modalCancel,
    searchApi: { url: '/api/inout/list', params: basicParams },
    addApi: { url: '/api/inout/', method: 'POST' },
    editApi: { url: '/api/inout/', method: 'PUT' },
    exportApi: { url: '/api/inout/export', params: basicParams },
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

export default InventoryVerification;
