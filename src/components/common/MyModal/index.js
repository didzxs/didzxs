/**
 * 公共弹框组件
 */
import React, {Component} from 'react';
import {Modal, Button} from 'antd';
import styles from './index.less';

class MyModal extends Component {
  static defaultProps = {
    drag: true
  };

  state = {};

  componentDidMount() {
    let t = this;
    let {drag} = t.props;
    drag && t.modalDraggable();
  };

  // 模态框拖拽事件
  modalDraggable = () => {
    let modalList = document.getElementsByClassName("ant-modal");
    let modalHeaderList = document.getElementsByClassName("ant-modal-header");
    console.log("modalHeaderList:", modalHeaderList);
    for (let i = 0; i < modalHeaderList.length; i++) {
      // 获取模态框及模态框的头部
      let modal = modalList[i];
      let header = modalHeaderList[i];
      let width = document.body.clientWidth / 2;
      let modalWidth = header.offsetWidth / 2;
      console.log("header:", header);
      // 设置模态框的位置
      if (header) {
        modal.style.position = 'absolute';
        modal.style.left = width - modalWidth + 'px';
        // 模态框头部按下事件
        header.onmousedown = function (ev) {
          /*
          * oEvent.clientX 当前鼠标的位置
          * modal.offsetLeft 当前模态框距离浏览器边界的距离
          * 当前鼠标在模态框上的位置 = 当前鼠标的位置 - 当前模态框距离浏览器边界的距离
          * */
          let oEvent = ev || window.event;
          let disX = oEvent.clientX - modal.offsetLeft;
          let disY = oEvent.clientY - modal.offsetTop;

          // 设置捕获范围  整个浏览器范围内被触发
          if (header.setCapture) {
            header.onmousemove = fnMove;
            header.onmouseup = fnUp;

            header.setCapture();
          } else {
            document.onmousemove = fnMove;
            document.onmouseup = fnUp;
          }

          // 鼠标移动
          function fnMove(ev) {
            /*
            * oEvent.clientX 当前鼠标的位置
            * disX 当前鼠标在模态框上的位置
            * 模态框到浏览器边界的距离 = 当前鼠标的位置 - 当前鼠标在模态框上的位置
            * */
            let oEvent = ev || window.event;
            let l = oEvent.clientX - disX;
            let t = oEvent.clientY - disY;

            // 设置鼠标按下时的样式
            header.style.cursor = 'move';

            // 加入边界检测
            let Width = document.body.clientWidth;
            let Height = document.body.clientHeight;
            let modalWidth = modal.offsetWidth;
            let modalHeight = modal.offsetHeight;
            if (t < 0) {
              t = 0;
            } else if ((t + modalHeight) > Height) {
              t = Height - modalHeight;
            } else if (l < 0) {
              l = 0;
            } else if ((l + modalWidth) > Width) {
              l = Width - modalWidth;
            }

            // 阻止模态框从四个角被拖出
            if (t <= 0 && l <= 0) {
              t = 0;
              l = 0;
            } else if (l <= 0 && (t + modalHeight) >= Height) {
              l = 0;
              t = Height - modalHeight;
            } else if (t <= 0 && (l + modalWidth) >= Width) {
              t = 0;
              l = Width - modalWidth;
            } else if ((t + modalHeight) >= Height && (l + modalWidth) >= Width) {
              t = Height - modalHeight;
              l = Width - modalWidth;
            }

            // 设置模态框的位置
            modal.style.left = l + 'px';
            modal.style.top = t + 'px';
          }

          // 鼠标抬起
          function fnUp() {
            // 设置鼠标抬起恢复默认样式
            header.style.cursor = 'default';

            //清除事件
            this.onmousemove = null;
            this.onmouseup = null;

            //取消捕获范围 用于处理IE下的问题
            if (this.releaseCapture) {
              this.releaseCapture();
            }
          }

          //用于处理FF和Chrome下的问题
          return false;
        };
      }

    }
  };

  // 渲染底部
  renderFooter() {
    let t = this;
    let {footerShow, modalBtnLoading = false} = t.props;

    if (footerShow) {
      let {
        TSBtn, TSTitle = "暂存", onTS,
        returnBtn, returnTitle = "退回", onReturnBack,
        saveBtn = true, saveTitle = "保存", onModalSave, // 默认展示保存按钮
        submitBtn, submitTitle = "提交", onSubmit,
        cancelBtn,cancelTitle = "取消", onCancel,
        buttonList = [] // 自定义按钮
      } = t.props;

      // 默认按钮
      let defaultBtnList = [
        ...(TSBtn ? [{title: TSTitle, onClick: onTS, className: styles.saveBtn}] : []), // 暂存
        ...(saveBtn ? [{title: saveTitle, onClick: onModalSave, className: styles.saveBtn}] : []), // 退回
        ...(returnBtn ? [{title: returnTitle, onClick: onReturnBack, className: styles.cancelBtn}] : []), // 保存
        ...(submitBtn ? [{title: submitTitle, onClick: onSubmit, className: styles.submitBtn}] : []), // 提交
        ...(cancelBtn ? [{title: cancelTitle, onClick: onCancel, className: styles.cancelBtn}] : []), // 取消
        ...buttonList // 自定义按钮列表
      ];
      return (
        <div className={styles.showCenter}>
          {
            defaultBtnList.map((item, index) => (
              <Button
                key={index}
                loading={modalBtnLoading}
                className={item.className}
                type={item.type}
                onClick={item.onClick}>
                {item.title}
              </Button>
            ))
          }
        </div>
      )
    } else {
      return false;
    }
  }

  render() {
    let t = this;
    let {className, ...props} = t.props;
    return (
      <Modal
        maskClosable={false}
        className={`${styles.commonModal} ${className}`}
        footer={t.renderFooter()}
        {...props}>
        {t.props.children}
      </Modal>
    )
  }
}


export default MyModal;
