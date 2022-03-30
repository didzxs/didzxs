/**
 * 更新订单状态-确认收货
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import FormModal from '../../components/common/FormModal';
import useQiniuToken from '../MyHooks/useQiniuToken';

let myForm;
const OrderUpdateModal = (props) => {
  let { modalShow, record, onModalClose, onSearch } = props;

  let token = useQiniuToken();

  let [roleList, setRoleList] = useState([]);
  let [songhuoList, setSonghuoList] = useState([]);
  let [peihuoList, setPeihuoList] = useState([]);
  let [imgList, setImgList] = useState([]);

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  useEffect(() => {
    request({ url: '/api/role/list/', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setRoleList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    if (roleList.length) {
      roleList.map(item => {
        if (item.name == 'peihuo') {
          getUserSelect(item.id, setPeihuoList);
        }
        if (item.name == 'songhuo') {
          getUserSelect(item.id, setSonghuoList);
        }
      })
    }
  }, [roleList])

  const getUserSelect = (id, setType) => {
    request({ url: '/api/role/getRoleUsers/', method: 'GET', params: { page: 1, pageSize: 100000, roleId: id } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            item.value = item.id;
            item.label = item.nick_name;
          })
          setType(res.page.list);
        }
      })
  }

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    val.ids = JSON.stringify(record.odids);
    val.setrev = true;

    if (imgList[0]) {
      val.rev_proof = imgList[0].url;
    } else {
      delete val.rev_proof;
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

  const modalCancel = () => {
    onModalClose(false);
  }

  const onSuccess = (data) => {
    let newFileList = [...imgList];

    newFileList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type: 'imgList' };

    myForm.props.form.setFieldsValue({
      rev_proof: newFileList
    })

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
      label: '收货凭证',
      paramName: 'rev_proof',
      data: { token },
      uploadButtonShow: !imgList.length,
      required: true,
      itemProps: {
        onSuccess: onSuccess,
        onRemove: onRemove,
      },
      ...colConfig
    },
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