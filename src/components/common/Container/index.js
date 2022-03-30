/***
 * 容器组件
 */
import React, { Component } from 'react';
import { Dropdown, Upload, message, Popconfirm, Menu } from 'antd';
import MyIcon from '../MyIcon/index';
import PublicService from '../../../services/PublicService';
import styles from './index.less';

class Container extends Component {
  static defaultProps = {
    extraHeight: 0, // 额外需要减去的高度
    heightAuto: false,
  };

  state = {
    containerHeight: 10,
  };

  componentDidMount() {
    let { heightAuto } = this.props;
    if (heightAuto) {
      this.setContainerHeight();
    }
  }

  // 设置高度
  setContainerHeight = () => {
    let containerHeight = window.innerHeight - 30; // 窗口的高度减去margin
    let { extraHeight } = this.props;
    let filtrate = document.getElementById('filtrate');  // 获取filtrate组件的高度
    let tabs = document.getElementsByClassName('ant-tabs-bar'); // 获取tabs的高度
    let app = document.getElementsByClassName('ant-layout-header'); // 获取顶部导航栏的高度

    // 额外的高度
    if (extraHeight) {
      containerHeight = containerHeight - extraHeight;
    }

    // 含有filtrate时的操作
    if (filtrate) {
      let filtrateHeight = filtrate.offsetHeight;
      if (filtrateHeight) {
        containerHeight = containerHeight - filtrateHeight;
      }
    }
    // 含有tab页时的操作
    if (tabs && tabs.length) {
      let tabsHeight = tabs[0].offsetHeight;
      if (tabsHeight) {
        containerHeight = containerHeight - tabsHeight;
      }
    }
    // 减去头部
    if (app && app.length) {
      let appHeight = app[0].offsetHeight;
      if (appHeight) {
        containerHeight = containerHeight - appHeight;
      }
    }
    this.setState({
      containerHeight,
    }, () => {
      let { getContainerHeight } = this.props;
      getContainerHeight && getContainerHeight(containerHeight);
    });
  };

  // 渲染按钮
  renderBtnItem = ({ text, onClick, color, icon }) => {
    return (
      <div onClick={onClick} className={styles.functionItem}>
        <MyIcon type={icon} style={{ marginRight: 6, fontSize: 16, color }}/>
        <span>{text}</span>
      </div>
    );
  };

  menuImport = () => {
    const t = this;
    let { importBtnUrl, upSuccess, templateUrl, onTemplate, importProps = {} } = t.props;
    const uploadProps = {
      name: importProps.name || 'file',
      action: importBtnUrl,
      accept: '.xls, .xlsx',
      data: importProps.data || {},
      headers: { 'token': `${PublicService.getCookie('token')}` },
      showUploadList: false,
      onChange(info) {
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} 上传成功`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} 上传失败`);
        }
      },
      onSuccess(info) {
        if (info.retcode !== 0) {
          message.error(info.err || info.message || info.msg, importProps.messageTime);
        } else {
          message.success('文件上传成功');
          upSuccess && upSuccess();
        }
      },
    };
    return (
      <Menu>
        <Menu.Item key="0" style={{ textAlign: 'center' }}>
          <Upload {...uploadProps}>
            <span>导入</span>
          </Upload>
        </Menu.Item>
        {
          templateUrl &&
          <Menu.Item key="1">
            <span className={styles.exportLine}> </span>
            <span><a href={templateUrl} style={{ color: '#6b6b6b' }}>下载模板</a></span>
          </Menu.Item>
        }
        {
          onTemplate &&
          <Menu.Item key="2">
            <span className={styles.exportLine}> </span>
            <span onClick={onTemplate}><a style={{ color: '#6b6b6b' }}>下载模板</a></span>
          </Menu.Item>
        }
      </Menu>
    );
  };

  render() {
    let t = this;
    let { containerHeight } = t.state;
    let { heightAuto, style, extraBtn, addBtn, addBtnText, headerShow = true, exportBtn, exportBtnText, importBtnText } = t.props;

    return (
      <div className={styles.container} style={{ height: heightAuto ? containerHeight : null, ...style }}
           id="container">
        {
          headerShow &&
          <div className={styles.header} id='PublicContainerHeader'>
            {/* 新增 */}
            {
              addBtn &&
              t.renderBtnItem({
                text: addBtnText || '新增',
                onClick: addBtn,
                color: '#4977E9',
                icon: 'iconxinzeng',
              })
            }

            {/* 导出 */}
            {
              exportBtn &&
              t.renderBtnItem({
                text: exportBtnText || '导出',
                onClick: exportBtn.bind(t, 'all'),
                color: '#EC9D38',
                icon: 'iconwenjiandaochu',
              })
            }

            {/* 导出本页/导出全部 */}
            {
              t.props.exportBtnShowAll &&
              <Popconfirm
                onConfirm={exportBtn.bind(t, 'all')}
                onCancel={exportBtn.bind(t, 'part')}
                title={`${t.props.text ? t.props.text : '导出全部'} / ${t.props.cancelText ? t.props.cancelText : '导出本页'}?`}
                okText={t.props.text || '导出全部'}
                cancelText={t.props.cancelText || '导出本页'}
                placement="bottom">
                {
                  t.renderBtnItem({ text: '导出', color: '#EC9D38', icon: 'iconwenjiandaochu' })
                }
              </Popconfirm>
            }

            {/* 导入 */}
            {
              t.props.importBtnUrl && t.props.importBtnShow &&
              <Dropdown overlay={t.menuImport} trigger={['click']}>
                {
                  t.renderBtnItem({ text: importBtnText || '导入', color: '#39BBFF', icon: 'iconwenjiandaoru' })
                }
              </Dropdown>
            }


            {/* 编辑 */}
            {
              t.props.editBtn &&
              t.renderBtnItem({ text: '编辑', onClick: t.props.editBtn, color: '#16b8be', icon: 'iconbianji' })
            }

            {/* 删除 */}
            {
              t.props.deleteBtn &&
              t.renderBtnItem({ text: '删除', onClick: t.props.deleteBtn, color: '#F12E28', icon: 'iconshanchu1' })
            }

            {/* 自定义 */}
            {
              extraBtn && extraBtn.length > 0 &&
              extraBtn.map((item, index) => {
                return (
                  <span key={index}>{t.renderBtnItem(item)}</span>
                );
              })
            }
          </div>
        }

        <div>
          {t.props.children}
        </div>
      </div>
    );
  }
}


export default Container;
