/**
 * 我的购物车
 */

import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Input, message } from 'antd';
import request from '../../../utils/request';
import config from '../../../config';
import Header from '../Header';
import MyForm from '../../../components/common/WidgetForm/MyForm';
import MyTable from '../../../components/common/MyTable';
import MySteps from './MySteps';
import MyProviderContainer from '../component/MyProviderContainer';
import AddressModal from '../../Modal/AddressModal';
import PublicService from '../../../services/PublicService';
import styles from './index.less';
import useQiniuToken from '../../MyHooks/useQiniuToken';
import { router } from 'umi';

let myForm;
const MyShoppingCart = (props) => {
  let { location } = props;
  let token = useQiniuToken();

  let [shoppingCartList, setShoppingCartList] = useState([]);
  let [tableLoading, setTableLoading] = useState(false);

  let [selectedRowKeys, setSelectedRowKeys] = useState([]);
  let [selectedRows, setSelectedRows] = useState([]);

  let [checkedAll, setCheckedAll] = useState(false);

  let [number, setNumber] = useState(0);
  let [totalPrice, setTotalPrice] = useState(0);

  let [currentStep, setCurrentStep] = useState(parseInt(location.query.currentStep) || 0);

  let [selectedAddress, setSelectedAddress] = useState();
  let [payAccount, setPayAccount] = useState({});

  let [addressModalShow, setAddressModalShow] = useState(false);

  let [receiptStatus, setReceiptStatus] = useState();
  let [attachs, setAttachs] = useState([]); // 上传附件

  useEffect(() => {
    setTableLoading(true);
    request({ url: '/api/shopping-cart/info', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setShoppingCartList(res.data.items);
        } else {
          message.error(res.msg);
        }
        setTableLoading(false);
      });

    getDefaultAdress();
    getPayAccount();
    console.log('location', location);
    if (location.query.currentStep) {
      setCurrentStep(parseInt(location.query.currentStep));
    }
  }, []);

  useEffect(() => {
    if (shoppingCartList.length) {
      if (location.query.ocids) {
        let ocids = JSON.parse(location.query.ocids);
        let list = [];
        shoppingCartList.map(item => {
          if (ocids.indexOf(item.key) > -1) {
            list.push(item);
          }
        });
        setSelectedRows(list);

        setSelectedRowKeys(ocids);
      }
    }
  }, [shoppingCartList]);

  const getDefaultAdress = () => {
    request({ url: '/api/address/getdefault', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          if (res.data) {
            setSelectedAddress(res.data);
          }
        }
      });
  };

  const getPayAccount = () => {
    request({ url: '/api/payAccount/info', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setPayAccount(res.data || {});
        }
      });
  };

  useEffect(() => {
    let number = 0, totalPrice = 0;
    selectedRows.map(item => {
      number += item.number;
      // totalPrice += (parseInt(item.price) / 100) * item.number;
      totalPrice += (item.price.toFixed(0) / 100) * item.number;
    });
    totalPrice = totalPrice.toFixed(2) * 1;
    setNumber(number);
    setTotalPrice(totalPrice);
  }, [selectedRows]);

  // 上传附件成功
  let onSuccess = (type, data) => {
    console.log('onSuccess', type);
    let fileType = { attachs };
    let newFileList = [...fileType[type]];

    if (type == 'attachs') {
      newFileList[0] = { url: config.viewImgUrl + data.key, name: '文件', ...data, uid: 0, index: 0, type };

      myForm.props.form.setFieldsValue({
        [type]: newFileList
      });

      type == 'attachs' && setAttachs(newFileList);
    }
  };

  // 删除附件
  const onRemove = (type, setType, file) => {
    console.log('onRemove', type);
    let fileType = { attachs };
    let newFileList = [...fileType[type]];
    newFileList.splice(file.index, 1);
    setType(newFileList);
  };
  const onDelete = (record, index) => {
    let list = [...shoppingCartList];
    request({ url: '/api/shopping-cart/remove', method: 'POST', form: { key: record.key } })
      .then(res => {
        if (res && res.retcode == 0) {
          list.splice(index, 1);
          setShoppingCartList(list);
        } else {
          message.error(res.msg);
        }
      });
  };

  const onModalShow = (setType) => {
    setType(true);
  };

  const onNumInputChange = (record, index, e) => {
    let list = [...shoppingCartList];
    if (/^[0-9]\d*$/.test(e.target.value)) {
      list[index].number = e.target.value * 1;
      onNumsChange(record.key, e.target.value * 1);
    } else if (e.target.value == '') {
      list[index].number = 1;
      onNumsChange(record.key, 1);
    }
    setShoppingCartList(list);
  };

  const onNumChange = (type, record, index) => {
    let list = [...shoppingCartList];
    if (type == 'add') {
      list[index].number = list[index].number * 1 + 1;
      onNumsChange(record.key, list[index].number * 1);
    } else {
      list[index].number = list[index].number * 1 - 1;
      onNumsChange(record.key, list[index].number * 1);
    }
    setShoppingCartList(list);
  };

  const onNumsChange = (key, number) => {
    request({ url: '/api/shopping-cart/modifyNumber', method: 'POST', form: { key, number } })
      .then(res => {
        if (res && res.retcode == 0) {

        } else {
          message.error(res.msg);
        }
      });
  };

  const onCheckAll = (e) => {
    let checked = e.target.checked;

    let list = [], list1 = [];
    if (checked) {
      shoppingCartList.map(item => {
        list.push(item.key);
      });
      list1 = shoppingCartList;
    }

    setCheckedAll(checked);
    setSelectedRowKeys(list);
    setSelectedRows(list1);
  };

  const onSettleAccounts = () => {
    if (selectedRowKeys.length == 0) {
      return message.error('请选择要结算的商品！');
    }
    setCurrentStep(1);
  };

  const onAddressSelected = (list) => {
    setSelectedAddress(list);
  };

  // 提交订单
  const onSubmitOrder = () => {
    let { validateFields } = myForm.props.form;
    validateFields((errors, values) => {

      if (!errors) {
        if (!selectedAddress) {
          return message.error('请选择收货地址！');
        }

        values.shippingusername = selectedAddress.username;
        values.shippingmobile = selectedAddress.mobile;
        values.province = selectedAddress.provincename;
        values.city = selectedAddress.cityname;
        values.distinct = selectedAddress.distinctname;
        values.address = selectedAddress.detail;

        if (attachs[0]) {
          values.attachs = attachs[0].url;
        } else {
          delete values.attachs;
        }

        let keyList = [];
        selectedRows.map(item => {
          keyList.push(item.key);
        });
        values.keylist = JSON.stringify(keyList);

        values.frontTotal = (totalPrice * 100).toFixed(0);

        // 意向订单创建材料订单
        if (props.location && props.location.query.orderId) {
          values.potentialId = props.location.query.orderId;
        }

        request({ url: '/api/order/create', method: 'POST', form: values })
          .then(res => {
            if (res && res.retcode == 0) {
              message.success('提交成功！');
              setCurrentStep(2);
            } else {
              message.error(res.msg);
            }
          });
      }
    });
  };

  // 开票状态
  const onReceiptStatusChange = (val) => {
    setReceiptStatus(val);
  };

  useEffect(() => {
    let list = [...selectedRows];
    if (receiptStatus == -2) {
      list.map(item => {
        item.original_price = item.price;
        item.price = item.price * 0.9;
      });
    } else {
      list.map(item => {
        item.price = item.original_price || item.price;
      });
    }
    setSelectedRows(list);
  }, [receiptStatus]);

  const renderConfirmOrder = () => {
    let formList = [
      {
        type: 'select',
        label: '订单支付类型',
        paramName: 'payType',
        itemProps: {
          options: [
            { value: 1, label: '非帐期订单' },
            { value: 2, label: '帐期订单' }
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: 1,
        labelCol: 6,
        wrapperCol: 18
      }, {
        type: 'select',
        label: '订单商品类型',
        paramName: 'goodsType',
        itemProps: {
          options: [
            { value: 1, label: '材料订单' },
            { value: 2, label: '工程订单' }
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: 1,
        labelCol: 6,
        wrapperCol: 18
      }, {
        type: 'select',
        label: '订单区域类型',
        paramName: 'regionType',
        itemProps: {
          options: [
            { value: 1, label: '国内订单' },
            { value: 2, label: '外贸订单' }
          ]
        },
        rules: [{ ...config.reg.required }],
        initialValue: 1,
        labelCol: 6,
        wrapperCol: 18
      }, {
        type: 'select',
        label: '是否开票',
        paramName: 'receiptStatus',
        itemProps: {
          options: [
            { value: -1, label: '开票' },
            { value: -2, label: '不开票' }
          ],
          onChange: onReceiptStatusChange
        },
        rules: [{ ...config.reg.required }],
        labelCol: 6,
        wrapperCol: 18
      }, {
        type: 'textArea',
        label: '备注',
        paramName: 'comment',
        span: 24,
        labelCol: 3,
        wrapperCol: 21
      }, {
        type: 'input',
        label: '名称',
        paramName: 'printName',
        labelCol: 6,
        wrapperCol: 18
        // }, {
        //   type: 'fileUpload',
        //   label: '附件',
        //   paramName: 'attachs',
        //   data: { token },
        //   uploadButtonShow: !attachs.length,
        //   itemProps: {
        //     onSuccess: onSuccess.bind(this, 'attachs'),
        //     onRemove: onRemove.bind(this, 'attachs', setAttachs)
        //   },
        //   labelCol: 6,
        //   wrapperCol: 18
      }
    ];

    return <div className={styles['confirm-order']}>
      <div className={styles['address-btn']} onClick={onModalShow.bind(this, setAddressModalShow)}>
        <span>选择收货地址</span>
      </div>
      {
        selectedAddress ?
          <div className={styles['address']}>
            <span>{selectedAddress.username}</span>
            <span>{selectedAddress.mobile}</span>
            <span>{selectedAddress.provincename}</span>
            <span>{selectedAddress.cityname}</span>
            <span>{selectedAddress.distinctname}</span>
            <span>{selectedAddress.detail}</span>
          </div> :
          <div className={`${styles['address']} ${styles['address-hint']}`}>
            <span>请选择收货地址</span>
          </div>
      }

      <div className={styles['product-list-box']}>
        {selectedRows.length && <MyTable
          heightAuto={true}
          columns={columns}
          pagination={false}
          dataSource={PublicService.transformArrayData(selectedRows, true, true)}
          rowKey="key"
        />}
      </div>
      <div className={styles['form-box']}>
        <MyForm list={formList} wrappedComponentRef={ref => myForm = ref}/>
      </div>
      <div className={styles['submit-order-box']}>
        <div className={styles['text2']}>应付总额：￥{totalPrice}</div>
        <Button className={styles['submit-order-btn']} onClick={onSubmitOrder}>提交订单</Button>
      </div>
    </div>;
  };

  const renderPayAccount = () => {
    return <div className={styles['submit-order-box']}>
      <div className={styles['content']}>
        <div className={styles['title']}>转账银行信息</div>
        <div className={styles['account-info']}>
          <div className={styles['info']}>
            <div className={styles['label']}>户名：</div>
            <div className={styles['data']}>{payAccount.realName}</div>
          </div>
          <div className={styles['info']}>
            <div className={styles['label']}>银行账号：</div>
            <div className={styles['data']}>{payAccount.bankCard}</div>
          </div>
          <div className={styles['info']}>
            <div className={styles['label']}>开户银行：</div>
            <div className={styles['data']}>{payAccount.bank}</div>
          </div>
        </div>
        <div className={styles['title']}>收款码</div>
        <div className={styles['qrcode-box']}>
          <img src={payAccount.wechatQr}/>
          <img src={payAccount.alipayQr}/>
        </div>

        <div className={styles['hint']}>转账成功之后请将转账信息截图发给客服</div>
      </div>
    </div>;
  };

  let columns = [
    {
      title: '商品信息',
      dataIndex: 'pic',
      align: 'center',
      width: 260,
      render: (text, record) => (
        <div className={styles['product-info']}>
          <img src={text}/>
          <div className={styles['name']}>{record.prod_name}</div>
        </div>
      )
    },
    { title: '规格', dataIndex: 'sku_name', align: 'center', width: 100 },
    {
      title: '单价(元)',
      dataIndex: 'price',
      align: 'center',
      width: 100,
      render: (text) => {
        // return text ? `￥${parseInt(text) / 100}` : 0;
        return text ? `￥${text.toFixed(0) / 100}` : 0;
      }
    },
    {
      title: '数量',
      dataIndex: 'number',
      align: 'center',
      width: 150,
      render: (text, record, index) => (
        currentStep == 0 ?
          <>
            <Button className={styles['num-btn']} size="small" onClick={onNumChange.bind(this, 'minus', record, index)}
                    disabled={text <= 1}>-</Button>
            <Input
              size="small"
              value={text}
              onChange={onNumInputChange.bind(this, record, index)}
            />
            <Button className={styles['num-btn']} size="small"
                    onClick={onNumChange.bind(this, 'add', record, index)}>+</Button>
          </> :
          text
      )
    },
    {
      title: '小记(元)',
      dataIndex: 'total_price',
      align: 'center',
      width: 100,
      render: (text, record) => {
        // return <span style={{color: '#FC010A', fontWeight: 550}}>{record.price ? `￥${((parseInt(record.price) / 100) * record.number).toFixed(2)}` : 0}</span>;
        return <span style={{
          color: '#FC010A',
          fontWeight: 550
        }}>{record.price ? `￥${((record.price.toFixed(0) / 100) * record.number).toFixed(2)}` : 0}</span>;
      }
    },
    ...(
      currentStep == 0 &&
      [{
        title: '操作',
        dataIndex: 'id',
        align: 'center',
        width: 100,
        render: (text, record, index) => (
          <a onClick={onDelete.bind(this, record, index)}>删除</a>
        )
      }] || []
    )
  ];

  let rowSelection = {
    columnWidth: 50,
    selectedRowKeys: selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
      if (selectedRowKeys.length == shoppingCartList.length) {
        setCheckedAll(true);
      } else {
        setCheckedAll(false);
      }
    }
  };
  const onJump = (type) => {
    router.push({
      pathname: type,
    });
  };
  return (
    <MyProviderContainer>
      <div className={styles['container']}>
        <Header/>
        <div className={styles['header']}>
          <div className={styles['left']} onClick={onJump.bind(this, 'ShoppingMall', {})}>
            <img src={require('../../../assets/logo3.png')}/>
          </div>
          <div className={styles['right']}>
            <MySteps current={currentStep}/>
          </div>
        </div>
        {
          currentStep == 0 &&
          <>
            <div className={styles['product-list-box']}>
              <MyTable
                heightAuto={true}
                columns={columns}
                loading={tableLoading}
                pagination={false}
                rowSelection={rowSelection}
                dataSource={PublicService.transformArrayData(shoppingCartList, true, true)}
                rowKey="key"
              />
            </div>

            <div className={styles['selected-product-box']}>
              <div className={styles['left']}>
                <Checkbox onChange={onCheckAll} checked={checkedAll}>全选</Checkbox>
              </div>
              <div className={styles['right']}>
                <div className={styles['text1']}>共{number}件商品</div>
                <div className={styles['text2']}>总额：￥{totalPrice}</div>
                <Button className={styles['settle-accounts-btn']} onClick={onSettleAccounts}>去结算</Button>
              </div>
            </div>
          </>
        }
        {
          currentStep == 1 &&
          renderConfirmOrder()
        }
        {
          currentStep == 2 &&
          renderPayAccount()
        }

        {
          addressModalShow &&
          <AddressModal
            modalShow={addressModalShow}
            onSelected={onAddressSelected}
            modalClose={setAddressModalShow}
          />
        }
      </div>
    </MyProviderContainer>
  );
};

export default MyShoppingCart;
