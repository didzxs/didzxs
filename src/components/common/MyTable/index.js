/***
 * table组件 定制了表头样式
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import PublicService from '../../../services/PublicService';

class MyTable extends Component {
  static defaultProps = {
    columnLayer: 1, // 头部的层级(以children来划分)
    heightAuto: false, // 自动获取高度
    editCode: null, // 编辑按钮权限
  };

  state = {
    tableHeight: 700,
  };

  componentDidMount() {
    let { heightAuto } = this.props;
    if (heightAuto) {
      window.setTimeout(() => {
        this.setTableHeight();
      }, 10);
    }
  };

  // 设置表格的高度
  setTableHeight = () => {
    let { columnLayer } = this.props;
    let tableHeight = 700;
    let tableHeaderHeight = document.getElementsByClassName('ant-table-thead')[0].offsetHeight; // table头高度
    let ContainerHeader = document.getElementById('container'); // 获取按钮组的高度
    let PublicContainerHeader = document.getElementById('PublicContainerHeader'); // 获取按钮组的高度
    let PublicPageHeader = document.getElementById('PublicPage'); // 获取按钮组的高度
    if (ContainerHeader) {
      tableHeight = ContainerHeader.offsetHeight - 20 - (columnLayer * 30);
    }
    if (PublicContainerHeader) {
      let PublicContainerHeaderHeight = PublicContainerHeader.offsetHeight;
      tableHeight = tableHeight - PublicContainerHeaderHeight;
    }
    if (PublicPageHeader) {
      let PublicPageHeaderHeight = PublicPageHeader.offsetHeight;
      tableHeight = tableHeight - PublicPageHeaderHeight - 6;
    }
    if (tableHeaderHeight > 40) {
      tableHeight = tableHeight - tableHeaderHeight + 22;
    }
    this.setState({
      tableHeight,
    });
  };

  getScroll = () => {
    const t = this;
    let { scroll, heightAuto, columns } = this.props;
    let { tableHeight } = t.state;
    let SCROLL = scroll || {};
    if (heightAuto) {
      if (scroll && scroll.x) {
        SCROLL.x = scroll.x;
      } else {
        let WIDTH = document.body.clientWidth;
        if (WIDTH < 1500) {
          let x = PublicService.getTableWidth(columns);
          if (x >= 1050) {
            SCROLL.x = x;
          }
        }
      }
      SCROLL.y = SCROLL.y || tableHeight;
    }
    return SCROLL;
  };

  render() {
    const t = this;
    return (
      <div className="wp-table">
        <Table
          bordered
          pagination={false}
          size={"middle"}
          {...this.props}
          scroll={{...(t.getScroll()), ...t.props.scroll}}
        />
      </div>
    );
  }
}

export default MyTable;
