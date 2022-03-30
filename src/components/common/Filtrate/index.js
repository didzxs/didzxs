/**
 * 表格上方筛选条件
 * input 输入框, select 下拉选, rangePicker 时间筛选框
 */
import React, { Component } from 'react';
import { Form, Button, Divider, Col } from 'antd';
// import config from '../../../config';
import WidgetFormItem from '../WidgetForm/FormItem';
import styles from './index.less';

const FormItem = Form.Item;


class Filtrate extends Component {
  state = {};

  // 查询
  submit() {
    let t = this;
    let params = t.props.form.getFieldsValue();

    // 清除回调
    let { onSearch } = t.props;
    onSearch && onSearch(params);
  }

  // 清空 Form 组件输入的内容
  clearForm() {
    let t = this;
    t.props.form.resetFields();

    // 清除回调
    let { clearForm } = t.props;
    clearForm && clearForm();
  }

  render () {
    let t = this
    let { items, form, clearBtnShow = true, submitBtnShow = true, searchBtn = '查询', layoutVal = 'inline', style = {}, btnStyle = {} } = t.props

    return (
      <div id="filtrate" className={styles.filtrate} style={style}>
        <Form layout={layoutVal} onSubmit={t.submit.bind(t)}>
          {
            items && items.length > 0 &&
            items.map((item, index) => {
              if (item.type === 'line') {
                return (
                  <Divider key={index} type="vertical" style={{ margin: '10px 20px', height: 24 }}/>
                );
              } else if (item.type === 'lineH') {
                return (
                  <div
                    key={index}
                    style={{ width: '98%', margin: '0 auto 5px', height: 1, borderTop: '1px dashed #DDD' }}/>
                );
              } else {
                return (
                  item.span ?
                  <Col
                    key={index}
                    span={item.span}
                    style={item.style}
                    className={item.className}
                  >
                    <WidgetFormItem formItem={item} form={form} onInputKeyDown={t.submit.bind(t)} />
                  </Col> :
                  <WidgetFormItem key={index} formItem={item} form={form} onInputKeyDown={t.submit.bind(t)} />
                );
              }
            })
          }
          {
            (submitBtnShow || clearBtnShow) &&
            <FormItem style={btnStyle}>
              {
                submitBtnShow &&
                <Button style={{ margin: '0 10px' }} type="primary" onClick={t.submit.bind(t)}>{searchBtn}</Button>
              }
              {
                clearBtnShow &&
                <Button onClick={t.clearForm.bind(t)}>重置</Button>
              }
            </FormItem>
          }
        </Form>
      </div>
    );
  }
}

export default Form.create()(Filtrate);
