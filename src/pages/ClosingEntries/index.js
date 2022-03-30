/**
 * 结账记录
 */

import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import moment from 'moment';
import request from '../../utils/request';
import config from '../../config';
import Container from '../../components/common/Container';
import MyTable from '../../components/common/MyTable';
import PublicService from '../../services/PublicService';
import FormModal from '../../components/common/FormModal';

const ClosingEntries = () => {

  let [modalBtnLoading, setModalBtnLoading] = useState(false);
  let [modalTitle, setModalTitle] = useState();
  let [modalShow, setModalShow] = useState(false);

  let [tableLoading, setTableLoading] = useState(false);
  let [tableData, setTableData] = useState([]);

  useEffect(() => {
    onSearch();
  }, [])

  const onSearch = () => {
    setTableLoading(true);
    request({ url: '/api/checkout/list', method: 'GET' })
      .then(res => {
        if (res && res.retcode == 0) {
          setTableData(res.data);
          setTableLoading(false);
        }
      })
  }

  const onModalSave = (val) => {
    setModalBtnLoading(true);

    let url = '';
    if(modalTitle == '结账') {
      url = '/api/checkout/check';
      val.checkedAt = moment(val.checkedAt).format('YYYY-MM-DD');
    } else {
      url = '/api/checkout/unCheck';
      val.uncheckDate = moment(val.uncheckDate).format('YYYY-MM-DD');
    }

    request({url, method: 'POST', form: val})
      .then(res => {
        if(res && res.retcode == 0) {
          message.success('操作成功！');
          onSearch();
          setModalShow(false);
        } else {
          message.error(res.msg);
        }
        setModalBtnLoading(false);
      })
  }

  const onModalShow = (type) => {
    setModalTitle(type);
    setModalShow(true);
  }

  const modalCancel = (setTypeCancel) => {
    setTypeCancel(false);
  }

  const renderModal = () => {

    let modalItems = [
      {
        type: 'datePicker',
        label: `${modalTitle}日期`,
        paramName: modalTitle == '结账' ? 'checkedAt' : 'uncheckDate',
        rules: [{...config.reg.required}],
        span: 24,
        labelCol: 5,
        wrapperCol: 19,
      },
    ];
    return (
      <FormModal
        className='closing-entries-modal'
        width={500}
        visible={modalShow}
        items={modalItems}
        modalBtnLoading={modalBtnLoading}
        title={modalTitle}
        footerShow={true}
        onModalSave={onModalSave}
        onCancel={modalCancel.bind(this, setModalShow, 'modalShow')}
      />
    )
  }

  let columns = [
    { title: '序号', dataIndex: 'num', align: 'center', width: 60 },
    { title: '操作员', dataIndex: 'organName', align: 'center', width: 150 },
    { title: '操作日期', dataIndex: 'createdAt', align: 'center', width: 260 },
    { title: '结账日期', dataIndex: 'checkedAt', align: 'center', width: 260 },
  ];

  return (
    <div>
      <Container
        heightAuto={true}
        extraBtn={
          [
            { text: '结账', icon: 'iconxinzeng', onClick: onModalShow.bind(this, '结账') },
            { text: '反结账', icon: 'iconxinzeng', onClick: onModalShow.bind(this, '反结账') },
          ]
        }
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

export default ClosingEntries;