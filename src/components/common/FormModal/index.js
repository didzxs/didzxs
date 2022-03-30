/**
 * 表单弹窗
 */
import React, { Component } from "react";
import {Form, Row, Col, Spin} from "antd";
import MyModal from "../MyModal";
import FormItem from "../WidgetForm/FormItem";
import styles from "./index.less";


class FormModal extends Component {
  state = {
  };

  componentDidMount() {
  }


  // 表单验证
  getValidateForm = (callback) => {
    this.props.form.validateFields((err, val) => {
      if (!err) {
        callback && callback(val);
      }
    });
  };

  // 获取表单数据
  getFormData = (callback) => {
    const t = this;
    let {getFieldsValue} = t.props.form;

    callback && callback(getFieldsValue());
  };


  render() {
    let t = this;
    const {
      form, column = 2, formLayout = "horizontal",  disabled, disabledType, loading = false, width,
      items, // 配置项
      onModalSave, onSubmit, onTS, ...formConfig
    } = t.props;
    let defaultCol = 24 / column; // 默认2列布局
    return (
      <MyModal
        width={width || 885}
        onModalSave={t.getValidateForm.bind(t, onModalSave)}
        onSubmit={t.getValidateForm.bind(t, onSubmit)}
        onTS={t.getFormData.bind(t, onTS)}
        {...formConfig}
      >
        <div className={styles.modalWrap}>
          <Spin spinning={loading}>
            <Form layout={formLayout}>
              <Row gutter={12} type={"flex"} align={"middle"}>
                {
                  items.map((item, index) => {
                    if (item.type === "blank") {
                      return (
                        <Col
                          key={index}
                          span={item.span || defaultCol}
                          offset={item.offset}
                          style={item.style}
                          className={item.className}
                        >
                          {item.content}
                        </Col>
                      );
                    } else {
                      return (
                        <Col
                          key={index}
                          span={item.span || defaultCol}
                          offset={item.offset}
                          style={item.style}
                          className={item.className}
                        >
                          <FormItem
                            disabled={item.disabled || disabled}
                            disabledType={disabledType}
                            formItem={item}
                            form={form}
                            formItemLayout={ formLayout === 'horizontal' && {
                              labelCol: {span: item.labelCol || 4},
                              wrapperCol: {span: item.wrapperCol || 20},
                            }}/>
                        </Col>
                      )
                    }
                  })}
              </Row>
            </Form>
          </Spin>
        </div>
      </MyModal>
    );
  }
}

export default Form.create()(FormModal);
