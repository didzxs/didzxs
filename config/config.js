// ref: https://umijs.org/config/
import pageRoutes from './router.config';
import defaultSettings from '../src/defaultSettings';

export default {
  alias: {
    '@': require('path').resolve(__dirname, 'src'),
  },
  treeShaking: true,
  routes: pageRoutes, // 配置式路由,移除该配置为约定式路由
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: {
          hmr: true,
        },
        dynamicImport: {
          webpackChunkName: true,
          loadingComponent: './components/common/PageLoading/index',
        },
        title: '鼎泰',
        dll: true,
        routes: {
          exclude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//,
          ],
        },
        metas: [
          { charset: 'utf-8' },
        ],
        links: [
          { rel: 'icon', href: './favicon.png', type: 'image/x-icon' },
          { rel: 'stylesheet', href: '//at.alicdn.com/t/font_2303131_5fez5j0luhh.css' }, // 公共组件图标
          { rel: 'stylesheet', href: '//at.alicdn.com/t/font_2651565_4ugvczo4bnm.css' }, // 鼎泰组件图标
        ],
      },
    ],
  ],
  theme: {
    'primary-color': defaultSettings.primaryColor,
    'link-color': '#1890ff', // 链接色
    'success-color': '#52c41a', // 成功色
    'warning-color': '#faad14', // 警告色
    'error-color': '#f5222d', // 错误色
    'font-size-base': '14px', // 主字号
    'heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
    'text-color': 'rgba(0, 0, 0, 1)', // 主文本色
    'text-color-secondary ': 'rgba(0, 0, 0, .45)', // 次文本色
    'disabled-color ': 'rgba(0, 0, 0, .25)', // 失效色
    'border-radius-base': '4px', // 组件浮层圆角
    'border-color-base': '#d9d9d9', // 边框色
    'box-shadow-base': '0 2px 8px rgba(0, 0, 0, 0.15)', // 浮层阴影
  },
  history: 'hash',
  publicPath: './',
  hash: true,
  proxy: {
    "/api": {
      // "target": "http://dingtai119.com/",
      "target": "http://qa.dingtai119.com/",
      "changeOrigin": true, // 是否跨域
    },
  },
};

