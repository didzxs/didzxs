 const UserRoles = [
  { type: 'admin', home_link: '/web/HomePage', role: 'admin' },
  { type: 'yunying', home_link: '/web/CommodityEdit?status=0', role: 'yunying' },
  { type: 'yunying-mgr', home_link: '/web/CommodityEdit?status=0', role: 'yunying_mgr' },
  { type: 'gongcheng', home_link: '/web/ProjectOrder', role: 'gongcheng' },
  { type: 'gc-weibao', home_link: '/web/ProjectOrder', role: 'gc_weibao' },
  { type: 'gc-zhihuixiaofang', home_link: '/web/ProjectOrder', role: 'gc_zhihuixiaofang' },
  { type: 'gc-gongcheng', home_link: '/web/ProjectOrder', role: 'gc_gongcheng' },
  { type: 'gc-chengben', home_link: '/web/ProjectOrder', role: 'gc_chengben' },
  { type: 'huiyuan', home_link: '/web/ShoppingMall', role: 'huiyuan' },
  { type: 'kefu', home_link: '/web/IntentionToOrder', role: 'kefu' },
  { type: 'kefu_mgr', home_link: '/web/IntentionToOrder', role: 'kefu_mgr' },
  { type: 'xiaoshou-mgr', home_link: '/web/IntentionToOrder-wfp?assigned=-2', role: 'xiaoshou_mgr' },
  { type: 'xiaoshou', home_link: '/web/IntentionToOrder-wfp?assigned=-2', role: 'xiaoshou' },
  { type: 'xiaoshou-shangzhi', home_link: '/web/OrderList-kf?orderType=0', role: 'xiaoshou_sz' },
  { type: 'cangku', home_link: '/web/OrderList-cangku?orderType=1', role: 'cangku' },
  { type: 'cangku-qiantai', home_link: '/web/OrderList-cangku?orderType=1', role: 'cangku_qt' },
  { type: 'caiwu', home_link: '/web/HomePage', role: 'caiwu' },
  { type: 'caiwu-chuna', home_link: '/web/OrderForm', role: 'caiwu_cn' },
  { type: 'caigou', home_link: '/web/OrderForm', role: 'caigou' },
  { type: 'hr', home_link: '/web/TalentRecruitment', role: 'hr' },
];

export default UserRoles;
