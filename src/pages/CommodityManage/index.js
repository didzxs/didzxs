/**
 * 商品管理
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, DatePicker, Divider, Icon, Input, InputNumber, message, Popconfirm, Tag } from 'antd';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import moment from 'moment';
import useQiniuToken from '../MyHooks/useQiniuToken';
import request from '../../utils/request';
import config from '../../config';
import MyTable from '../../components/common/MyTable';
import FormModal from '../../components/common/FormModal';
import WangEditor from '../../components/WangEditor';
import PublicService from '../../services/PublicService';
import Util from '../../utils/Util';
import Template from '../Template';
import styles from './index.less';
import DragableBodyRow from '../../components/common/DragTable/DragableBodyRow';
import update from 'immutability-helper';

let f1, myForm, skuForm;
const CommodityManage = () => {
  let token = useQiniuToken();

  let userType = localStorage.getItem('userType');

  let [detail, setDetail] = useState({}); // 商品详情
  let [mainPic, setMainPic] = useState([]); // 商品主图
  let [videos, setVideos] = useState([]); // 商品视频
  let [imgList, setImgList] = useState([]); // 商品滚动图
  let [skuList, setSkuList] = useState([]); // 商品规格数据

  let [addPropShow, setAddPropShow] = useState(false); // 添加规格选择框显隐
  let [propData, setPropData] = useState({});
  let [propDataList, setPropDataList] = useState([]); // 规格数据列表
  let [propDataModalList, setPropDataModalList] = useState([]); // 规格modal列表

  let [categoryList, setCategoryList] = useState([]);
  let [unitList, setUnitList] = useState([]); // 计量单位列表

  let [allSpecificationList, setAllSpecificationList] = useState([]); // 规格下拉列表
  let [specificationList, setSpecificationList] = useState([]); // 过滤后的规格下拉列表
  let specificationListRef = useRef([]);
  let [propValueList, setPropValueList] = useState([]); // 规格值列表

  let [brandList, setBrandList] = useState([]);

  let [modalShow, setModalShow] = useState(false);
  let [tableShow, setTableShow] = useState(false);
  let [skuEditIndex, setSkuEditIndex] = useState();
  let [skuPic, setSkuPic] = useState([]);

  let [modalType, setModalType] = useState();

  let [status, setStatus] = useState(1); // 当前查询商品上下架状态
  let [editorContent, setEditorContent] = useState();

  let [nameReset, setNameReset] = useState(false); // 商品sku名字是否重设

  // let [sortedInfo, setSortedInfo] = useState({
  //   order: 'ascend',
  //   columnKey: 'sort'
  // });

  useEffect(() => {
    onGetProdCategoryList();
    onGetSpecPage();
    onGetUnitList();
    onGetBrand();
  }, []);

  // 获取商品分类
  const onGetProdCategoryList = () => {
    request({ url: '/api/open/listProdCategory', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            item.title = item.name;
            item.label = item.name;
            item.value = item.id;
            item.children = item.categories;
            item.children &&
            item.children.map((child) => {
              child.title = child.name;
              child.label = child.name;
              child.value = child.id;

              child.children = child.categories;
              child.children &&
              child.children.map(child1 => {
                child1.title = child1.name;
                child1.label = child1.name;
                child1.value = child1.id;
              });
            });
          });

          setCategoryList(res.data);
        }
      });
  };

  // 商品规格列表
  const onGetSpecPage = () => {
    request({ url: '/api/prod/spec/page', method: 'GET', params: { current: 1, size: 10000 } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            item.value = item.id;
            item.label = item.prop_name;
          });
          setAllSpecificationList(res.page.list);
          setSpecificationList(res.page.list);
        }
      });
  };

  const onGetUnitList = () => {
    request({ url: '/api/unit/list', method: 'GET', params: { page: 1, pageSize: 10000, status: 1 } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            item.value = item.id;
            item.label = item.name;
          });
          setUnitList(res.page.list);
        }
      });
  };

  // 品牌列表
  const onGetBrand = () => {
    request({ url: '/api/brand/list', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            item.value = item.brandId;
            item.label = item.brandName;
          });
          setBrandList(res.data);
        }
      });
  };

  // 获取详情
  const getDetail = (id) => {
    request({ url: '/api/open/prod/info', method: 'GET', params: { prodId: id } })
      .then(res => {
        if (res && res.retcode == 0) {
          let brandIds = [];
          res.data.brands &&
          res.data.brands.map(item => {
            brandIds.push(item.brandId);
          });
          res.data.brandIds = brandIds;
          setDetail(res.data);
          res.data.skuList.map((item, index) => {
            item.disabled = true;
            item.beginCostPrice = item.beginCostPrice / 100;
            item.crossRate = item.crossRate * 1000000 / 10000;
            item.oriPrice = item.oriPrice / 100;
            item.oriRate = item.oriRate * 100000 / 1000;
          });
          setSkuList(res.data.skuList);

          let mainPic = [];
          res.data.pic && (mainPic = [{ url: res.data.pic, uid: 0, index: 0, type: 'mainPic' }]);
          let videos = [];
          res.data.video && (videos = [{ url: res.data.video, uid: 0, index: 0, type: 'videos', name: '视频' }]);

          let imgList = [];
          if (res.data.imgs) {
            let imgs = res.data.imgs.split(',');
            imgs.map((item, index) => {
              imgList.push({ url: item, uid: index, index, type: 'imgList' });
            });
          }

          setMainPic(mainPic);
          setVideos(videos);
          setImgList(imgList);

          myForm.props.form.setFieldsValue({
            pic: mainPic,
            video: videos,
            imgs: imgList
          });

          let propStr = '', propObj = {};
          res.data.skuList.map((item, index) => {
            if (index == 0) {
              propStr += item.properties;
            } else {
              propStr += `;${item.properties}`;
            }
          });

          let propArr = propStr.split(';');
          let propNameArr = [];
          propArr.map(item => {
            let arr = item.split(':');
            // 有该规格
            if (propObj[arr[0]]) {
              if (!propObj[arr[0]].includes(arr[1])) {
                propObj[arr[0]].push(arr[1]);
              }
            } else {
              propNameArr.push(arr[0]);
              propObj[arr[0]] = [arr[1]];
            }
          });

          if (propNameArr) {
            let newList = [];
            let list = [...allSpecificationList];
            list.map((item, index) => {
              if (!propNameArr.includes(item.label)) {
                newList.push(item);
              }
            });
            setSpecificationList(newList);
            specificationListRef.current = newList;
          }
          let list = [];
          for (let key in propObj) {
            list.push({
              propName: key,
              propValue: propObj[key],
              key: list.length,
              inputVisible: false
            });
          }
          setPropDataList(list);
        }
      });
  };

  // 商品上下架
  const onProdStatusChange = (record) => {
    request({
      url: '/api/product/prodStatus',
      method: 'PUT',
      params: { prodIds: record.id, prodStatus: record.status == 0 ? 1 : 0 }
    })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
        }
      });
  };

  // 商品批量上下架
  const onProdStatusBatchChange = (type) => {
    let selectedRows = f1.state.selectedRows;
    if (!selectedRows || !selectedRows.length) {
      return message.warning(`请勾选要${type}的商品！`);
    }
    let ids = [];
    selectedRows.map(item => {
      ids.push(item.id);
    });
    request({
      url: '/api/product/prodStatus',
      method: 'PUT',
      params: { prodIds: ids.join(','), prodStatus: type == '上架' ? 1 : 0 }
    })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          f1.onSearch();
          f1.selectedRowEmpty();
        }
      });
  };

  const getModalFormHanld = (form) => {
    myForm = form;
  };

  const getModalType = (type) => {
    if (type == '新增') {
      setSpecificationList(allSpecificationList);
    }
    setModalType(type);
  };

  const modalCancel = () => {
    setPropDataList([]);
    setDetail({});
    setMainPic([]);
    setVideos([]);
    setImgList([]);
    setSkuList([]);
    setTableShow(false);
  };

  const handleSearchData = (val) => {
    setStatus(val.status); // 获取列表上下架状态
    return val;
  };

  // 处理表格排序数据
  const handleSorter = (sorter) => {
    let val = {};
    if (sorter.order) {
      val.sort = { createdAt: 0, soldNum: 1, oriPrice: 2 }[sorter.columnKey];
      val.orderby = { ascend: 0, descend: 1 }[sorter.order];
    }
    return val;
  };

  const handleSaveData = (val) => {
    // if(!editorContent) {
    //   message.error('请填写商品描述！')
    //   return false;
    // }
    if (!skuList.length) {
      message.warning('至少保存一种商品规格！');
      return false;
    }
    let rules = { name: '名称', /*pic: 'sku图片',*/ stores: '库存', beginCostPrice: '初期成本价', crossRate: '毛利率' };
    for (let i = 0; i < skuList.length; i++) {
      for (let key in rules) {
        if (!skuList[i][key] && skuList[i][key] != 0) {
          message.error(rules[key] == 'sku图片' ? '请上传sku图片' : `请填写${rules[key]}`);
          return false;
        }
      }
    }

    if (detail.id) {
      val.id = detail.id;
    }

    unitList.map(item => {
      if (item.value == val.unitId) {
        val.unitName = item.name;
      }
    });

    val.content = editorContent;
    val.oriPrice = Util.toFixed0(val.oriPrice * 100);

    val.pic = mainPic && mainPic.length && mainPic[0].url || '';
    val.video = videos.length && videos[0].url || '';

    if (imgList.length) {
      let imgs = [];
      imgList.map(item => {
        imgs.push(item.url);
      });
      val.imgs = imgs.join(',');
    } else {
      val.imgs = '';
    }

    let list = [...skuList], newSkuList = [];
    list.map((item, index) => {
      delete item.key;
      delete item.num;

      newSkuList.push({
        ...item,
        prodName: val.prodName,
        beginCostPrice: Util.toFixed0(item.beginCostPrice * 100),
        crossRate: item.crossRate / 100,
        oriPrice: item.oriPrice ? Util.toFixed0(item.oriPrice * 100) : 0,
        oriRate: item.oriRate ? item.oriRate / 100 : 0,
        oriEnd: (item.oriEnd ? moment(item.oriEnd).format('YYYY-MM-DD 23:59:59') : ''),

        oriNumber: item.oriNumber || 0,
        storeThreshold: item.storeThreshold || 0,
        saleThresholdMonth: item.saleThresholdMonth || 0,
        saleThresholdNumber: item.saleThresholdNumber || 0,
        sort: index
      });

    });
    val.skuList = newSkuList;

    return val;
  };

  const onDelete = (id) => {
    request({ url: '/api/product/', method: 'DELETE', data: [id] })
      .then(res => {
        if (res && res.retcode == 0) {
          f1.onSearch();
          message.success('删除成功！');
        } else {
          message.error(res.msg);
        }
      });
  };

  const onModalShow = (type, record) => {
    getDetail(record.id);
    f1.onModalShow(type, record);

    setTimeout(() => {
      setTableShow(true);
    });
  };

  let searchItems = [
    {
      type: 'input',
      label: '关键字查询',
      paramName: 'k'
    }, {
      type: 'treeSelect',
      label: '分类',
      paramName: 'cid',
      itemProps: {
        treeData: categoryList
      }
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '上架' },
          { value: 0, label: '下架' }
        ]
      },
      initialValue: 1
    }, {
      type: 'select',
      label: '是否为促销',
      paramName: 'isPromote',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '否' },
          { value: 1, label: '是' }
        ]
      }
    }, {
      type: 'select',
      label: '是否为热销',
      paramName: 'isHot',
      itemProps: {
        options: [
          { value: '', label: '全部' },
          { value: 0, label: '否' },
          { value: 1, label: '是' }
        ]
      }
    }, {
      type: 'select',
      label: '品牌',
      paramName: 'brandId',
      itemProps: {
        options: PublicService.transformProjectInfoToSelect(brandList, 'value', 'label', true, true)
      }
    }
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '商品名称', dataIndex: 'prodName', align: 'center', width: 100 },
    { title: '商品编号', dataIndex: 'prodSn', align: 'center', width: 100 },
    {
      title: '商品原价(元)',
      dataIndex: 'oriPrice',
      align: 'center',
      width: 120,
      // sorter: true,
      render: (text) => (
        text ? (text / 100).toFixed(2) : text
      )
    },
    // { title: '商品现价', dataIndex: 'price', align: 'center', width: 100 },
    { title: '商品库存', dataIndex: 'totalStocks', align: 'center', width: 100 },
    {
      title: '商品图片',
      dataIndex: 'pic',
      align: 'center',
      width: 180,
      render: (text) => (
        <img src={text} style={{ maxWidth: '100%', height: '100px' }}/>
      )
    },
    {
      title: '品牌',
      dataIndex: 'brandList',
      align: 'center',
      width: 180,
      render: (text) => {
        if (text && text.length) {
          let arr = text.split(',');
          let list = [];
          arr.map(item => {
            list.push({
              name: item.split('|')[2],
              icon: item.split('|')[1]
            });
          });
          return <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around' }}>
            {
              list.map((item, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                  <img src={item.icon} style={{ width: '50px', height: '50px' }}/>
                  <span title={item.name} style={{
                    width: '50px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                  }}>{item.name}</span>
                </div>
              ))
            }
          </div>;
        } else {
          return;
        }
      }
    },
    { title: '创建时间', dataIndex: 'createdAt', align: 'center', width: 120 /*sorter: true*/ },
    { title: '销量', dataIndex: 'soldNum', align: 'center', width: 100, sorter: true },
    {
      title: '状态',
      dataIndex: 'status',
      align: 'center',
      width: 100,
      render: (text) => (
        { 0: '下架', 1: '上架' }[text]
      )
    },
    { title: '计量单位', dataIndex: 'unitName', align: 'center', width: 100 },
    {
      title: '操作',
      dataIndex: 'handle',
      align: 'center',
      width: 100,
      render: (text, record) => (
        <>
          <a onClick={onModalShow.bind(this, '编辑', record)}>编辑</a>
          <Divider type="vertical"/>
          <a onClick={onProdStatusChange.bind(this, record)}>{record.status == 0 ? '上架' : '下架'}</a>
          <Divider type="vertical"/>
          <Popconfirm
            title="是否删除这条数据?"
            onConfirm={onDelete.bind(this, record.id)}
            icon={<Icon type="question-circle-o" style={{ color: 'red' }}/>}>
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      )
    }
  ];

  useEffect(() => {
    myForm && myForm.props.form.setFieldsValue({
      imgs: imgList
    });
  }, [imgList]);

  // 文件上传成功过
  const onSuccess = (type, data) => {
    if (type == 'skuPic') {
      let img = [{ url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type }];

      skuForm.props.form.setFieldsValue({
        pic: img
      });

      setSkuPic(img);
      return;
    }

    let fileType = { mainPic, videos, imgList };
    let newFileList = [...fileType[type]];

    if (type == 'mainPic') {
      newFileList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type };

      myForm.props.form.setFieldsValue({
        pic: newFileList
      });

      setMainPic(newFileList);
    } else if (type == 'videos') {
      newFileList[0] = { url: config.viewImgUrl + data.key, ...data, uid: 0, index: 0, type, name: '视频' };

      myForm.props.form.setFieldsValue({
        video: newFileList
      });

      setVideos(newFileList);
    } else if (type == 'imgList') {
      newFileList.push({
        url: config.viewImgUrl + data.key, ...data,
        uid: newFileList.length,
        index: newFileList.length,
        type
      });

      newFileList.map((item, index) => {
        item.uid = index;
        item.index = index;
      });

      myForm.props.form.setFieldsValue({
        imgs: newFileList
      });

      setImgList(newFileList);
    }
  };

  // 文件删除
  const onRemove = (type, setType, file) => {
    if (type == 'skuPic') {
      setSkuPic([]);
      return;
    }

    let fileType = { mainPic, videos, imgList };
    let newFileList = [...fileType[type]];
    newFileList.splice(file.index, 1);
    setType(newFileList);
  };

  let onInputChange = (index, type, e) => {
    let list = [...skuList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = e.target.value;
      }
    });
    setSkuList(list);
  };

  let onInputNumChange = (index, type, val) => {
    if (type == 'crossRate' && !(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('最多保留2位小数!');
    }
    if ((type == 'beginCostPrice' || type == 'oriPrice' || type == 'oriRate') && !(/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/.test(val))) {
      // 最多保留2位小数
      return message.warning('最多保留2位小数!');
    }

    let list = [...skuList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = val;

        // 初期成本价、毛利率、打折价、打折率 联动计算
        if (type == 'beginCostPrice' && item.crossRate) {
          if (item.oriPrice) {
            item.oriRate = (item.oriPrice / (val * (1 + item.crossRate / 100)) * 100).toFixed(2);
          } else if (item.oriRate) {
            item.oriPrice = (item.beginCostPrice * (val * (1 + item.crossRate / 100)) / 100).toFixed(2);
          }
        }
        if (type == 'crossRate' && item.beginCostPrice) {
          if (item.oriPrice) {
            item.oriRate = (item.oriPrice / (item.beginCostPrice * (1 + val / 100)) * 100).toFixed(2);
          } else if (item.oriRate) {
            item.oriPrice = (item.beginCostPrice * (item.beginCostPrice * (1 + val / 100)) / 100).toFixed(2);
          }
        }
        if (type == 'oriPrice' && item.beginCostPrice) {
          // 打折率 = 打折价 / (成本价 * (1 + 毛利率)) * 100   毛利率输入的是百分号要/100
          item.oriRate = (val / (item.beginCostPrice * (1 + (item.crossRate || 0) / 100)) * 100).toFixed(2);
        }
        if (type == 'oriRate') {
          item.oriPrice = (val * (item.beginCostPrice * (1 + item.crossRate / 100)) / 100).toFixed(2);
        }

        // 计算销售价
        if (type == 'beginCostPrice' || type == 'crossRate') {
          if (item.beginCostPrice && item.crossRate) {
            item.credprice = item.oriPrice * 100 || (item.beginCostPrice * (1 + item.crossRate / 100) * 100); // 有打折价优先显示打折价
          }
        }
      }
    });
    setSkuList(list);
  };

  let onDateChange = (index, type, val) => {
    let list = [...skuList];
    list.map((item, i) => {
      if (i == index) {
        item[type] = moment(val).format('YYYY-MM-DD HH:mm:00');
      }
    });
    setSkuList(list);
  };

  let modalColumns = [
    // {
    //   title: '序号',
    //   dataIndex: 'sort',
    //   align: 'center',
    //   width: 80,
    //   sorter: (a, b) => a.sort - b.sort,
    //   sortOrder: sortedInfo.columnKey === 'sort' && sortedInfo.order,
    //   fixed: 'left'
    // },
    {
      title: '商品名称',
      dataIndex: 'prodName',
      align: 'center',
      width: 120,
      fixed: 'left'
    },
    {
      title: <><span style={{ color: 'red' }}>*</span>名称</>,
      dataIndex: 'name',
      align: 'center',
      width: 160,
      fixed: 'left',
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index, 'name')} disabled={record.status == 0}/>
      )
    },
    ...(
      modalType != '新增' &&
      [{ title: '编号', dataIndex: 'skuSn', align: 'center', width: 120 }] || []
    ),
    { title: <><span style={{ color: 'red' }}>*</span>商品规格</>, dataIndex: 'properties', align: 'center', width: 180 },
    {
      title: 'sku图片',
      dataIndex: 'pic',
      align: 'center',
      width: 200,
      render: (text, record, index) => (
        <div
          style={{ display: 'flex', width: '100%', height: '100px', justifyContent: 'center', alignItems: 'center' }}>
          {
            text ?
              <img src={text} style={{ maxWidth: '100%', height: '100%', cursor: 'pointer' }}
                   onClick={onSkuModalShow.bind(this, index)}/>
              :
              <Icon type="cloud-upload" style={{ fontSize: '32px', color: '#1890ff', cursor: 'pointer' }}
                    onClick={onSkuModalShow.bind(this, index)}/>
          }
        </div>
      )
    }, {
      title: <><span style={{ color: 'red' }}>*</span>库存</>,
      dataIndex: 'stores',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'stores')}
                     disabled={record.status == 0}/>
      )
    }, {
      title: <><span style={{ color: 'red' }}>*</span>初期成本价(元)</>,
      dataIndex: 'beginCostPrice',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'beginCostPrice')}
                     disabled={modalType != '新增' && record.disabled}/>
      )
    }, {
      title: <><span style={{ color: 'red' }}>*</span>毛利率(%)</>,
      dataIndex: 'crossRate',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'crossRate')}
                     disabled={record.status == 0}/>
      )
    }, {
      title: '打折价(元)',
      dataIndex: 'oriPrice',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} min={0} onChange={onInputNumChange.bind(this, index, 'oriPrice')}
                     disabled={record.status == 0}/>
      )
    }, {
      title: '销售价(元)',
      dataIndex: 'credprice',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        text ? parseInt(text) / 100 : text
      )
    }, {
      title: '打折率(%)',
      dataIndex: 'oriRate',
      align: 'center',
      width: 120,
      render: (text, record, index) => ( // 初期成本价、毛利率填写后才能填写打折价、打折率
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'oriRate')}
                     disabled={!record.beginCostPrice || !record.crossRate || record.status == 0}/>
      )
    }, {
      title: '打折截止日期',
      dataIndex: 'oriEnd',
      align: 'center',
      width: 160,
      render: (text, record, index) => (
        <DatePicker value={text ? moment(text) : text} onChange={onDateChange.bind(this, index, 'oriEnd')}
                    disabled={record.status == 0}/>
      )
    }, {
      title: '打折限量',
      dataIndex: 'oriNumber',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'oriNumber')}
                     disabled={record.status == 0}/>
      )
    }, {
      title: '库存预警',
      dataIndex: 'storeThreshold',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'storeThreshold')}
                     disabled={record.status == 0 || userType != 'admin'}/>
      )
    }, {
      title: '滞销预警的月份',
      dataIndex: 'saleThresholdMonth',
      align: 'center',
      width: 140,
      render: (text, record, index) => (
        <Input value={text} onChange={onInputChange.bind(this, index, 'saleThresholdMonth')}
               disabled={record.status == 0 || userType != 'admin'}/>
      )
    }, {
      title: '滞销预警的数量',
      dataIndex: 'saleThresholdNumber',
      align: 'center',
      width: 120,
      render: (text, record, index) => (
        <InputNumber value={text} onChange={onInputNumChange.bind(this, index, 'saleThresholdNumber')}
                     disabled={record.status == 0 || userType != 'admin'}/>
      )
    }, {
      title: '操作',
      dataIndex: 'key',
      align: 'center',
      width: 200,
      fixed: 'right',
      render: (text, record, index) => (
        <div style={{ display: 'flex', height: '100px', alignItems: 'center', justifyContent: 'center' }}>
          <a onClick={onSkuStatusChange.bind(this, record.status, index)}>{record.status == 0 ? '启用' : '禁用'}</a>
        </div>
      )
    }
  ];

  // sku上传图片
  const onSkuModalSave = () => {
    let list = [...skuList];
    list[skuEditIndex].pic = skuPic && skuPic.length && skuPic[0].url || '';
    setSkuList(list);
    setModalShow(false);
    setSkuPic([]);
  };

  const onSkuModalShow = (index) => {
    setModalShow(true);
    setSkuEditIndex(index);
  };

  useEffect(() => {
    if (modalShow && skuList[skuEditIndex].pic) {
      setTimeout(() => {
        let img = [{ url: skuList[skuEditIndex].pic, uid: 0, index: 0, type: 'skuPic' }];
        setSkuPic(img);
        skuForm.props.form.setFieldsValue({
          pic: img
        });
      });
    }
  }, [modalShow]);

  const onSkuStatusChange = (status, index) => {
    let list = [...skuList];
    list[index].status = status == 0 ? 1 : 0;
    setSkuList(list);
  };

  // 添加规格选择框显隐
  const addPropShowBtn = () => {
    setAddPropShow(!addPropShow);
  };

  useEffect(() => {
    propGroup(propDataList);

    let list = [];
    propDataList.map((item, index) => {
      list.push({
        type: 'blank',
        name: item.propName,
        content: <div style={{ padding: '10px 35px 20px' }}>
          <div style={{ paddingBottom: '15px' }}>
            {item.propName}
            <span style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                  onClick={onDeleteProp.bind(this, item.propName, index)}><Icon type="delete"/>删除</span>
          </div>
          <div>
            {
              item.propValue.map((valItem, valIndex) => (
                <Tag key={valIndex} visible={true} closable={item.propValue.length != 1}
                     onClose={propItemDelete.bind(this, index, item.propName, valIndex, valItem)}>
                  {valItem}
                </Tag>
              ))
            }
            {item.inputVisible && (
              <Input
                // ref={saveInputRef}
                type="text"
                size="small"
                style={{ width: 78 }}
                value={item.inputValue}
                onChange={handleInputChange.bind(this, index)}
                onBlur={handleInputConfirm.bind(this, index)}
                onPressEnter={handleInputConfirm.bind(this, index)}
              />
            )}
            {!item.inputVisible && (
              <Tag onClick={showInput.bind(this, index)} style={{ background: '#fff', borderStyle: 'dashed' }}>
                <Icon type="plus"/> 添加
              </Tag>
            )}
          </div>
        </div>,
        span: 24
      });
    });
    setPropDataModalList(list);

  }, [propDataList]);

  const showInput = (key) => {
    let list = [...propDataList];
    list.map((item, index) => {
      if (index == key) {
        item.inputVisible = true;
      }
    });
    setPropDataList(list);
  };

  // const saveInputRef = (val) => {
  //   console.log(val, 11111)
  // }

  const handleInputChange = (index, e) => {
    let list = [...propDataList];
    list.map((item, i) => {
      if (i == index) {
        item.inputValue = e.target.value;
      }
    });
    setPropDataList(list);
  };

  // 添加属性值
  const handleInputConfirm = (index, e) => {
    let value = e.target.value;
    let list = [...propDataList];
    if (value) {
      list.map((item, i) => {
        if (i == index) {
          item.propValue.push(value);
          item.inputValue = '';
        }
      });
    }
    list.map((item, i) => {
      if (i == index) {
        item.inputVisible = false;
      }
    });
    setNameReset(true);
    setPropDataList(list);
  };

  // 删除属性值
  const propItemDelete = (index, value, sIndex, sValue) => {
    let list = [...propDataList];
    let list1 = [...skuList];
    setNameReset(true);

    list.map((item, i) => {
      if (i == index) {
        item.propValue.splice(sIndex, 1);
      }
    });
    setPropDataList(list);

    let newList = [];
    list1.map(item => {
      if (item.properties.indexOf(`${value}:${sValue}`) < 0) {
        newList.push(item);
      }
    });
    setSkuList(newList);
  };

  // 添加规格
  const addProp = () => {
    let list = [...propDataList];

    if (!propData.propName) {
      return message.error('请选择规格名！');
    }
    if (!propData.propValue || !propData.propValue.length) {
      return message.error('请选择规格值！');
    }
    list.push({
      propName: propData.propName,
      propValue: propData.propValue,
      key: list.length,
      inputVisible: false
    });

    setNameReset(true);
    setPropDataList(list);
    setAddPropShow(false);
    setPropData({});
    setPropValueList([]);

    let list1 = [...specificationList];
    list1.map((item, index) => {
      if (item.label == propData.propName) {
        list1.splice(index, 1);
      }
    });
    setSpecificationList(list1);
    specificationListRef.current = list1;
  };

  // 删除规格
  const onDeleteProp = (val, index) => {
    let list = [...specificationListRef.current];

    let addItem;
    allSpecificationList.map(item => {
      if (item.label == val) {
        addItem = item;
      }
    });
    list.unshift(addItem);
    setSpecificationList(list);

    setNameReset(true);

    let list1 = [...propDataList];
    list1.splice(index, 1);
    setPropDataList(list1);

    // propGroup(list1);

    let list2 = [...skuList];
    let newList = [];
    list2.map(item => {
      if (item.properties.indexOf(`${val}:`) < 0) {
        newList.push(item);
      }
    });
    setSkuList(newList);
  };

  // 商品属性组合
  const propGroup = (list) => {
    if (!list.length) {
      setSkuList([]);
      return;
    }
    let propArr = [];
    list.map(item => {
      let arr = [];
      item.propValue.map(propItem => {
        arr.push(`${item.propName}:${propItem}`);
      });
      propArr.push(arr);
    });

    function cartesianProductOf () {
      return Array.prototype.reduce.call(arguments, function (a, b) {
        var ret = [];
        a.forEach(function (a) {
          b.forEach(function (b) {
            ret.push(a.concat([b]));
          });
        });
        return ret;
      }, [[]]);
    }

    let allArr = cartesianProductOf(...propArr);
    let arr = [];
    allArr.map((item, index) => {
      let name = '';
      item.map(sItem => {
        name += sItem.split(':')[1] + ' ';
      });
      let data = skuList[index] || {}; // 回显数据

      let newData = {
        status: 1,
        ...data,
        properties: item.join(';')
        // updatedAt: ''
      };
      if (nameReset) {
        newData.name = name;
      }
      arr.push(newData);
    });
    setSkuList(arr);
    setNameReset(false);
  };

  const prodNameChange = (e) => {
    let list = [...skuList];
    list.map(item => {
      item.prodName = e.target.value;
    });
    setSkuList(list);
  };

  // 获取规格值列表
  const onPropChange = (val, option) => {
    let obj = { ...propData };
    obj.propName = option.props.children;
    setPropData(obj);

    request({ url: `/api/prod/spec/listSpecValue/${val}`, method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          res.data.map(item => {
            item.value = item.id;
            item.label = item.propValue;
          });
          setPropValueList(res.data);
        }
      });
  };

  const onPropValChange = (val, options) => {
    let obj = { ...propData };
    let arr = [];
    options.map(item => {
      arr.push(item.props.children);
    });
    obj.propValue = arr;
    setPropData(obj);
  };

  // 获取富文本编辑器内容
  const getEditorContent = (val) => {
    setEditorContent(val);
  };

  let colConfig = {
    labelCol: 6,
    wrapperCol: 18
  };

  // 定义可拖动组件
  const components = {
    body: {
      row: DragableBodyRow
    }
  };
  /*
  * 用于拖动之后更新数据
  * update：处理层次很深且复杂的数据，操作很里层的数据
  *         仅复制需要更改的对象和重新使用未更改的对象
  * */
  const moveRow = useCallback((dragIndex, hoverIndex) => {
      const dragRow = skuList[dragIndex];
      setSkuList(
        update(skuList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        })
      );
    },
    [skuList]
  );

  let modalItems = [
    {
      type: 'input',
      label: '商品名称',
      paramName: 'prodName',
      itemProps: {
        onChange: prodNameChange
      },
      rules: [{ ...config.reg.required }, { max: 200, message: '最多输入200个字符' }],
      initialValue: detail.prodName,
      ...colConfig
    },
    ...(
      modalType != '新增' &&
      [{
        type: 'input',
        label: '商品编号',
        paramName: 'prodSn',
        initialValue: detail.prodSn,
        disabled: true,
        ...colConfig
      }] || []
    ),
    {
      type: 'treeSelect',
      label: '商品分类',
      paramName: 'categoryId',
      itemProps: {
        treeData: categoryList,
        showSearch: true
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.categoryId,
      ...colConfig
    }, {
      type: 'select',
      label: '品牌',
      paramName: 'brandIds',
      itemProps: {
        options: brandList,
        mode: 'multiple'
      },
      initialValue: detail.brandIds || [],
      ...colConfig
    },
    // {
    //   type: 'number',
    //   label: '现价',
    //   paramName: 'price',
    //   rules: [{...config.reg.required}],
    //   initialValue: detail.price,
    //   ...colConfig
    // },
    {
      type: 'number',
      label: '原价',
      paramName: 'oriPrice',
      itemProps: {
        formatter: value => `${value}元`
      },
      rules: [{ ...config.reg.required }, { ...config.reg.long2 }],
      initialValue: detail.oriPrice ? detail.oriPrice / 100 : detail.oriPrice,
      ...colConfig
    }, {
      type: 'number',
      label: '库存',
      paramName: 'totalStocks',
      rules: [{ ...config.reg.required }],
      initialValue: detail.totalStocks,
      ...colConfig
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '上架' },
          { value: 0, label: '下架' }
        ]
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.status,
      ...colConfig
    }, {
      type: 'select',
      label: '计量单位',
      paramName: 'unitId',
      itemProps: {
        options: unitList,
        showSearch: true
      },
      rules: [{ ...config.reg.required }],
      initialValue: detail.unitId,
      ...colConfig
    }, {
      type: 'select',
      label: '设为促销',
      paramName: 'isPromote',
      itemProps: {
        options: [
          { value: 1, label: '是' },
          { value: 0, label: '否' }
        ]
      },
      initialValue: detail.isPromote,
      ...colConfig
    }, {
      type: 'select',
      label: '设为热销',
      paramName: 'isHot',
      itemProps: {
        options: [
          { value: 1, label: '是' },
          { value: 0, label: '否' }
        ]
      },
      initialValue: detail.isHot,
      ...colConfig
    }, {
      type: 'number',
      label: '排序',
      paramName: 'manualSort',
      initialValue: detail.manualSort,
      ...colConfig
    },
    ...(
      modalType == '编辑' &&
      [{
        type: 'number',
        label: '销量',
        paramName: 'soldNum',
        initialValue: detail.soldNum,
        disabled: true,
        ...colConfig
      }] || []
    ),
    {
      type: 'blank',
      content: <div style={{ margin: '0 0 15px 48px' }}>
        <div style={{ padding: '0 0 10px 12px', color: '#333' }}>
          {/* <span style={{color: 'red'}}>*</span>  */}
          商品描述：
        </div>
        <WangEditor uploadToken={token} getEditorContent={getEditorContent} content={detail.content} height={300}/>
      </div>,
      span: 24
    }, {
      type: 'imgUpload',
      label: '商品主图',
      paramName: 'pic',
      // required: true,
      data: { token },
      uploadButtonShow: !mainPic.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'mainPic'),
        onRemove: onRemove.bind(this, 'mainPic', setMainPic)
      },
      span: 12,
      labelCol: 6,
      wrapperCol: 18
    }, {
      type: 'videoUpload',
      label: '商品视频',
      paramName: 'video',
      data: { token },
      uploadButtonShow: !videos.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'videos'),
        onRemove: onRemove.bind(this, 'videos', setVideos)
      },
      span: 12,
      labelCol: 6,
      wrapperCol: 18
    }, {
      type: 'imgUpload',
      label: '图片列表',
      paramName: 'imgs',
      // required: true,
      data: { token },
      itemProps: {
        onSuccess: onSuccess.bind(this, 'imgList'),
        onRemove: onRemove.bind(this, 'imgList', setImgList)
      },
      span: 24,
      labelCol: 3,
      wrapperCol: 21
    }, {
      type: 'blank',
      content: <div style={{ padding: '0 35px 15px' }}>
        <span style={{ paddingRight: '8px' }}>商品规格:</span>
        <Button onClick={addPropShowBtn}>添加规格</Button>
      </div>,
      span: 24
    },
    ...propDataModalList,
    ...(
      addPropShow &&
      [
        {
          type: 'select',
          label: '规格名',
          paramName: 'propName',
          itemProps: {
            options: specificationList,
            onSelect: onPropChange
          },
          rules: [{ ...config.reg.required }],
          ...colConfig
        }, {
        type: 'select',
        label: '规格值',
        paramName: 'propValue',
        itemProps: {
          mode: 'multiple',
          options: propValueList,
          onChange: onPropValChange
        },
        rules: [{ ...config.reg.required }],
        ...colConfig
      }, {
        type: 'blank',
        content: <div style={{ padding: '0 35px 20px', textAlign: 'center' }}>
          <Button type="primary" style={{ marginRight: '15px' }} onClick={addProp}>确定</Button>
          <Button onClick={() => {
            setAddPropShow(false);
            setPropValueList([]);
          }}>取消</Button>
        </div>,
        span: 24
      }
      ] || []
    ),
    ...(
      (tableShow || modalType == '新增') &&
      [{
        type: 'blank',
        content: <div style={{ padding: '10px 0 0 20px' }}>
          {/*<DraggableBodyRow />*/}
          <DndProvider backend={HTML5Backend}>
            <MyTable
              heightAuto={true}
              columns={modalColumns}
              pagination={false}
              dataSource={skuList}
              scroll={{ x: 'max-content', y: '600px' }}
              components={components}
              onRow={(record, index) => ({
                index,
                moveRow
              })}
            />
          </DndProvider>
        </div>,
        span: 24
      }] || []
    )
  ];
  const skuModalItems = [
    {
      type: 'imgUpload',
      label: 'sku图片',
      paramName: 'pic',
      // required: true,
      data: { token },
      uploadButtonShow: !skuPic.length,
      itemProps: {
        onSuccess: onSuccess.bind(this, 'skuPic'),
        onRemove: onRemove.bind(this, 'skuPic')
      },
      span: 24,
      labelCol: 6,
      wrapperCol: 18
    }
  ];

  let params = {
    searchItems,
    columns,
    modalItems,
    modalWidth: '1150px',
    editBtnShow: false,
    deleteBtnShow: false,
    rowSelectionShow: true,
    savePageStay: true,
    handleSearchData,
    handleSorter,
    handleSaveData: handleSaveData,
    getModalFormHanld: getModalFormHanld,
    getModalType: getModalType,
    modalCancel,
    extraBtn: [
      status == 0 ?
        { text: '批量上架', icon: 'icon-shangjia', onClick: onProdStatusBatchChange.bind(this, '上架') } :
        { text: '批量下架', icon: 'icon-xiajia', onClick: onProdStatusBatchChange.bind(this, '下架') }
    ],
    searchApi: { url: '/api/open/prod/list' },
    addApi: { url: '/api/product/addviaurl', method: 'POST' },
    editApi: { url: '/api/product/', method: 'PUT' },
    exportApi: { url: '/api/product/sku/export', method: 'POST' },
    importApi: { url: '/api/product/import' },
    templateUrl: config.viewImgUrl + '%E9%BC%8E%E6%B3%B0%E5%95%86%E5%93%81%E5%AF%BC%E5%85%A5%E6%A8%A1%E7%89%88.xls'
  };
  return (
    <div>
      <Template {...params} ref={ref => f1 = ref}/>
      {
        modalShow &&
        <FormModal
          width={'550px'}
          visible={modalShow}
          items={skuModalItems}
          wrappedComponentRef={ref => skuForm = ref}
          title={'上传图片'}
          disabledType="readOnly"
          footerShow={true}
          onModalSave={onSkuModalSave}
          onCancel={() => {
            setModalShow(false);
          }}
        />
      }
    </div>
  );
};

export default CommodityManage;
