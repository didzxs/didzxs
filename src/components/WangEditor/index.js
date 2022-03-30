import React, { Component } from 'react';
import WEditor from 'wangeditor';
import config from '../../config';
import styles from './index.less';

let editor = null;

class WangEditor extends Component {
  componentDidMount() {
    this.initEditor();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.content != this.props.content) {
      editor.txt.html(nextProps.content);
    }
  }

  initEditor = () => {
    let { id = 'wEditer', height = 350, uploadToken = '', getEditorContent, content } = this.props;
    editor = new WEditor(`#${id}`);
    editor.config.height = height; // 设置编辑区域高度
    // editor.config.uploadImgServer = '//up.qbox.me/';
    // editor.config.uploadImgParams = {
    //   file: '(binary)',
    //   token: uploadToken,
    // }

    // 自定义上传功能
    editor.config.customUploadImg = (files, insertImgFn) => {
      for(let i = 0; i < files.length; i++) {
        const fileData = new FormData();
        fileData.append("file", files[i]);
        fileData.append("token", uploadToken);
        let url = "http://up.qbox.me/";
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if(xhr.response) {
              let data = JSON.parse(xhr.response);
              insertImgFn(config.viewImgUrl + data.key);
            }
          }
        }
        xhr.open("POST", url, true);
        xhr.send(fileData);
      }
    };

    editor.config.onchange = (newHtml) => {
      getEditorContent && getEditorContent(newHtml);
    }
    editor.create();

    if(this.props.disabled) {
      editor.disable();
    }
    
    editor.txt.html(content);
  }

  componentWillUnmount() {
    editor.destroy();
  }

  render() {
    let t = this;
    let { id = 'wEditer' } = t.props;

    return (
      <div className={styles['wang-editor-container']}>
        <div id={id}></div>
      </div>
    );
  }
}

export default WangEditor;