/**
 * 商品分类
 */

import React, { useState, useEffect } from 'react';
import { Divider, Icon, message, Popconfirm } from 'antd';
import useQiniuToken from '../MyHooks/useQiniuToken';
import request from '../../utils/request';
import config from '../../config';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import PublicService from '../../services/PublicService';
import styles from './index.less';

let myForm;
const CommodityCategory = () => {
  let token = useQiniuToken();

  let [listCategory, setListCategory] = useState([]);
  let [listCategory1, setListCategory1] = useState([]);
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  let [modalVal, setModalVal] = useState({});
  let [modalShow, setModalShow] = useState(false);
  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [modalTitle, setModalTitle] = useState();
  let [imgList, setImgList] = useState([]);

  useEffect(() => {
    onSearch();
    getListCategory();
    getCategoryLevel2();
  }, [])

  // 一级分类列表
  const getListCategory = () => {
    request({url: '/api/open/listCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          res.data.map(item => {
            item.value = item.id;
            item.label = item.name;
          })
          setListCategory(res.data);
        }
      })
  }

  // 获取二级分类
  const getCategoryLevel2 = () => {
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          res.data.map(item => {
            item.title = item.name;
            item.label = item.name;
            item.value = item.id;
            item.disabled = true;
            item.children = item.categories;
            item.children &&
            item.children.map((child) => {
              child.title = child.name;
              child.label = child.name;
              child.value = child.id;
            })
          })

          setListCategory1(res.data);
        }
      })
  }

  const onSearch = () => {
    setTableLoading(true);
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
          res.data.map((item, index) => {
            item.children = item.categories;
            item.children &&
            item.children.map((child, childIdx) => {
              child.key = `${index + 1}-${childIdx + 1}`;
              child.num = `${index}-${childIdx + 1}`;

              child.children = child.categories;
              child.children &&
              child.children.map((child1, childIdx1) => {
                child1.key = `${index + 1}-${childIdx + 1}-${childIdx1 + 1}`;
                child1.num = `${index}-${childIdx + 1}-${childIdx1 + 1}`;
              })
            })
          })
          setTableData(res.data);
          setTableLoading(false);
        }
      })
  }

  const onDelete = (id) => {
    request({url: `/api/prod/category/${id}`, method: 'DELETE'})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('删除成功！');
          onSearch();
        } else {
          message.error(res.msg);
        }
      })
  }

  useEffect(() => {
    modalTitle == '新增' && modalShow &&
    myForm.props.form.setFieldsValue({
      icon: []
    })
    if(modalShow) {
      setTimeout(() => {
        myForm.props.form.setFieldsValue({
          icon: modalVal.icon ? [{url: modalVal.icon, uid: 0, index: 0, type: 'imgList'}] : []
        })
      })
      modalVal.icon && setImgList([{url: modalVal.icon, uid: 0, index: 0, type: 'imgList'}]);
    }
  }, [modalShow])

  const onModalShow = (type, record) => {
    setModalVal(record);
    setModalTitle(type);
    setModalShow(true);
    setLevel(record.level);
    getListCategory();
  }
  
  const onModalSave = (val) => {
    setModalBtnLoading(true);

    let method = 'POST';
    let data = {
      form: val
    }
    if(modalTitle == '编辑') {
      method = 'PUT';
      val.id = modalVal.id;
      data = {
        data: val,
      }
    }
    val.icon = val.icon[0].url;
    request({url: '/api/prod/category', method, ...data})
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
      setImgList([]);
    }
  }

  const onSuccess = (type, data) => {
    let newImgList = [...imgList];
    newImgList[0] = {url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type};
    
    myForm.props.form.setFieldsValue({
      icon: newImgList
    })
    
    setImgList(newImgList);
  }

  const onRemove = (file) => {
    let newImgList = [...imgList];
    newImgList.splice(file.index, 1);
    setImgList(newImgList);
  }

  const renderTable = () => {
    let columns = [
      { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
      { title: '分类名称', dataIndex: 'name', align: 'center', width: 200 },
      {
        title: '图标',
        dataIndex: 'icon',
        align: 'center',
        width: 300,
        render: (text) => (
          <img src={text} style={{maxWidth: '100%', height: '85px'}} />
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
          indentSize={0}
        />
      </Container>
    )
  }

  let [level, setLevel] = useState();
  const onLevelChange = (value) => {
    setLevel(value);
  }

  const renderModal = () => {
    let disabled = modalTitle == '编辑';
    let colConfig = {
      labelCol: 7,
      wrapperCol: 17,
    };

    let modalItems = [
      {
        type: 'input',
        label: '分类名称',
        paramName: 'name',
        rules: [{...config.reg.required}],
        initialValue: modalVal.name,
        ...colConfig
      }, {
        type: 'select',
        label: '分类等级',
        paramName: 'level',
        itemProps: {
          options: [
            {value: 1, label: '一级'},
            {value: 2, label: '二级'},
            {value: 3, label: '三级'},
          ],
          onChange: onLevelChange
        },
        rules: [{...config.reg.required}],
        initialValue: modalVal.level,
        disabled,
        ...colConfig
      }, 
      ...(
        level == 2 &&
        [{
          type: 'select',
          label: '上级分类',
          paramName: 'parentId',
          itemProps: {
            options: listCategory,
          },
          rules: [{...config.reg.required}],
          initialValue: modalVal.parentId,
          ...colConfig
        }] || []
      ), 
      ...(
        level == 3 &&
        [{
          type: 'treeSelect',
          label: '上级分类',
          paramName: 'parentId',
          itemProps: {
            treeData: listCategory1,
          },
          rules: [{...config.reg.required}],
          initialValue: modalVal.parentId,
          ...colConfig
        }] || []
      ),
      {
        type: 'number',
        label: '排序',
        paramName: 'seq',
        initialValue: modalVal.seq,
        ...colConfig
      }, {
        type: 'imgUpload',
        label: '图标',
        paramName: 'icon',
        required: true,
        data: {token},
        uploadButtonShow: !imgList.length,
        itemProps: {
          onSuccess: onSuccess.bind(this, 'imgList'),
          onRemove: onRemove,
        },
        span: 24,
        labelCol: 3,
        wrapperCol: 21,
      }, {
        type: 'textArea',
        label: '分类描述',
        paramName: 'description',
        initialValue: modalVal.description,
        span: 24,
        labelCol: 3,
        wrapperCol: 21,
      },
    ];
    return (
      <FormModal
        className='commodity-category-modal'
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={modalTitle}
        disabled={false}
        footerShow={true}
        onModalSave={onModalSave}
        onCancel={modalCancel.bind(this, setModalShow, 'modalShow')}
      />
    )
  }
  return (
    <div className={styles['container']}>
      { renderTable() }
      { modalShow && renderModal() }
    </div>
  );
}

export default CommodityCategory;