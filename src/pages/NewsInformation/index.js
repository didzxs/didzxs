/**
 * 新闻资讯
 */
import React, { useEffect, useState } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import useQiniuToken from '../MyHooks/useQiniuToken';
import WangEditor from '../../components/WangEditor';
import Template from '../Template';

let myForm, f1;
const NewsInformation = () => {
  let token = useQiniuToken();

  let [modalVal, setModalVal] = useState({});
  let [detail, setDetail] = useState({});
  let [searchType, setSearchType] = useState(1);

  let [imgList, setImgList] = useState([]);
  let [editorContent, setEditorContent] = useState();

  const getDetail = (id) => {
    request({url: '/api/open/newsInfo', method: 'GET', params: {id}})
      .then(res => {
        if(res && res.retcode == 0) {
          setDetail(res.data);
        }
      })
  }

  const onDelete = (id) => {
    request({url: '/api/news/delete', method: 'POST', form: {id}})
      .then(res => {
        if(res.retcode == 0) {
          message.success('删除成功！');
          f1.onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  useEffect(() => {
    if(modalVal.pic) {
      setImgList([{url: modalVal.pic, uid: 0, index: 0, type: 'imgList'}]);
      setTimeout(() => {
        modalVal.pic &&
        myForm.props.form.setFieldsValue({
          pic: [{url: modalVal.pic, uid: 0, index: 0, type: 'imgList'}]
        })
      })
    }
  }, [modalVal])

  const onModalShow = (type, record) => {
    setModalVal(record);
    getDetail(record.id);
    f1.onModalShow && f1.onModalShow(type, record);
  }

  const handleSearchData = (val) => {
    setSearchType(val.type);
    return val;
  }

  const getModalFormHanld = (form) => {
    myForm = form;
  }

  const modalCancel = () => {
    setModalVal({});
    setDetail({});
    setImgList([]);
  }

  let handleSaveData = (val) => {
    if(!editorContent) {
      message.warning('请填写页面内容！');
      return false;
    }
    if (modalVal.id) {
      val.id = modalVal.id;
    }
    imgList[0] && (val.pic = imgList[0].url);
    val.content = editorContent;

    return val;
  }

  const onSuccess = (type, data) => {
    let newImgList = [...imgList];
    newImgList[0] = {url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type};
    
    myForm.props.form.setFieldsValue({
      pic: newImgList
    })
    
    setImgList(newImgList);
  }

  const onRemove = (file) => {
    let newImgList = [...imgList];
    newImgList.splice(file.index, 1);
    setImgList(newImgList);
  }

  // 获取富文本编辑器内容
  const getEditorContent = (val) => {
    setEditorContent(val);
  }

  let searchItems = [
    {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '公司新闻' },
          { value: 2, label: '法律法规' },
          { value: 3, label: '安消资讯' },
        ]
      },
      initialValue: 1,
    }, {
      type: 'select',
      label: '是否置顶',
      paramName: 'for_top',
      itemProps: {
        options: [
          { value: 1, label: '置顶' },
          { value: 0, label: '不置顶' },
        ]
      },
      initialValue: 1
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 40 },
    { title: '标题', dataIndex: 'title', align: 'center', width: 100 },
    { title: '副标题', dataIndex: 'subtitle', align: 'center', width: 100 },
    {
      title: '创建时间',
      dataIndex: 'updated_at',
      align: 'center',
      width: 110,
      render: (text) => (
        moment(text).format('YYYY-MM-DD HH:mm')
      )
    },
    {
      title: '图片',
      dataIndex: 'pic',
      align: 'center',
      width: 140,
      render: (text) => (
        <img src={text} style={{maxWidth: '100%', height: '150px'}} />
      )
    },
    {
      title: '操作',
      dataIndex: 'id',
      align: 'center',
      width: 80,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, "编辑", record)}>编辑</a>
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

  let modalItems = [
    {
      type: 'input',
      label: '标题',
      paramName: 'title',
      rules: [{ ...config.reg.required }],
      initialValue: detail.title,
      ...colConfig
    }, {
      type: 'input',
      label: '副标题',
      paramName: 'subtitle',
      initialValue: detail.subtitle,
      ...colConfig
    }, {
      type: 'select',
      label: '类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '公司新闻' },
          { value: 2, label: '法律法规' },
          { value: 3, label: '安消资讯' },
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.type || searchType,
      ...colConfig
    }, {
      type: 'radio',
      label: '是否置顶',
      paramName: 'forTop',
      itemProps: {
        options: [
          { value: 1, label: '置顶' },
          { value: 0, label: '不置顶' },
        ]
      },
      initialValue: modalVal.for_top,
      ...colConfig
    }, {
      type: 'imgUpload',
      label: '缩略图',
      paramName: 'pic',
      data: {token},
      uploadButtonShow: !imgList.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'imgList'),
        onRemove: onRemove,
      },
      ...colConfig
    }, {
      type: 'blank',
      content: <div style={{marginBottom: '15px'}}>
        <div style={{padding: '0 0 10px 12px', color: '#333'}}><span style={{color: 'red'}}>*</span> 页面内容：</div>
        <WangEditor uploadToken={token} getEditorContent={getEditorContent} content={detail.content} height={300} />
      </div>,
      span: 24,
    }
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    editBtnShow: false,
    deleteBtnShow: false,
    exportBtnShow: false,
    rowSelectionShow: false,
    handleSaveData: handleSaveData,
    handleSearchData,
    getModalFormHanld: getModalFormHanld,
    modalCancel: modalCancel,
    searchApi: { url: '/api/open/getNews', params: { type: 1, for_top: 1 } },
    addApi: { url: '/api/news/add', method: 'POST', dataType: 'form' },
    editApi: { url: '/api/news/update', method: 'POST', dataType: 'form' },
  }
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref} />
    </div>
  );
}

export default NewsInformation;