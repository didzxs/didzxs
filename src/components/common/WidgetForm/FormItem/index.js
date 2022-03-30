import React, { Component } from 'react';
import moment from 'moment';
import {
  Form, Select, Input, DatePicker, TimePicker, Radio, TreeSelect, Checkbox, InputNumber, Upload,
  Button, Modal, Icon, Cascader, message,
} from 'antd';
import PublicService from '../../../../services/PublicService';
import './index.less';

// 获取默认属性
function getDefaultProps(val, props) {
  let { type, label, placeholder, itemProps = {} } = val;
  let { size, disabled: propDisabled } = props;
  let disabled = itemProps.disabled || propDisabled;

  let defaultVal = {
    disabled,
    size,
    style: {width: "100%"}
  };

  // 输入型控件
  if (['input', 'textArea', 'number'].includes(type)) {
    defaultVal.placeholder = !disabled && (placeholder || `请输入${label}`) || '';
  }

  // 选择型控件
  if (['timePicker', 'datePicker', 'yearPicker', 'monthPicker', 'select', 'treeSelect', 'cascade'].includes(type)) {
    defaultVal.placeholder = !disabled && (placeholder || `请选择${label}`) || '';
  }

  // 上传型控件
  if (['imgUpload', 'fileUpload', 'videoUpload', 'voiceUpload'].includes(type)) {
    defaultVal.name = 'file';
    defaultVal.action = '//up.qbox.me/';
    defaultVal.headers = { 'token': `${PublicService.getCookie('token')}` };
    val.data && (defaultVal.data = val.data);
  }


  return {
    ...defaultVal,
    ...itemProps,
  };
}

class FormItem extends Component {
  state = {};

  onKeyDown = (e) => {
    if(e.keyCode == 13) {
      this.props.onInputKeyDown && this.props.onInputKeyDown();
    }
  }

  // 渲染输入框
  renderInput = (item) => {
    return (
      <Input {...getDefaultProps(item, this.props)} onKeyDown={this.onKeyDown}/>
    );
  };

  // 渲染多行文本
  renderTextArea = (item) => {
    return (
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 5 }}
        {...getDefaultProps(item, this.props)} />
    );
  };

  // 渲染数值框
  renderNumber = (item) => {
    return (
      <InputNumber
        step={1}
        // max={10000}
        // min={0}
        {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染单选框
  renderRadio = (item) => {
    let { itemProps = {} } = item;
    let { options = [], inline } = itemProps;
    const radioStyle = {
      display: inline,
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Radio.Group
        {...getDefaultProps(item, this.props)}>
        {
          options && options.length > 0 &&
          options.map((o, i) => (
            <Radio style={{ ...radioStyle }} key={i + '-' + o.value} value={o.value}>{o.label}</Radio>
          ))
        }
      </Radio.Group>
    );
  };

  // 渲染多选框
  renderCheckBox = (item) => {
    let { itemProps = {} } = item;
    let { options = [], inline } = itemProps;
    const checkStyle = {
      display: inline,
      marginLeft: 0,
      marginRight: 8,
      height: '30px',
      lineHeight: '30px',
    };
    return (
      <Checkbox.Group
        {...getDefaultProps(item, this.props)}>
        {
          options && options.length > 0 &&
          options.map((o, i) => (
            <Checkbox style={{ ...checkStyle }} key={i + '-' + o.value} value={o.value}>{o.label}</Checkbox>
          ))
        }
      </Checkbox.Group>
    );
  };

  // 渲染时间
  renderTime = (item) => {
    return (
      <TimePicker
        hideDisabledOptions={true} // 将不可选的选项隐藏
        format={'HH:mm:ss'}
        {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染日期
  renderDatePicker = (item) => {
    return (
      <DatePicker {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染日期
  renderWeekPicker = (item) => {
    return (
      <DatePicker.WeekPicker {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染月区间
  renderRangeMonthPicker = (item) => {
    const t = this;
    let { monthOpen } = t.state;
    let { paramName } = item;

    // 关闭日期
    const handlePanelChange = (value) => {
      const { setFieldsValue } = this.props.form;
      if (value && value.length) {
        setFieldsValue({
          [paramName]: value,
        });
        this.setState({
          monthOpen: false,
        });
      }
    };
    return (
      <DatePicker.RangePicker
        mode={['month', 'month']}
        format={'YYYY-MM'}
        open={monthOpen}
        onOpenChange={open => this.setState({ monthOpen: open })}
        onPanelChange={handlePanelChange}
        {...getDefaultProps(item, this.props)}
      />
    );
  };

  // 渲染年
  renderYearPicker = (item) => {
    const { openPicker } = this.state;
    const onOpenChange = (status) => {
      this.setState({
        openPicker: status,
      });
    };

    const onDateChange = (type, value) => {
      const { setFieldsValue } = this.props.form;
      setFieldsValue({
        [type]: moment(value),
      }, () => {
        this.setState({
          openPicker: false,
        });
      });
    };

    return (
      <DatePicker
        mode={'year'}
        onOpenChange={onOpenChange}
        open={openPicker}
        onPanelChange={value => onDateChange(item.paramName, value)}
        format="YYYY"
        {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染月选择
  renderMonthPicker = (item) => {
    return (
      <DatePicker.MonthPicker{...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染时间段
  renderRangePicker = (item) => {
    return (
      <DatePicker.RangePicker
        ranges={{
          今天: [moment(moment().format('YYYY-MM-DD 08:00:00')), moment()],
          最近三天: [
            moment(
              moment()
                .subtract(3, 'day')
                .format('YYYY-MM-DD 00:00:00'),
            ),
            moment(),
          ],
          最近一周: [
            moment(
              moment()
                .subtract(7, 'day')
                .format('YYYY-MM-DD 00:00:00'),
            ),
            moment(),
          ],
          最近一月: [
            moment(
              moment()
                .subtract(1, 'month')
                .format('YYYY-MM-DD 00:00:00'),
            ),
            moment(),
          ],
        }}
        {...getDefaultProps(item, this.props)}
      />
    );
  };

  // 渲染下拉选
  renderSelect = (item) => {
    let { itemProps = {} } = item;
    let { options = [] } = itemProps;

    return (
      <Select
        optionFilterProp="children"
        {...getDefaultProps(item, this.props)}>
        {
          options && options.length > 0 &&
          options.map(option => (
              <Select.Option key={option.value} value={option.value} disabled={option.disabled} title={option.label}>
                {option.label}
              </Select.Option>
            ),
          )
        }
      </Select>
    );
  };

  // 渲染树下拉选
  renderTreeSelect = (item) => {
    return (
      <TreeSelect
        dropdownStyle={{ maxHeight: 500 }}
        showSearch={false}
        treeNodeFilterProp={'label'}
        treeNodeLabelProp={'label'}
        {...getDefaultProps(item, this.props)}
      />
    );
  };

  // 渲染级联
  renderCascade = (item) => {
    return (
      <Cascader {...getDefaultProps(item, this.props)}/>
    );
  };

  // 渲染上传按钮
  renderUploadButton = (disabled) => {
    if (!disabled) {
      return (
        <Button disabled={disabled}>
          <Icon type="upload"/> 上传
        </Button>
      );
    }
  };

  imgBeforeUpload = (item, file) => {
    console.log(item, file, 66666);
    // if(item.itemProps.maxSize) {
    //   if(file.size / 1024 > item.itemProps.maxSize) {
    //     message.warning(item.itemProps.maxSizeMessage);
    //     return false;
    //   }
    // }
  }

  // 渲染图片上传
  renderImgUpload = (item) => {
    const t = this;
    let { previewVisible, previewList = [], previewIndex, previewAngle = 0, zoomVal = 1 } = t.state;

    const props = {
      listType: 'picture-card',
      accept: 'image/*',
      onPreview: file => {
        let { fileList } = t.uploadImg.state;
        this.setState({
          previewList: fileList,
          previewIndex: file.index,
          previewVisible: true,
        });
      },
      ...getDefaultProps(item, this.props),
    };

    const uploadButton = (
      <div>
        <Icon type="plus"/>
      </div>
    );

    const iconStyle = {
      fontSize: 20,
      color: '#FFF',
      cursor: 'pointer',
    };

    // 渲染旋转
    const renderIndex = () => {
      const iconWrap = {
        position: 'absolute',
        width: 100,
        left: '50%',
        marginLeft: -50,
        top: 10,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'space-around',
        background: 'rgba(0,0,0,.3)',
        padding: '6px 0',
        color: '#fff',
        borderRadius: 4,
      };

      // 旋转切换
      const onSwitch = (type) => {
        let last = 3;
        if (type === '+') {
          previewAngle = previewAngle + 1;
          previewAngle = previewAngle > last ? 0 : previewAngle;
        } else {
          previewAngle = previewAngle - 1;
          previewAngle = previewAngle < 0 ? last : previewAngle;
        }
        this.setState({ previewAngle });
      };

      return (
        <div style={iconWrap}>
          <Icon type="redo" style={iconStyle} onClick={onSwitch.bind(t, '-')}/>
          <div>{`${previewIndex + 1} / ${previewList.length}`}</div>
          <Icon type="undo" style={iconStyle} onClick={onSwitch.bind(t, '+')}/>
        </div>
      );
    };

    // 渲染左右切换
    const renderSwitch = () => {
      if (previewList && previewList.length > 1) {
        const arrowWrap = {
          position: 'absolute',
          width: 60,
          height: 60,
          top: '50%',
          marginTop: -30,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'rgba(0,0,0,.3)',
          padding: '6px 0',
          borderRadius: '50%',
          cursor: 'pointer',
        };

        // 左右切换
        const onSwitch = (type) => {
          let last = previewList.length - 1;
          if (type === '+') {
            previewIndex = previewIndex + 1;
            previewIndex = previewIndex > last ? 0 : previewIndex;
          } else {
            previewIndex = previewIndex - 1;
            previewIndex = previewIndex < 0 ? last : previewIndex;
          }
          this.setState({ previewIndex, previewAngle: 0 });
        };

        return [
          <div key={'left'} style={{ ...arrowWrap, left: 0 }} onClick={onSwitch.bind(t, '-')}>
            <Icon type="arrow-left" style={iconStyle}/>
          </div>,
          <div key={'right'} style={{ ...arrowWrap, right: 0 }} onClick={onSwitch.bind(t, '+')}>
            <Icon type="arrow-right" style={iconStyle}/>
          </div>,
        ];
      }
    };

    const imgContent = {
      width: '100%',
      textAlign: 'center',
      height: 700,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    const imgWrap = {
      maxWidth: '100%',
      maxHeight: '100%',
      userSelect: 'none',
      cursor: 'move',
      transform: `rotate(${previewAngle * 90}deg) scale(${zoomVal})`,
    };

    // 鼠标滚轮
    const onWheel = (e) => {
      let { wheelDelta } = e.nativeEvent;
      zoomVal += wheelDelta / 1200;
      if (zoomVal >= 0.2) {
        this.setState({
          zoomVal,
        });
      } else {
        this.setState({
          zoomVal: 0.2,
        });
        return false;
      }
    };

    // 鼠标拖拽
    const handleDrag = (e) => {
      e.persist(); // 在jsx中需要用e.persist()此方法会从池中移除合成事件，允许用户代码保留对事件的引用,否则clientX会是null
      let { style, offsetLeft, offsetTop } = this.refs.zoomImg;
      const p = 'onmousemove';
      let x = e.clientX - offsetLeft;
      let y = e.clientY - offsetTop;
      style.position = 'absolute';
      document[p] = function(e) {
        style.left = e.clientX - x + 'px';
        style.top = e.clientY - y + 'px';
      };
      document.onmouseup = function() {
        document[p] = null;
      };
    };

    let previewImage;
    if (previewList && previewList.length && previewList[previewIndex]) {
      let { url, thumbUrl } = previewList[previewIndex];
      previewImage = url || thumbUrl;
    }
    return (
      <Upload {...props} ref={ref => t.uploadImg = ref} className={item.uploadButtonShow == false && 'uploadButtonHide'} beforeUpload={t.imgBeforeUpload.bind(t, item)}>
        {uploadButton}
        <Modal
          width={document.body.clientWidth - 200}
          visible={previewVisible}
          footer={null}
          onCancel={() => this.setState({ previewVisible: false, previewAngle: 0, zoomVal: 1 })}>
          <div style={imgContent}
               onWheel={onWheel}>
            <img
              ref='zoomImg'
              alt="example"
              style={imgWrap}
              src={previewImage}
              onDragStart={e => e.preventDefault()}
              onMouseDown={handleDrag}/>
          </div>

          {renderIndex()}
          {renderSwitch()}
        </Modal>
      </Upload>
    );
  };

  // 渲染附件上传
  renderFileUpload = (item) => {
    let { disabled } = this.props;

    let loading = null;
    const props = {
      ...getDefaultProps(item, this.props),
      onChange: ({file}) => {
        if(file.status == 'uploading') {
          loading = message.loading('上传中...', 0);
        }
      },
      onSuccess: (data) => {
        loading();
        item.itemProps && item.itemProps.onSuccess && item.itemProps.onSuccess(data);
      },
    };

    return (
      <Upload {...props}>
        {this.renderUploadButton(disabled)}
      </Upload>
    );
  };

  // 渲染视频上传
  renderVideoUpload = (item) => {
    let { previewVideoVisible, previewVideo } = this.state;
    let { disabled } = this.props;
    let loading = null;

    disabled = disabled || item.disabled;

    const props = {
      accept: 'video/*',
      onPreview: file => {
        this.setState({
          previewVideo: file.videoUrl || file.url,
          previewVideoVisible: true,
        });
      },
      onChange: ({file}) => {
        if(file.status == 'uploading') {
          loading = message.loading('上传中...', 0);
        }
      },
      ...getDefaultProps(item, this.props),
      onSuccess: (data) => {
        loading();
        item.itemProps && item.itemProps.onSuccess && item.itemProps.onSuccess(data);
      },
    };

    return (
      <Upload {...props}>
        {this.renderUploadButton(disabled)}
        <Modal
          width={700}
          visible={previewVideoVisible}
          footer={null}
          onCancel={() => this.setState({ previewVideoVisible: false })}>
          <video autoPlay controls src={previewVideo} style={{ width: '100%', height: 400 }}/>
        </Modal>
      </Upload>
    );
  };

  // 渲染附件上传
  renderVoiceUpload = (item) => {
    let { previewVoiceVisible, previewVoice } = this.state;
    let { disabled } = this.props;
    disabled = disabled || item.disabled;
    let loading = null;

    const props = {
      accept: 'audio/*',
      onPreview: file => {
        this.setState({
          previewVoice: file.url,
          previewVoiceVisible: true,
        });
      },
      onChange: ({file}) => {
        if(file.status == 'uploading') {
          loading = message.loading('上传中...', 0);
        }
      },
      ...getDefaultProps(item, this.props),
      onSuccess: (data) => {
        loading();
        item.itemProps && item.itemProps.onSuccess && item.itemProps.onSuccess(data);
      },
    };

    return (
      <Upload {...props}>
        {this.renderUploadButton(disabled)}
        <Modal
          visible={previewVoiceVisible}
          footer={null}
          onCancel={() => this.setState({ previewVoiceVisible: false })}>
          <audio controls style={{ width: '100%', height: 45 }} controlsList="nodownload">
            <source src={previewVoice} type="audio/mpeg"/>
            您的浏览器不支持 audio 标签。
          </audio>
        </Modal>
      </Upload>
    );
  };

  render() {
    const t = this;
    let { formItem = {}, form = {}, formItemLayout = {}, disabledType } = t.props;
    let { getFieldDecorator } = form;
    let {
      type, label, paramName, key, initialValue, required, rules = [],
      dataType, options, remoteOptions, dateModal,
    } = formItem;
    
    // 判断是否为远程
    if (dataType === 'remote') {
      options = [];
      if (remoteOptions && remoteOptions.length) {
        options = remoteOptions;
      }
    }

    // 处理默认日期
    if (['timePicker', 'datePicker', 'yearPicker', 'monthPicker'].includes(type) && dateModal === 'isCurrent') {
      initialValue = initialValue || moment();
    }

    // 处理上传类组件
    let itemConfig = {
      initialValue,
      rules,
    };
    if (required) {
      itemConfig.rules.push({
        required: true,
        message: `${['input', 'textArea', 'number'].includes(type) ? "请输入" : "请选择"}${label}！`,
      })
    }

    if (['imgUpload', 'fileUpload', 'videoUpload', 'voiceUpload'].includes(type)) {
      // 修改表单收集机制
      itemConfig.valuePropName = 'fileList';
      itemConfig.getValueFromEvent = ({ fileList }) => {
        let list = [];
        fileList.map((file, index) => {
          let data = { ...file };
          if (file.response && file.response.ret) {
            let { seaWeedfsMasterUrl, fid, id } = file.response.ret;
            data.index = index;
            data.id = id;
            data.url = seaWeedfsMasterUrl + fid;
          }

          list.push();
        });

        return list;
      };

      // 处理默认值增加uid
      if (initialValue && initialValue.length) {
        initialValue.map((v, vI) => {
          v.index = vI;
          v.uid = vI;
        });
      }
    }

    const FORM = {
      'input': t.renderInput,             // 输入框
      'textArea': t.renderTextArea,       // 多行输入
      'number': t.renderNumber,           // 数值
      'radio': t.renderRadio,             // 单选
      'checkbox': t.renderCheckBox,       // 多选
      'timePicker': t.renderTime,         // 时间选择器
      'datePicker': t.renderDatePicker,   // 日期选择器
      'weekPicker': t.renderWeekPicker,   // 星期选择器
      'monthPicker': t.renderMonthPicker, // 月选择器
      'rangeMonthPicker': t.renderRangeMonthPicker, // 月区间选择器
      'yearPicker': t.renderYearPicker,   // 年选择器
      'rangePicker': t.renderRangePicker, // 时间段选择器
      'select': t.renderSelect,           // 下拉选
      'treeSelect': t.renderTreeSelect,   // 树下拉
      'cascade': t.renderCascade,         // 级联下拉

      'imgUpload': t.renderImgUpload,     // 图片上传
      'fileUpload': t.renderFileUpload,   // 文件上传
      'videoUpload': t.renderVideoUpload, // 视频上传
      'voiceUpload': t.renderVoiceUpload, // 语音上传
    };
    return (
      <Form.Item label={label} {...formItemLayout} className={disabledType == 'readOnly' && 'form-item-read-only' || ''}>
        {
          FORM[type] &&
          getFieldDecorator(paramName || key, { ...itemConfig })(
            FORM[type]({ ...formItem, options }),
          )
        }
      </Form.Item>
    );
  }
}

export default FormItem;
