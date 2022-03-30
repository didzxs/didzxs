import { Editor } from '@tinymce/tinymce-react';
import React, { Component } from 'react';

class TinymceEditor extends Component {

  handleEditorChange = (content, editor) => {
    console.log('Content was updated:', content);
  }

  render() {
    let t = this;
    let { height = 400, content } = t.props;

    let editorInit = {
      language:'zh_CN',
      height,
      min_height: 200,
      readonly: true,
      plugins: 'print preview searchreplace autolink directionality visualblocks visualchars emoticons image imagetools link media template code codesample hr charmap table pagebreak nonbreaking anchor insertdatetime advlist lists wordcount textpattern help autosave formatpainter',
      toolbar: 'undo redo restoredraft | cut copy paste pastetext | forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent | \
      formatselect fontselect fontsizeselect | image media | bullist numlist | blockquote subscript superscript removeformat | \
      table charmap emoticons hr pagebreak insertdatetime print preview | fullscreen | lineheight formatpainter',
      fontsize_formats: '11px 12px 14px 16px 18px 24px 36px 48px', // 设置文字大小列表
      file_picker_types: 'image',
      // automatic_uploads={false}        
      images_upload_url: 'https://edu.momself.cn/backend/api/v1/upload/image/tinymce',
      image_uploadtab: true,
      branding: false,
    }

    return (
      <div className='tinymce-editor-container'>
        <Editor    
          inline={false}
          apiKey='rkm1gp29y1qj8tvsta39u7i4826my6uqqoi1tq6pho2rbvv6'
          value={content}
          onEditorChange={t.handleEditorChange}
          init={editorInit}
        />  
      </div>
    );
  }
}

export default TinymceEditor;