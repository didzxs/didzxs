/**
 * 会员申请退单
 */

import React, { useEffect, useState } from 'react';
import { message, InputNumber } from 'antd';
import request from '../../utils/request';
import FormModal from '../../components/common/FormModal';
import MyTable from '../../components/common/MyTable';
import styles from './BreakUpOrderModal.less';
import PublicService from '../../services/PublicService';
import config from '../../config';

let myForm;
const ChargebackModal = (props) => {
  let { modalShow, record, onModalClose, onSearch } = props;

  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [chargebackType, setChargebackType] = useState(1);

  let [leftData, setLeftData] = useState(() => {
    let list = [];
    record.goodList.map(item => {
      list.push({
        original_number: item.number,
        ...item
      })
    })
    return list;
  });
  let [rightData, setRightData] = useState(() => {
    let list = [];
    record.goodList.map(item => {
      list.push({
        ...item,
        number: 0
      })
    })
    return list;
  });

  const onModalSave = (val) => {
    setModalBtnLoading(true);
    val.orderId = record.oid;

    if(chargebackType == 1) {
      val.odids = JSON.stringify(record.odids);
      val.whole = true;
    } else {
      val.whole = false;
      let odids = [], split_items = [[], []];
      leftData.map((item, index) => {
        if (item.number > 0) {
          odids.push(leftData[index].odid);

          split_items[0].push([leftData[index].odid, leftData[index].number]);
        }
      })
      rightData.map((item, index) => {
        if (item.number > 0) {

          split_items[1].push([rightData[index].odid, rightData[index].number]);
        }
      })

      val.odids = JSON.stringify(odids);
      val.split_items = JSON.stringify(split_items);
    }
    delete val.type;
    request({ url: '/api/order/return/apply', method: 'POST', form: val })
      .then(res => {
        if (res && res.retcode == 0) {
          message.success('操作成功！');
          onModalClose(false);
          onSearch();
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  const onTypeChang = (e) => {
    setChargebackType(e.target.value);
  }

  const modalCancel = () => {
    onModalClose(false);
  }

  const onNumChange = (index, val) => {
    let list1 = [...leftData];
    let list2 = [...rightData];
    if (val > leftData[index].original_number) {
      val = leftData[index].original_number;
      message.warning('退单数量不能大于订单数量');
    }
    list1.map((item, i) => {
      if (i == index) {
        item.number = item.original_number - val || item.original_number;
      }
    })
    list2.map((item, i) => {
      if (i == index) {
        item.number = val;
      }
    })
    setLeftData(list1);
    setRightData(list2);
  }

  const leftTableColumns = [
    { dataIndex: 'num', title: '序号', align: 'center', width: 60 },
    { dataIndex: 'prod_name', title: '商品名称', align: 'center', width: 120 },
    { dataIndex: 'pname', title: '规格型号', align: 'center', width: 120 },
    {
      dataIndex: 'number',
      title: '数量',
      align: 'center',
      width: 100,
      render: (text) => (
        <div style={{ height: '25px', lineHeight: '25px' }}>{text}</div>
      )
    },
    { dataIndex: 'price', title: '单价', align: 'center', width: 100, render: (text) => text ? (text / 100).toFixed(2) : 0 },
  ];
  const rightTableColumns = [
    { dataIndex: 'num', title: '序号', align: 'center', width: 60 },
    { dataIndex: 'prod_name', title: '商品名称', align: 'center', width: 120 },
    {
      dataIndex: 'number',
      title: '退款数量',
      align: 'center',
      width: 160,
      render: (text, record, index) => {
        return <InputNumber value={text} min={0} size='small' onChange={onNumChange.bind(this, index)} />
      }
    },
  ];

  let modalItems = [
    {
      type: 'radio',
      label: '退单类型',
      paramName: 'type',
      itemProps: {
        options: [
          { value: 1, label: '整单退' },
          { value: 2, label: '部分退单' },
        ],
        onChange: onTypeChang
      },
      rules: [{ ...config.reg.required }],
      initialValue: chargebackType,
      span: chargebackType == 1 ? 24 : 12
    },
    ...(
      chargebackType == 2 &&
      [{
        type: 'blank',
        content: <div className={styles['table-container']}>
          <div className={styles['left']}>
            <div className={styles['title']}>保留商品</div>
            <MyTable
              heightAuto={true}
              columns={leftTableColumns}
              pagination={false}
              dataSource={PublicService.transformArrayData(leftData, true, true)}
              scroll={{ x: 'max-content' }}
            />
          </div>
          <div className={styles['right']}>
            <div className={styles['title']}>退款商品</div>
            <MyTable
              heightAuto={true}
              columns={rightTableColumns}
              pagination={false}
              dataSource={PublicService.transformArrayData(rightData, true, true)}
              scroll={{ x: 'max-content' }}
            />
          </div>
        </div>,
        span: 24
      }] || []
    ),
  ];
  return (
    <div>
      <FormModal
        className={styles['break-up-order-modal']}
        width={chargebackType == 1? 550 : 1000}
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        wrappedComponentRef={ref => myForm = ref}
        title={'申请退单'}
        disabled={false}
        disabledType='readOnly'
        footerShow={true}
        saveTitle='确定'
        onModalSave={onModalSave}
        onCancel={modalCancel}
      />
    </div>
  );
}

export default ChargebackModal;