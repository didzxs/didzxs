import React, { Component } from 'react';
import { Form, Col } from 'antd';
import FormItem from '../FormItem';

class MyForm extends Component {
  state = {};

  componentDidMount () {
    const t = this;
  };

  render () {
    const t = this;
    let { form, disabled, list = [] } = t.props;
    let defaultCol = 24
    return (
      <Form>
        {
          list && list.length > 0 &&
          list.map((item, i) => {
            // console.log('item', item);
            if (item.type === 'blank') {
              return (<Col
                key={i}
                span={item.span || defaultCol}
                offset={item.offset}
                style={item.style}
                className={item.className}
              >
                {item.content}
              </Col>);
            } else {
              return (<Col span={item.span || 12} key={i}>
                <FormItem
                  formItem={item}
                  form={form}
                  disabled={item.disabled || disabled}
                  formItemLayout={{
                    labelCol: { span: item.labelCol || 4 },
                    wrapperCol: { span: item.wrapperCol || 20 }
                  }}
                />
              </Col>);
            }
          })
        }
      </Form>
    );
  }
}

export default Form.create()(MyForm);
