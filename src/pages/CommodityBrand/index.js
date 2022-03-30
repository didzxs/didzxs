/**
 * 商品品牌
 */

import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import request from '../../utils/request';
import config from '../../config';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';
import useQiniuToken from '../MyHooks/useQiniuToken';

let myForm;
const CommodityBrand = () => {

  let token = useQiniuToken();

  let [searchParams, setSearchParams] = useState({});
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);
  let [detail, setDetail] = useState({});

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);
    request({url: '/api/brand/list', method: 'GET', params: searchParams})
      .then(res => {
        if(res && res.retcode == 0) {
          setTableData(res.data);
          setTableLoading(false);
        }
      })
  }

  const onSearchClick = (val) => {
    setSearchParams(val);
  }

  const onModalShow = (type, record) => {
    setModalVal(record);
    setModalTitle(type);
    setModalShow(true);
  }

  const onDelete = (id) => {
    request({url: `/api/brand/${id}`, method: 'DELETE'})
      .then(res => {
        if(res.retcode == 0) {
          message.success('删除成功！');
          onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  let [modalVal, setModalVal] = useState({});
  let [modalShow, setModalShow] = useState(false);
  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [modalTitle, setModalTitle] = useState();
  let [imgList, setImgList] = useState([]);

  // 获取详情
  const getDetail = (id) => {
    if(!id) return;
    request({url: `/api/brand/info/${id}`, method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);
          res.data.brandPic && setImgList([{url: res.data.brandPic, uid: 0, index: 0, type: 'imgList'}]);

          myForm.props.form.setFieldsValue({
            brandPic: res.data.brandPic && [{url: res.data.brandPic, uid: 0, index: 0, type: 'imgList'}]
          })
        }
      })
  }

  useEffect(() => {
    if(modalShow) {
      modalTitle == '新增' &&
      myForm.props.form.setFieldsValue({
        brandPic: []
      })

      modalShow && getDetail(modalVal.brandId);
    }
  }, [modalShow])
  
  const onModalSave = (val) => {
    setModalBtnLoading(true);

    let url = '/api/brand/add';
    if(modalTitle == '编辑') {
      url = '/api/brand/update';
      val.brandId = modalVal.brandId;
    }
    val.brandPic = val.brandPic && val.brandPic.length && val.brandPic[0].url || '';
    request({url, method: 'POST', form: val})
      .then(res => {
        if(res.retcode == 0) {
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
    if(type == 'modalShow') {
      setDetail({});
      setImgList([]);
    }
  }

  const onSuccess = (type, data) => {
    let newImgList = [...imgList];
    newImgList[0] = {url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type};
    
    myForm.props.form.setFieldsValue({
      brandPic: newImgList
    })
    
    setImgList(newImgList);
  }

  const onRemove = (file) => {
    let newImgList = [...imgList];
    newImgList.splice(file.index, 1);
    setImgList(newImgList);
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
        label: '品牌名称',
        paramName: 'brandName',
        rules: [{...config.reg.required}],
        initialValue: detail.brandName,
        ...colConfig
      }, {
        type: 'input',
        label: '品牌首字母',
        paramName: 'firstChar',
        rules: [{...config.reg.required}, {pattern: /^[A-Z]$/, message: '请输入大写首字母'}],
        initialValue: detail.firstChar,
        ...colConfig
      }, {
        type: 'textArea',
        label: '品牌简介',
        paramName: 'brief',
        rules: [{...config.reg.required}],
        initialValue: detail.brief,
        span: 24,
        labelCol: 3,
        wrapperCol: 21,
      }, {
        type: 'imgUpload',
        label: '品牌logo',
        paramName: 'brandPic',
        // required: true,
        data: {token},
        uploadButtonShow: !imgList.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'imgList'),
          onRemove: onRemove,
        },
        span: 24,
        labelCol: 3,
        wrapperCol: 21,
      },
    ];
    return (
      <FormModal
        className='commodity-brand-modal'
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

  let searchItems = [
    {
      type: 'input',
      label: '关键字查询',
      paramName: 'search'
    }, {
      type: 'input',
      label: '首字母搜索',
      paramName: 'firstChar',
      placeholder: '请输入大写首字母搜索'
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '品牌名称', dataIndex: 'brandName', align: 'center', width: 150 },
    { title: '品牌首字母', dataIndex: 'firstChar', align: 'center', width: 80 },
    {
      title: '品牌图片',
      dataIndex: 'brandPic',
      align: 'center',
      width: 200,
      render: (text) => (
        <img src={text} style={{maxWidth: '100%', height: '150px'}} />
      )
    },
    { title: '品牌简介', dataIndex: 'brief', align: 'center', width: 200 },
    {
      title: '操作',
      dataIndex: 'brandId',
      align: 'center',
      width: 80,
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
      <Filtrate items={searchItems} onSearch={onSearchClick}/>
      <Container
        heightAuto={true}
        addBtn={onModalShow.bind(this, "新增", {})}
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
        />
      </Container>

      { modalShow && renderModal() }
    </div>
  );
}

export default CommodityBrand;