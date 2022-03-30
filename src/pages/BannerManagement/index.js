/**
 * banner管理
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
import WangEditor from '../../components/WangEditor';

let myForm;
const BannerManagement = () => {
  let token = useQiniuToken();

  let [searchParams, setSearchParams] = useState({type: 1});
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);
  let [editorContent, setEditorContent] = useState();
  let [bannerType, setBannerType] = useState(1);

  useEffect(() => {
    onSearch();
  }, [searchParams])

  const onSearch = () => {
    setTableLoading(true);
    request({url: '/api/banner/list', method: 'GET', params: {...searchParams}})
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
    request({url: '/api/banner/delete', method: 'POST', form: {id}})
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

  useEffect(() => {
    if(modalShow) {
      if(modalTitle == '新增') {
        myForm.props.form.setFieldsValue({
          pic: []
        })
      } else {
        let videoFormat = ['mp4', 'rm', 'rmvb', 'wmv', 'avi', '3gp', 'mkv'];
        let isVideo = false;
        videoFormat.map(item => {
          if(modalVal.pic.indexOf(item) > -1) {
            isVideo = true;
          }
        })
        if(isVideo) {
          setBannerType(2);
        } else {
          setBannerType(1);
        }
        if(modalVal.pic) {
          let file = {url: modalVal.pic, uid: 0, index: 0, type: 'imgList'};
          if(isVideo) {
            file.name = '视频';
          }
          setImgList([file]);
          setTimeout(() => {
            myForm.props.form.setFieldsValue({
              pic: [file]
            })
          })
        }
      }
    }
  }, [modalShow])
  
  const onModalSave = (val) => {
    setModalBtnLoading(true);

    delete val.type;

    let url = '/api/banner/add';
    if(modalTitle == '编辑') {
      url = '/api/banner/update';
      val.id = modalVal.id;
    }
    val.pic = val.pic[0].url;
    val.content = editorContent;
    request({url, method: 'POST', form: val})
      .then(res => {
        if(res.retcode == 0) {
          modalCancel(setModalShow, 'modalShow');
          message.success('保存成功！');
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
      setModalVal({});
      setImgList([]);
    }
  }

  // banner类型
  const onTypeChange = (val) => {
    setImgList([]);
    setBannerType(val);
    myForm.props.form.setFieldsValue({
      pic: []
    })
  }

  const onSuccess = (type, data) => {
    let newImgList = [...imgList];
    let file = {url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type};
    if(type == 'videoList') {
      file.name = '视频';
    }
    newImgList[0] = file;
    
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

  const renderModal = () => {
    let disabled = modalTitle == '查看';
    let colConfig = {
      labelCol: 7,
      wrapperCol: 17,
    };

    let modalItems = [
      {
        type: 'select',
        label: 'banner类型',
        paramName: 'type',
        required: true,
        itemProps: {
          options: [
            { value: 1, label: '图片' },
            { value: 2, label: '视频' },
          ],
          onChange: onTypeChange,
        },
        initialValue: bannerType,
        ...colConfig
      }, 
      (
        bannerType == 1 ?
        {
          type: 'imgUpload',
          label: 'banner图',
          paramName: 'pic',
          required: true,
          data: {token},
          uploadButtonShow: !imgList.length,
          itemProps: {
            onSuccess: onSuccess.bind(this, 'imgList'),
            onRemove: onRemove,
          },
          ...colConfig
        } :
        {
          type: 'videoUpload',
          label: 'banner视频',
          paramName: 'pic',
          required: true,
          data: {token},
          uploadButtonShow: !imgList.length,
          itemProps: {
            onSuccess: onSuccess.bind(this, 'videoList'),
            onRemove: onRemove,
          },
          ...colConfig
        }
      ), {
        type: 'input',
        label: '跳转地址',
        paramName: 'url',
        initialValue: modalVal.url,
        ...colConfig
      }, {
        type: 'radio',
        label: '是否门户显示',
        paramName: 'forPortal',
        itemProps: {
          options: [
            { value: 1, label: '是' },
            { value: 0, label: '否' },
          ]
        },
        initialValue: modalVal.forPortal,
        ...colConfig
      }, {
        type: 'radio',
        label: '是否商城显示',
        paramName: 'forMerch',
        itemProps: {
          options: [
            { value: 1, label: '是' },
            { value: 0, label: '否' },
          ]
        },
        initialValue: modalVal.forMerch,
        ...colConfig
      }, {
        type: 'blank',
        content: <div style={{marginBottom: '15px'}}>
          <div style={{padding: '0 0 10px 12px', color: '#333'}}>
            {/* <span style={{color: 'red'}}>*</span>  */}
            详情页面内容：</div>
          <WangEditor uploadToken={token} getEditorContent={getEditorContent} content={modalVal.content} height={300} />
        </div>,
        span: 24,
      }
    ];
    return (
      <FormModal
        className='banner-management-modal'
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
    // {
    //   type: 'select',
    //   label: '类型',
    //   paramName: 'type',
    //   itemProps: {
    //     options: [
    //       { value: 1, label: '首页banner' },
    //       { value: 0, label: '启动图' },
    //     ]
    //   },
    //   initialValue: 1,
    // },
    {
      type: 'checkbox',
      label: '',
      paramName: 'for_portal',
      itemProps: {
        options: [
          { value: 1, label: '门户展示' },
        ]
      }
    }, {
      type: 'checkbox',
      label: '',
      paramName: 'for_merch',
      itemProps: {
        options: [
          { value: 1, label: '商城滚动图' },
        ]
      }
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    {
      title: '图片/视频',
      dataIndex: 'pic',
      align: 'center',
      width: 220,
      render: (text) => {
        let videoFormat = ['mp4', 'rm', 'rmvb', 'wmv', 'avi', '3gp', 'mkv'];
        let isVideo = false;
        videoFormat.map(item => {
          if(text.indexOf(item) > -1) {
            isVideo = true;
          }
        })
        return isVideo ? text : <img src={text} style={{maxWidth: '100%', height: '180px'}} />;
      }
    },
    { title: '跳转链接', dataIndex: 'url', align: 'center', width: 180 },
    {
      title: '是否门户显示',
      dataIndex: 'forPortal',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '否', 1: '是'}[text]
      )
    },
    {
      title: '是否商城显示',
      dataIndex: 'forMerch',
      align: 'center',
      width: 100,
      render: (text) => (
        {0: '否', 1: '是'}[text]
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

export default BannerManagement;