/**
 * 更新订单状态
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import FormModal from '../../components/common/FormModal';
import useQiniuToken from '../MyHooks/useQiniuToken';

let myForm;
const OrderUpdateModal = (props) => {
  let { modalShow, record, onModalClose, onSearch, showType = 'all' } = props; // showType: onlyShowOdd 待收货只编辑快递单号

  let token = useQiniuToken();

  let [roleList, setRoleList] = useState([]);
  let [songhuoList, setSonghuoList] = useState([]);
  let [peihuoList, setPeihuoList] = useState([]);
  let [imgList, setImgList] = useState(() => {
    if(record.shippingsn) {
      return [{ url: record.shippingsn, uid: 0, index: 0, type: 'imgList' }]
    } else {
      return [];
    }
  });

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  useEffect(() => {
    request({url: '/api/role/list/', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setRoleList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    setTimeout(() => {
      myForm &&
      myForm.props.form.setFieldsValue({
        shipping_sn: imgList
      })
    })
  }, [imgList])

  useEffect(() => {
    if(roleList.length) {
      roleList.map(item => {
        if(item.name == 'peihuo') {
          getUserSelect(item.id, setPeihuoList);
        }
        if(item.name == 'songhuo') {
          getUserSelect(item.id, setSonghuoList);
        }
      })
    }
  }, [roleList])

  const getUserSelect = (id, setType) => {
    request({url: '/api/role/getRoleUsers/', method: 'GET', params: {page: 1, pageSize: 100000, roleId: id}})
      .then(res => {
        if(res && res.retcode == 0) {
          res.page.list.map(item => {
            item.value = item.id;
            item.label = item.nick_name;
          })
          setType(res.page.list);
        }
      })
  }

  const onModalSave = (val) => {
    if(showType == 'onlyShowOdd') {
      onUpdateOrder();
      return;
    }

    setModalBtnLoading(true);

    val.ids = JSON.stringify(record.odids);
    val.setrev = false;
    
    peihuoList.map(item => {
      if(item.value == val.peihuo_id) {
        val.peihuo_name = item.label;
      }
    })
    songhuoList.map(item => {
      if(item.value == val.songhuo_id) {
        val.songhuo_name = item.label;
      }
    })

    if (imgList[0]) {
      val.shipping_sn = imgList[0].url;
    } else {
      delete val.shipping_sn;
    }

    request({ url: '/api/order/srorder', method: 'POST', form: val })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          onSearch();
          onModalClose(false);
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  // 更新快递单号
  const onUpdateOrder = () => {
    setModalBtnLoading(true);
    let data = {
      ids: JSON.stringify(record.odids),
      shipping_sn: imgList[0] && imgList[0].url || '',
    };
    request({url: '/api/order/edit', method: 'POST', form: data})
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          onSearch();
          onModalClose(false);
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  const modalCancel = () => {
    onModalClose(false);
  }

  const onSuccess = (data) => {
    let newFileList = [...imgList];

    newFileList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type: 'imgList' };

    setImgList(newFileList);
  }

  const onRemove = (file) => {
    let newFileList = [...imgList];
    newFileList.splice(file.index, 1);
    setImgList(newFileList);
  }

  let colConfig = {
    span: 24,
    labelCol: 5,
    wrapperCol: 19,
  };

  let modalItems = [
    {
      type: 'imgUpload',
      label: '快递单号',
      paramName: 'shipping_sn',
      data: { token },
      uploadButtonShow: !imgList.length,
      // required: true,
      itemProps: {
        onSuccess: onSuccess,
        onRemove: onRemove,
      },
      ...colConfig
    }, 
    ...(
      showType == 'all' &&
      [{
        type: 'select',
        label: '配货员',
        paramName: 'peihuo_id',
        itemProps: {
          options: peihuoList
        },
        rules: [{ ...config.reg.required }],
        ...colConfig
      }, {
        type: 'select',
        label: '送货人',
        paramName: 'songhuo_id',
        itemProps: {
          options: songhuoList
        },
        rules: [{ ...config.reg.required }],
        ...colConfig
      }] || []
    ),
  ];
  return (
    <div>
      <FormModal
        visible={modalShow}
        width={550}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={'更新订单'}
        disabled={false}
        disabledType='readOnly'
        footerShow={true}
        onModalSave={onModalSave}
        onCancel={modalCancel}
      />
    </div>
  );
}

export default OrderUpdateModal;