import { useEffect, useState } from 'react';
import request from '../../utils/request';

const useGetSelect = (props) => {
  let { url, params = {}, value = 'id', label = 'name' } = props;
  let [list, setList] = useState([]);

  useEffect(() => {
    getSelect();
  }, [])

  const getSelect = () => {
    request({ url, method: 'GET', params })
      .then(res => {
        console.log('res', res)
        if(res && res.retcode == 0) {
          let list = []
          res.data.map(item => {
            list.push({ value: item[value], label: item[label] })
          })
          setList(list);
        }
      })
  }
  return list;
}

export default useGetSelect;