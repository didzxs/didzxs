import { useEffect, useState } from 'react';
import request from '../../utils/request';

const useQiniuToken = () => {
  let [token, setToken] = useState();
  useEffect(() => {
    getUploadToken();
  }, [])
  // 获取七牛上传token
  const getUploadToken = () => {
    request({url: '/api/qiniu/uptoken', method: 'GET'})
      .then(res => {
        if(res) {
          setToken(res.data);
        }
      })
  }
  return token;
}

export default useQiniuToken;