/**
 * 工程订单
 */

import React, { useState } from 'react';
import { message } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import FormModal from '../../components/common/FormModal';
import useQiniuToken from '../MyHooks/useQiniuToken';

let myForm;
const GCDModal = (props) => {
  let { modalShow, modalTitle, record, onModalClose, onSearch } = props;

  let token = useQiniuToken();

  let [projContract, setProjContract] = useState([]);
  let [tuoguanContract, setTuoguanContract] = useState([]);
  let [imgList, setImgList] = useState([]);

  let [modalBtnLoading, setModalBtnLoading] = useState(false);

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    val.potentialId = record.id; // 意向订单id

    val.projFee && (val.projFee = val.projFee * 100);
    val.contractFee && (val.contractFee = val.contractFee * 100);

    if(projContract[0]) {
      val.projContract = projContract[0].url;
    } else {
      delete val.projContract;
    }
    if(tuoguanContract[0]) {
      val.tuoguanContract = tuoguanContract[0].url;
    } else {
      delete val.tuoguanContract;
    }

    let imgs = [];
    imgList.map(item => {
      imgs.push(item.url);
    })
    val.attachs = imgs.join(',');

    if(val.time && val.time.length) {
      val.startedAt = moment(val.time[0]).format('YYYY-MM-DD HH:mm:00');
      val.endedAt = moment(val.time[1]).format('YYYY-MM-DD HH:mm:59');
    }
    delete val.time;
    request({url: '/api/order/project/create', method: 'POST', form: val})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('创建成功');
          onModalClose(false);
          onSearch();
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  const modalCancel = () => {
    onModalClose(false);
  }

  const onSuccess = (type, data) => {
    let fileType = {projContract, tuoguanContract, imgList};
    let newFileList = [...fileType[type]];

    if(type == 'projContract' || type == 'tuoguanContract') {
      newFileList[0] = {url: config.viewImgUrl + data.key, name: '文件', ...data, uid: 0, index: 0, type};

      myForm.props.form.setFieldsValue({
        [type]: newFileList
      })

      type == 'projContract' && setProjContract(newFileList);
      type == 'tuoguanContract' && setTuoguanContract(newFileList);
    } else if(type == 'imgList') {
      newFileList.push({url: config.viewImgUrl + data.key, name: '文件', ...data, uid: newFileList.length, index: newFileList.length, type});

      newFileList.map((item, index) => {
        item.uid = index;
        item.index = index;
      })
    
      myForm.props.form.setFieldsValue({
        attachs: newFileList
      })
      
      setImgList(newFileList);
    }
  }

  const onRemove = (type, setType, file) => {
    let fileType = {projContract, tuoguanContract, imgList};
    let newFileList = [...fileType[type]];
    newFileList.splice(file.index, 1);
    setType(newFileList);
  }

  let colConfig = {
    labelCol: 5,
    wrapperCol: 19,
  };

  let modalItems = [
    {
      type: 'input',
      label: '项目名称',
      paramName: 'projName',
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'input',
      label: '联系人姓名',
      paramName: 'contactName',
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'input',
      label: '联系人电话',
      paramName: 'contactMobile',
      rules: [{ ...config.reg.required }, { ...config.reg.phone2 }, { ...config.reg.space }],
      ...colConfig
    }, {
      type: 'input',
      label: '项目地址',
      paramName: 'projAddress',
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'select',
      label: '项目类型',
      paramName: 'projCategory',
      itemProps: {
        options: [
          { value: 1, label: '维保' },
          { value: 2, label: '维修' },
          { value: 3, label: '检测评估' },
          { value: 4, label: '智慧消防' },
          { value: 5, label: '工程项目托管' },
          { value: 6, label: '维保勘查' },
          { value: 7, label: '工程勘察' },
          { value: 8, label: '排查' },
          { value: 9, label: '图纸设计' },
          { value: 10, label: '图审' },
          { value: 11, label: '报建' },
          { value: 12, label: '验收' },
          { value: 13, label: '标书' },
          { value: 14, label: '预结算流程' },
        ]
      },
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'number',
      label: '托管合同金额',
      paramName: 'projFee',
      rules: [{ ...config.reg.required }],
      itemProps: {
        formatter: value => `${value}元`
      },
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'number',
      label: '甲方合同金额',
      paramName: 'contractFee',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }, { ...config.reg.price }],
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'input',
      label: '项目工程量',
      paramName: 'projHeavy',
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'select',
      label: '是否开票',
      paramName: 'receiptStatus',
      itemProps: {
        options: [
          { value: -1, label: '开票' },
          { value: -2, label: '不开票' },
        ]
      },
      rules: [{ ...config.reg.required }],
      ...colConfig
    }, {
      type: 'blank',
      content: '',
      span: 24,
    }, {
      type: 'fileUpload',
      label: '甲方合同',
      paramName: 'projContract',
      data: {token},
      uploadButtonShow: !projContract.length,
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'projContract'),
        onRemove: onRemove.bind(this, 'projContract', setProjContract),
      },
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'fileUpload',
      label: '托管合同',
      paramName: 'tuoguanContract',
      data: {token},
      uploadButtonShow: !tuoguanContract.length,
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'tuoguanContract'),
        onRemove: onRemove.bind(this, 'tuoguanContract', setTuoguanContract),
      },
      labelCol: 6,
      wrapperCol: 18,
    }, {
      type: 'blank',
      content: <div style={{marginBottom: '15px'}}><span style={{color: 'red'}}>* </span>图纸、工程量清单、标书、招标文件等 :</div>,
      span: 24
    }, {
      type: 'blank',
      content: '',
      span: 3
    }, {
      type: 'fileUpload',
      label: '',
      paramName: 'attachs',
      data: {token},
      required: true,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'imgList'),
        onRemove: onRemove.bind(this, 'imgList', setImgList),
      },
      span: 21,
      wrapperCol: 24
    }, {
      type: 'textArea',
      label: '项目工程量备注',
      paramName: 'comment',
      rules: [{ ...config.reg.required }],
      span: 24,
      labelCol: 4,
      wrapperCol: 20,
    }, {
      type: 'rangePicker',
      label: '合同起止时间',
      paramName: 'time',
      itemProps: {
        showTime: {format: 'HH:mm'},
        format: 'YYYY-MM-DD HH:mm'
      },
      rules: [{ ...config.reg.required }],
      labelCol: 6,
      wrapperCol: 18,
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
    </div>
  );
}

export default GCDModal;