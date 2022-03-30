/**
 * 收款账户设置
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';
import useQiniuToken from '../MyHooks/useQiniuToken';

let myForm;
const AccountPayee = () => {

  let token = useQiniuToken();

  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);
  let [detail, setDetail] = useState({});

  useEffect(() => {
    onSearch();
  }, [])

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/payAccount/info', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          let list = [];
          if(res.data) {
            list.push(res.data);
          }
          setTableData(list);
          setTableLoading(false);
        }
      })
  }

  const onModalShow = (type, record) => {
    setModalTitle(type);
    setModalShow(true);
  }

  const onDelete = () => {
    request({ url: '/api/payAccount', method: 'DELETE' })
      .then(res => {
        if (res.retcode == 0) {
          message.success('删除成功！');
          onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  let [modalShow, setModalShow] = useState(false);
  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [modalTitle, setModalTitle] = useState();
  let [imgList, setImgList] = useState([]);
  let [imgList1, setImgList1] = useState([]);

  // 获取详情
  const getDetail = () => {
    request({ url: '/api/payAccount/info', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data = res.data || {}
          setDetail(res.data);
          res.data.wechatQr && setImgList([{ url: res.data.wechatQr, uid: 0, index: 0, type: 'imgList' }]);
          res.data.alipayQr && setImgList1([{ url: res.data.alipayQr, uid: 0, index: 0, type: 'imgList1' }]);

          myForm.props.form.setFieldsValue({
            wechatQr: res.data.wechatQr && [{ url: res.data.wechatQr, uid: 0, index: 0, type: 'imgList' }],
            alipayQr: res.data.alipayQr && [{ url: res.data.alipayQr, uid: 0, index: 0, type: 'imgList1' }]
          })
        }
      })
  }

  useEffect(() => {
    if (modalShow) {
      modalTitle == '新增' &&
        myForm.props.form.setFieldsValue({
          wechatQr: [],
          alipayQr: []
        })

      modalTitle == '编辑' && modalShow && getDetail();
    }
  }, [modalShow])

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    val.wechatQr = val.wechatQr[0].url;
    val.alipayQr = val.alipayQr[0].url;
    request({ url: '/api/payAccount', method: modalTitle == '新增' ? 'POST' : 'PUT', data: val })
      .then(res => {
        if (res.retcode == 0) {
          modalCancel(setModalShow, 'modalShow');
          onSearch();
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }
  const modalCancel = (setTypeCancel, type) => {
    setTypeCancel(false);
    if (type == 'modalShow') {
      setDetail({});
      setImgList([]);
      setImgList1([]);
    }
  }

  const onSuccess = (type, data) => {
    if(type == 'imgList') {
      let newImgList = [...imgList];
      newImgList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type };

      myForm.props.form.setFieldsValue({
        wechatQr: newImgList
      })

      setImgList(newImgList);
    } else {
      let newImgList = [...imgList1];
      newImgList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type };

      myForm.props.form.setFieldsValue({
        alipayQr: newImgList
      })

      setImgList1(newImgList);
    }
  }

  const onRemove = (type, file) => {
    let obj = {imgList: imgList, imgList1: imgList1}
    let setType = {imgList: setImgList, imgList1: setImgList1};
    let newImgList = [...obj[type]];
    newImgList.splice(file.index, 1);
    setType[type](newImgList);
  }

  const renderModal = () => {
    let disabled = modalTitle == '查看';
    let colConfig = {
      labelCol: 7,
      wrapperCol: 17,
    };

    let modalItems = [
      {
        type: 'input',
        label: '账户名称',
        paramName: 'realName',
        rules: [{ ...config.reg.required }],
        initialValue: detail.realName,
        ...colConfig
      }, {
        type: 'input',
        label: '银行卡号',
        paramName: 'bankCard',
        rules: [{ ...config.reg.required }],
        initialValue: detail.bankCard,
        ...colConfig
      }, {
        type: 'input',
        label: '所属银行',
        paramName: 'bank',
        rules: [{ ...config.reg.required }],
        initialValue: detail.bank,
        ...colConfig
      }, {
        type: 'blank',
        content: '',
        span: 24,
      }, {
        type: 'imgUpload',
        label: '微信收款码',
        paramName: 'wechatQr',
        required: true,
        data: { token },
        uploadButtonShow: !imgList.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'imgList'),
          onRemove: onRemove.bind(this, 'imgList'),
        },
        labelCol: 6,
        wrapperCol: 18,
      }, {
        type: 'imgUpload',
        label: '支付宝收款码',
        paramName: 'alipayQr',
        required: true,
        data: { token },
        uploadButtonShow: !imgList1.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'imgList1'),
          onRemove: onRemove.bind(this, 'imgList1'),
        },
        labelCol: 6,
        wrapperCol: 18,
      },
    ];
    return (
      <FormModal
        className='account-payee-modal'
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={modalTitle}
        disabled={disabled}
        footerShow={!disabled}
        onModalSave={onModalSave}
        onCancel={modalCancel.bind(this, setModalShow, 'modalShow')}
      />
    )
  }

  let columns = [
    { title: '收款人', dataIndex: 'realName', align: 'center', width: 120 },
    { title: '银行卡号', dataIndex: 'bankCard', align: 'center', width: 180 },
    { title: '开户银行', dataIndex: 'bank', align: 'center', width: 160 },
    {
      title: '微信收款码',
      dataIndex: 'wechatQr',
      align: 'center',
      width: 220,
      render: (text) => <img src={text} style={{maxWidth: '100%', height: '180px'}} />
    },
    {
      title: '支付宝收款码',
      dataIndex: 'alipayQr',
      align: 'center',
      width: 220,
      render: (text) => <img src={text} style={{maxWidth: '100%', height: '180px'}} />
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 120,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
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

  return (
    <div>
      <Container
        heightAuto={true}
        headerShow={!tableData.length}
        addBtn={onModalShow.bind(this, "新增", {})}
        addBtnText={'收款账户设置'}
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
        />
      </Container>

      {modalShow && renderModal()}
    </div>
  );
}

export default AccountPayee;