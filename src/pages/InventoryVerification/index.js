/**
 * 仓库盘点
 */
import React, { useState, useEffect } from 'react';
import { InputNumber, message, Button, Modal } from 'antd';
import request from '../../utils/request';
import PublicService from '../../services/PublicService';
import Filtrate from '../../components/common/Filtrate';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import MyPagination from '../../components/common/MyPagination';
import Download from '../../utils/Download';
import ReceiptsModal from './ReceiptsModal';

const InventoryVerification = (props) => {
  let { location } = props;

  let userType = localStorage.getItem('userType');

  let [categoryList, setCategoryList] = useState([]);

  let [currentId, setCurrentId] = useState(location.query.id);
  let [currentData, setCurrentData] = useState({});
  let [currentStatus, setCurrentStatus] = useState({});

  let [modalShow, setModalShow] = useState(false);
  let [receiptsModalShow, setReceiptsModalShow] = useState(false);

  let [receiptsType, setReceiptsType] = useState();

  let [searchParams, setSearchParams] = useState({
    id: location.query.id,
  });
  let [pageSize] = useState(100);
  let [pageIndex, setPageIndex] = useState(1);
  let [pageTotal, setPageTotal] = useState(0);
  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    // 获取商品分类
    request({url: '/api/open/listProdCategory', method: 'GET'})
      .then(res => {
        if(res && res.retcode == 0) {
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
              })
            })
          })

          setCategoryList(res.data);
        }
      })
  }, [])

  useEffect(() => {
    onSearch();
  }, [searchParams, pageIndex])

  const onSearch = () => {
    setTableLoading(true);

    let url = '/api/open/sku/list';
    let basicParams = {};
    if(location.query.id) {
      url = '/api/storeCheck/info';
      basicParams.id = location.query.id;
    }

    request({ url, method: 'GET', params: { page: pageIndex, pageSize, ...searchParams, ...basicParams } })
      .then(res => {
        if (res && res.retcode == 0) {
          res.page.list.map(item => {
            if(location.query.id) {
              if(currentData[item.skuId]) {
                item.panNumber = currentData[item.skuId].panNumber;
                item.changeNumber = currentData[item.skuId].changeNumber;
              }
            } else {
              if(currentData[item.id]) {
                item.panNumber = currentData[item.id].panNumber;
                item.changeNumber = currentData[item.id].changeNumber;
              }
            }
          })
          setTableData(res.page.list);
        }
        setTableLoading(false);
        setPageTotal(res.page.totalCount);
      })
  }

  const onSearchClick = (val) => {
    setPageIndex(1);
    setSearchParams(val);
  }

  const onPageChange = (page) => {
    onSaveData();
    setPageIndex(page);
  }

  const onSaveData = () => {
    let list = [...tableData];
    let newList = [];

    if(location.pathname.indexOf('Detail') > -1) {
      list.map(item => {
        if(typeof item.panNumber == 'number') {
          newList.push({
            sysNumber: item.sysNumber,
            panNumber: item.panNumber,
            changeNumber: item.changeNumber,
            skuId: item.skuId,
            skuName: item.skuName,
            prodId: item.prodId,
            prodName: item.prodName,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            unitName: item.unitName
          })
        }
      })
    } else {
      list.map(item => {
        if(typeof item.panNumber == 'number') {
          newList.push({
            sysNumber: item.stores,
            panNumber: item.panNumber,
            changeNumber: item.changeNumber,
            skuId: item.id,
            skuName: item.properties,
            prodId: item.prod_id,
            prodName: item.prod_name,
            categoryId: item.category_id,
            categoryName: item.category_name,
            unitName: item.unit_name
          })
        }
      })
    }
    
    if(newList.length == 0) {
      return message.warning('请填写盘点库存！');
    }

    let data = {
      storeCheckDetailList: newList
    };
    if(currentId) {
      data.id = currentId;
    }
    
    request({url: '/api/storeCheck/', method: currentId ? 'PUT' : 'POST', data})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('保存盘点结果成功！');
          setCurrentId(res.id);
          let obj = {...currentData};
          newList.map(item => {
            obj[item.skuId] = {
              panNumber: item.panNumber,
              changeNumber: item.changeNumber
            }
          })
          setCurrentData(obj);
        } else {
          message.error(res.msg);
        }
      })
  }

  const onInputNumberChange = (paramName, record, val) => {
    let list = [...tableData];
    list.map(item => {
      if((location.pathname.indexOf('Detail') < 0 && item.id == record.id) || location.pathname.indexOf('Detail') > 0 && item.skuId == record.skuId) {
        item[paramName] = val;

        if(paramName == 'panNumber') {
          if(typeof val == 'number') {
            item.changeNumber = val - (location.pathname.indexOf('Detail') > -1 ? item.sysNumber : item.stores);
          } else {
            item.changeNumber = '';
          }
        }
      }
    })
    setTableData(list);
  }

  const onExport = () => {
    if(!currentId) {
      return message.warning('请先保存盘点结果！');
    }
    Download('/api/storeCheck/export', {
      id: currentId,
      page: pageIndex,
      pageSize,
      ...searchParams,
    });
  }

  const onBtnClick = () => {
    if(!currentId) {
      return message.warning('请先保存盘点结果！');
    }
    let status = {...currentStatus};
    tableData.map(item => {
      if(item.changeNumber > 0) {
        status.ying = true;
      } else {
        status.kui = true;
      }
    })
    setCurrentStatus(status);
    setModalShow(true);
  }

  const onModalShow = (type) => {
    setReceiptsType(type);
    setReceiptsModalShow(true);
  }

  let searchItems = [
    {
      type: 'treeSelect',
      label: '分类',
      paramName: 'cid',
      itemProps: {
        treeData: categoryList
      }
    }, {
      type: 'input',
      label: '搜索关键字',
      paramName: 'k',
    }, {
      type: 'select',
      label: '状态',
      paramName: 'status',
      itemProps: {
        options: [
          { value: 1, label: '上架' },
          { value: 0, label: '下架' },
        ]
      }
    },
  ];

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    ...(
      location.pathname.indexOf('Detail') < 0 &&
      [
        { title: '商品类别', dataIndex: 'category_name', align: 'center', width: 100 },
        { title: '商品编号', dataIndex: 'id', align: 'center', width: 100 },
        { title: '商品名称', dataIndex: 'prod_name', align: 'center', width: 100 },
        // { title: '商品备注', dataIndex: 'comment', align: 'center', width: 160 },
        { title: '规格型号', dataIndex: 'properties', align: 'center', width: 120 },
        { title: '单位', dataIndex: 'unit_name', align: 'center', width: 100 },
        { title: '系统库存', dataIndex: 'stores', align: 'center', width: 100 }
      ] || [
        { title: '商品类别', dataIndex: 'categoryName', align: 'center', width: 100 },
        { title: '商品编号', dataIndex: 'skuId', align: 'center', width: 100 },
        { title: '商品名称', dataIndex: 'prodName', align: 'center', width: 100 },
        { title: '规格型号', dataIndex: 'skuName', align: 'center', width: 120 },
        { title: '单位', dataIndex: 'unitName', align: 'center', width: 100 },
        { title: '系统库存', dataIndex: 'sysNumber', align: 'center', width: 100 }
      ]
    ),
    ...(
      (userType == 'admin' || userType == 'cangku') &&
      [
        {
          title: '盘点库存',
          dataIndex: 'panNumber',
          align: 'center',
          width: 130,
          render: (text, record) => (
            <InputNumber value={text} min={0} onChange={onInputNumberChange.bind(this, 'panNumber', record)} />
          )
        },
        {
          title: '盘盈盘亏',
          dataIndex: 'changeNumber',
          align: 'center',
          width: 100,
          render: (text) => (
            <span style={{color: text >= 0 ? '' : 'red'}}>{text}</span>
          )
        }
      ] || []
    ),
  ];

  return (
    <div>
      <Filtrate items={searchItems} onSearch={onSearchClick} />
      <Container
        heightAuto={true}
        headerShow={userType == 'cangku' || userType == 'admin'}
        addBtn={onSaveData}
        addBtnText={'保存盘点结果'}
        exportBtn={onExport}
        exportBtnText={'导出系统库存'}
        importBtnUrl={'/api/storeCheck/import'}
        importBtnText={'导入盘点库存'}
        extraBtn={
          [{ text: '生成盘点单据', icon: 'iconxinzeng', onClick: onBtnClick }]
        }
      >
        <MyTable
          heightAuto={true}
          columns={columns}
          loading={tableLoading}
          pagination={false}
          dataSource={PublicService.transformArrayData(tableData, true, true)}
          scroll={{ x: 'max-content' }}
        />
        <MyPagination
          pageSize={pageSize}
          current={pageIndex}
          total={pageTotal}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
        />
      </Container>
      {
        modalShow && 
        <Modal
          title='生成盘点单据'
          visible={modalShow}
          onCancel={() => setModalShow(false)}
          footer={false}
        >
          <div style={{display: 'flex', justifyContent: 'center'}}>
            { currentStatus.ying && <Button style={{margin: '0 10px', padding: '0 30px'}} onClick={onModalShow.bind(this, 1)}>盘赢单</Button> }
            { currentStatus.kui && <Button style={{margin: '0 10px', padding: '0 30px'}} onClick={onModalShow.bind(this, 2)}>盘亏单</Button> }
          </div>
        </Modal>
      }
      {
        receiptsModalShow &&
        <ReceiptsModal
          modalTitle={receiptsType == 1 ? '其他入库单' : '其他出库单'}
          id={currentId}
          type={receiptsType}
          modalShow={receiptsModalShow}
          modalClose={setReceiptsModalShow}
        />
      }
    </div>
  );
}

export default InventoryVerification;