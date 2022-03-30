import { useLayoutEffect, useState } from 'react';

const useMobileLayout = () => {
  let [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
  useLayoutEffect(() => {
    function getWindowWidth () {
      setWindowWidth(document.documentElement.offsetWidth);
    }

    window.addEventListener('resize', getWindowWidth);

    return () => {
      window.removeEventListener('resize', getWindowWidth);
    };
  }, []);
  return windowWidth <= 1080;
};

export default useMobileLayout;
