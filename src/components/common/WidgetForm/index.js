/**
 * 表单控件
 */
import React, {Component} from 'react';
import {Row, Col, Form, Tabs} from 'antd';
import moment from "moment";
import FormItem from "./FormItem/index";
import request from "../../../utils/request";
import PublicService from "../../../services/PublicService";
import "./index.less";

class WidgetForm extends Component {
  static defaultProps = {
    formConfig: {},
    formVal: {},
    isCustom: true, // 是否为自定义表单
  };

  state = {
    formConfig: {},
    remoteOptions: {},
  };

  componentDidMount() {
    const t = this;
    let {formConfig = {}, formVal = {}} = t.props;
    t.setFormData(formConfig, formVal);
  };

  componentWillReceiveProps(nextProps) {
    const t = this;
    let {formConfig = {}, isCustom} = t.props;

    if (!isCustom) {
      if (formConfig && formConfig.list && formConfig.list.length) {
        if (nextProps.formConfig) {
          let oldFormConfig = JSON.stringify(formConfig);
          let newFormConfig = JSON.stringify(nextProps.formConfig);
          if (oldFormConfig !== newFormConfig) {
            t.setFormData(nextProps.formConfig, nextProps.formVal)
          }
        }
      }
    }
  }

  // 设置表单数据
  setFormData = (formConfig, formVal = {}) => {
    if (formConfig) {
      if (typeof formConfig === "string") {
        formConfig = JSON.parse(formConfig)
      }

      let {list = []} = formConfig;
      let remoteList = [];
      if (list && list.length) {
        const loopData = (data) => {
          data.map(i => {
            let {remoteUrl, dataType, remoteValue, remoteLabel, type, lonlatParamName, paramName, dateFormat, mode} = i;
            if (i.initialValue === "null" || i.initialValue === "[]") {
              i.initialValue = null;
            }

            if (formVal[paramName] === "null" || formVal[paramName] === "[]") {
              formVal[paramName] = null;
            }

            if (formVal[lonlatParamName] === "null" || formVal[lonlatParamName] === "[]") {
              formVal[lonlatParamName] = null;
            }

            if (dataType === "remote") {
              i.remoteOptions = [];
              if (remoteValue && remoteLabel && remoteUrl) {
                let remoteConfig = {url: remoteUrl, method: 'GET'};
                remoteList.push({...i, remoteConfig});
              }
            }

            if (type === "mapLocation") {
              i.lonlatInitialValue = formVal[lonlatParamName];
            }

            if (formVal[paramName] || formVal[paramName] == 0) {
              i.initialValue = formVal[paramName];

              if (["imgUpload", "fileUpload", "voiceUpload", "videoUpload"].includes(type)) {
                i.initialValue = [];
                let remoteConfig = {
                  url: "/pmms/fileInfo/listByFileIds",
                  method: 'GET',
                  params: {fileIds: formVal[paramName]}
                };
                remoteList.push({...i, remoteConfig});
              }

              if (["treeSelect", "select", "cascade", "checkList"].includes(type)) {
                if (mode === "multiple" || type === "cascade") {
                  i.initialValue = typeof formVal[paramName] === "string" ? formVal[paramName].split(",") : []
                } else {
                  i.initialValue = String(formVal[paramName])
                }
              }
            }

            if (i.initialValue) {
              if (["timePicker", "datePicker", "monthPicker", "yearPicker", "rangePicker"].includes(type)) {
                if (type === "rangePicker") {
                  i.initialValue = []
                } else {
                  if (dateFormat && dateFormat === "x" && i.initialValue.indexOf("-") === -1) {
                    i.initialValue = Number(i.initialValue);
                  }
                  i.initialValue = moment(i.initialValue);
                }
              }
            }

            if (i.columns && i.columns.length) {
              i.columns.map(c => {
                if (c.list && c.list.length) {
                  loopData(c.list)
                }
              })
            }
          })
        };
        loopData(list);
      }

      this.setState({
        formConfig
      }, () => {
        if (remoteList && remoteList.length) {
          this.getRemoteOption(remoteList);
        }
      })
    }
  };

  // 获取远程数据
  getRemoteOption = (remoteList) => {
    const t = this;
    let reqList = [];
    remoteList.map(item => {
      let {remoteValue, remoteLabel, remoteChildren, paramName, type, remoteConfig = {}} = item;
      if (remoteConfig) {
        let req = request({...remoteConfig}).then(res => {
          let reqItem = {
            type,
            paramName,
            options: []
          };

          if (res && res.data) {
            if (["treeSelect", "cascade", "checkList"].includes(type)) {
              let data = JSON.stringify(res.data);
              data = data.replace(new RegExp(remoteLabel, 'g'), "label");
              data = data.replace(new RegExp(remoteValue, 'g'), "value");
              data = data.replace(new RegExp(remoteChildren, 'g'), "children");
              reqItem.options = JSON.parse(data);
            } else {
              reqItem.options = PublicService.transformOptions(res.data, remoteValue, remoteLabel, false, true)
            }
          }
          return reqItem;
        });

        reqList.push(req);
      }
    });

    Promise.all(reqList).then(val => {
      let {formConfig} = t.state;
      const loopData = (data) => {
        data.map(i => {
          let valItem = val.find(v => v.paramName === i.paramName);

          if (valItem && valItem.options) {
            if (["imgUpload", "fileUpload", "voiceUpload"].includes(i.type)) {
              valItem.options.map((v, vI) => {
                v.index = vI;
                v.uid = vI;
                v.url = v.seaWeedfsMasterUrl;
                v.name = v.fileName;
              });
              i.initialValue = valItem.options
            } else if ("videoUpload" === i.type) {
              valItem.options.map((v, vI) => {
                v.index = vI;
                v.uid = vI;
                v.url = v.frameFullUrl;
                v.videoUrl = v.seaWeedfsMasterUrl;
                v.name = v.fileName;
              });
              i.initialValue = valItem.options
            } else {
              i.remoteOptions = valItem.options;
            }
          }
          if (i.columns && i.columns.length) {
            i.columns.map(c => {
              if (c.list && c.list.length) {
                loopData(c.list)
              }
            })
          }
        })
      };
      loopData(formConfig.list);

      this.setState({
        formConfig
      })
    });
  };

  // 验证
  getValidateFormData = () => {
    const t = this;
    let {validateFields} = t.props.form;

    let formVal;
    validateFields((err, val) => {
      if (!err) {
        formVal = t.transformFormData(val);
      }
    });

    return formVal;
  };

  // 获取表单数据
  getFormData = () => {
    const t = this;
    let {getFieldsValue} = t.props.form;

    let val = getFieldsValue();
    val = t.transformFormData(val);

    return val;
  };

  // 转换表单数据
  transformFormData = (val) => {
    const t = this;
    let {formConfig} = t.state;
    if (formConfig && formConfig.list && formConfig.list.length) {
      let {list = []} = formConfig;

      const loopData = (data) => {
        data.map(i => {
          let {paramName} = i;
          if (Object.keys(val).includes(paramName)) {
            if (val[paramName]) {
              let {dateFormat, type, paramConfig} = i;

              // 修改时间格式
              if (dateFormat) {
                if (type === "rangePicker") {
                  if (val[paramName] && val[paramName].length) {
                    val[paramName][0] = val[paramName][0] && moment(val[paramName][0]).format(dateFormat);
                    val[paramName][1] = val[paramName][1] && moment(val[paramName][1]).format(dateFormat);
                  }
                } else {
                  val[paramName] = val[paramName] && moment(val[paramName]).format(dateFormat);
                }
              }

              if (type === "cascade") {
                let v = (val[paramName] && val[paramName].length) ? val[paramName] : [];
                if (paramConfig) {
                  paramConfig = typeof paramConfig === "string" ? JSON.parse(paramConfig) : paramConfig;
                  paramConfig.map((p, pI) => {
                    if (p) {
                      val[p] = v[pI] || ""
                    }
                  })
                }

                val[paramName] = (v && v.length) ? v.join(",") : "";
              }

              if (["imgUpload", "fileUpload", "videoUpload", "voiceUpload"].includes(type)) {
                let files = [];
                [...(val[paramName].length ? val[paramName] : [])].map(v => {
                  files.push(v.id)
                });
                val[paramName] = files.join(",");
              }
            }
          } else if (i.columns && i.columns.length) {
            i.columns.map(c => {
              if (c.list && c.list.length) {
                loopData(c.list)
              }
            })
          }
        })
      };
      loopData(list);
    }

    return val;
  };

  // 渲染单项
  renderFormItem = val => val.map((item, index) => {
    const t = this;
    let {formConfig} = t.state;
    let {form, disabled} = t.props;
    let {config = {}} = formConfig;
    const formItemLayout =
      config.layout === 'horizontal'
        ? {
          labelCol: {span: item.labelCol || 4},
          wrapperCol: {span: item.wrapperCol || 20},
        }
        : null;

    // 特殊渲染
    const extra = {
      "grid": t.renderGrid,
      "tabs": t.renderTabs,
    };
    if (extra[item.type]) {
      return (extra[item.type](item, index));
    }

    return (
      <FormItem key={item.paramName} formItem={item} form={form} formItemLayout={formItemLayout} disabled={disabled}/>
    )
  });

  // 渲染栅格
  renderGrid = (item, index) => {
    const t = this;
    let rowCon = {key: item.paramName + "_" + index, gutter: item.gutter || 12};
    if (item.flex) {
      rowCon = {
        ...rowCon,
        type: "flex",
        justify: item.justify,
        align: item.align,
      }
    }
    return (
      <Row {...rowCon}>
        {
          item.columns && item.columns.length > 0 &&
          item.columns.map((col, colIndex) => (
            <Col span={col.span} key={item.key + "-" + colIndex}>
              <div>
                {t.renderFormItem(col.list)}
              </div>
            </Col>
          ))
        }
      </Row>
    )
  };

  // 渲染页签
  renderTabs = (item, index) => {
    const t = this;
    let tabCon = {
      key: item.paramName + "_" + index,
      animated: item.animated,
      tabBarGutter: item.tabBarGutter,
      tabPosition: item.tabPosition,
      type: item.tabType,
    };
    return (
      <Tabs {...tabCon}>
        {
          item.columns && item.columns.length > 0 &&
          item.columns.map((col, colIndex) => (
            <Tabs.TabPane tab={col.tab} key={item.key + "-" + colIndex} forceRender={true}>
              <div>
                {t.renderFormItem(col.list)}
              </div>
            </Tabs.TabPane>
          ))
        }
      </Tabs>
    )
  };

  render() {
    const t = this;
    const {formConfig} = t.state;
    let {config = {}, list = []} = formConfig;
    return (
      <Form {...config} className="WidgetForm">
        {
          list && list.length > 0 &&
          t.renderFormItem(list)
        }
      </Form>
    )
  }
}

export default Form.create()(WidgetForm);
