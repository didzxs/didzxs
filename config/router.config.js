export default [
  {
    path: '/Login',
    component: '../layouts/Login',
  },
  { path: '/web/ShoppingMall', component: '../pages/ShoppingMall/index', breadcrumb: '商城首页' },
  { path: '/web/ProductClassify', component: '../pages/ShoppingMall/ProductList', breadcrumb: '商品分类' },
  { path: '/web/BrandPavilion', component: '../pages/ShoppingMall/BrandPavilion', breadcrumb: '品牌馆' },
  { path: '/web/SearchProduct', component: '../pages/ShoppingMall/SearchProduct', breadcrumb: '商品列表' },
  { path: '/web/SearchProduct-keyword', component: '../pages/ShoppingMall/SearchProduct', breadcrumb: '商品列表' },
  { path: '/web/ProductDetail', component: '../pages/ShoppingMall/ProductDetail', breadcrumb: '商品详情' },
  { path: '/web/MyShoppingCart', component: '../pages/ShoppingMall/MyShoppingCart', breadcrumb: '我的购物车' },
  { path: '/web/HelpCenter', component: '../pages/ShoppingMall/HelpCenter/index', breadcrumb: '我的购物车' },
  {
    path: '/h5/CommunicationList',
    component: '../pages/CommunicationList',
  },
  { path: '/h5/IntentionToOrder-all', component: '../pages/h5/IntentionToOrder/index', breadcrumb: '全部订单' },
  { path: '/h5/IntentionToOrder-wfp', component: '../pages/h5/IntentionToOrder/index', breadcrumb: '未分配的意向订单' },
  { path: '/h5/IntentionToOrder-yfp', component: '../pages/h5/IntentionToOrder/index', breadcrumb: '已分配的意向订单' },
  { path: '/h5/OrderListTD', component: '../pages/h5/OrderList/index', breadcrumb: '退单申请表' },
  { path: '/h5/AccountForSales', component: '../pages/h5/AccountForSales/index', breadcrumb: '销售明细表' },
  { path: '/h5/SummaryOfSales-SP', component: '../pages/h5/SummaryOfSales/index', breadcrumb: '销售汇总表(按商品)' },
  { path: '/h5/SummaryOfSales-KH', component: '../pages/h5/SummaryOfSales/index', breadcrumb: '销售汇总表(按客户)' },
  { path: '/h5/SummaryOfSales-XS', component: '../pages/h5/SummaryOfSales/index', breadcrumb: '销售汇总表(按销售人员)' },
  { path: '/h5/SummaryOfSales-FL', component: '../pages/h5/SummaryOfSales/index', breadcrumb: '销售汇总表(按分类)' },
  { path: '/h5/SalesStatistics-SP', component: '../pages/h5/SalesStatistics/index', breadcrumb: '销售排名(按商品)' },
  { path: '/h5/SalesStatistics-HY', component: '../pages/h5/SalesStatistics/index', breadcrumb: '销售排名(按会员)' },
  { path: '/h5/AccountsReceivable', component: '../pages/h5/AccountsReceivable/index', breadcrumb: '应收账款明细表' },
  { path: '/h5/AccountSummary', component: '../pages/h5/AccountSummary/index', breadcrumb: '应收/付账款汇总表' },
  { path: '/h5/OrderList-sz', component: '../pages/h5/OrderList/index', breadcrumb: '订单确认' },
  { path: '/h5/OrderPriceEdit-sz', component: '../pages/h5/OrderList/PriceEdit', breadcrumb: '订单价格编辑' },
  {
    path: '/web',
    component: '../layouts/index',
    breadcrumb: null,
    routes: [
      { path: '/', redirect: '/Login' },
      { path: '/web', redirect: '/web/HomePage' },
      { path: '/web/CommodityBrand', component: '../pages/CommodityBrand/index', breadcrumb: '进销存中心/商品品牌' },
      { path: '/web/CommodityCategory', component: '../pages/CommodityCategory/index', breadcrumb: '进销存中心/商品分类' },
      { path: '/web/CommodityProperty', component: '../pages/CommodityProperty/index', breadcrumb: '进销存中心/商品规格' },
      { path: '/web/CommodityManage', component: '../pages/CommodityManage/index', breadcrumb: '进销存中心/商品管理' },
      { path: '/web/InventoryWarning', component: '../pages/InventoryWarning/index', breadcrumb: '进销存中心/缺货预警' },
      { path: '/web/UnsoldGoodsWarning', component: '../pages/UnsoldGoodsWarning/index', breadcrumb: '进销存中心/滞销品管理' },
      { path: '/web/SupplierManagement', component: '../pages/SupplierManagement/index', breadcrumb: '进销存中心/供应商管理' },
      { path: '/web/UnitOfMeasurement', component: '../pages/UnitOfMeasurement/index', breadcrumb: '进销存中心/计量单位' },

      { path: '/web/MemberList', component: '../pages/MemberList/index', breadcrumb: '人事管理/会员管理/会员列表' },
      { path: '/web/SalesStatistics-SP', component: '../pages/SalesStatistics/index', breadcrumb: '销售排名(按商品)' },
      { path: '/web/SalesStatistics-HY', component: '../pages/SalesStatistics/index', breadcrumb: '销售排名(按会员)' },
      { path: '/web/SalesStatistics-XS', component: '../pages/SalesStatistics/index', breadcrumb: '销售排名(按销售)' },
      { path: '/web/UsersList', component: '../pages/UsersList/index', breadcrumb: '人事管理/用户列表' },

      { path: '/web/ProjectOrder', component: '../pages/ProjectOrder/index', breadcrumb: '工程中心/工程订单列表' },

      { path: '/web/NewsInformation', component: '../pages/NewsInformation/index', breadcrumb: '信息管理/新闻资讯' },

      { path: '/web/TalentRecruitment', component: '../pages/TalentRecruitment/index', breadcrumb: '人才招聘' },
      { path: '/web/CustomerMessage', component: '../pages/CustomerMessage/index', breadcrumb: '客户留言' },

      { path: '/web/BannerManagement', component: '../pages/BannerManagement/index', breadcrumb: 'banner管理' },

      { path: '/web/OrderForm', component: '../pages/OrderForm/index', breadcrumb: '采购单' },
      { path: '/web/CreditOrder', component: '../pages/OrderForm/CreditOrder', breadcrumb: '购货退货单' },

      { path: '/web/ProdSendAndReceiveDetailed', component: '../pages/ProdSendAndReceiveDetailed/index', breadcrumb: '仓库报表/商品收发明细表' },
      { path: '/web/ProdSendAndReceiveSummary', component: '../pages/ProdSendAndReceiveSummary/index', breadcrumb: '仓库报表/商品收发汇总表' },

      { path: '/web/AccountPayee', component: '../pages/AccountPayee/index', breadcrumb: '收款账户设置' },
      { path: '/web/ClosingEntries', component: '../pages/ClosingEntries/index', breadcrumb: '结账记录' },

      { path: '/web/EngineeringStatistic', component: '../pages/EngineeringStatistic/index', breadcrumb: '工程相关统计' },

      // 运营人员
      { path: '/web/CommodityEdit', component: '../pages/CommodityEdit/index', breadcrumb: '商品编辑发布' },
      { path: '/web/CommodityReleased', component: '../pages/CommodityEdit/index', breadcrumb: '商品已发布列表' },
      { path: '/web/CommodityPromotion', component: '../pages/CommodityEdit/index', breadcrumb: '促销商品设置' },
      { path: '/web/CommodityHot', component: '../pages/CommodityEdit/index', breadcrumb: '热销商品设置' },
      { path: '/web/CommoditySalesVolume', component: '../pages/CommodityEdit/index', breadcrumb: '商品销量设置' },
      { path: '/web/ServiceToCommunicate', component: '../pages/ServiceToCommunicate/index', breadcrumb: '客服待沟通' },

      // 客服
      { path: '/web/IntentionToOrder', component: '../pages/IntentionToOrder/index', breadcrumb: '意向订单' },
      { path: '/web/OrderList-kf', component: '../pages/OrderList/index', breadcrumb: '订单确认' },
      { path: '/web/OrderPriceEdit-sz', component: '../pages/OrderList/PriceEdit', breadcrumb: '订单价格编辑' },

      // 会员
      { path: '/web/PersonalInfo', component: '../pages/PersonalInfo/index', breadcrumb: '个人信息' },
      { path: '/web/ShippingAddress', component: '../pages/ShippingAddress/index', breadcrumb: '收货地址' },
      { path: '/web/MyOrderList', component: '../pages/OrderList/index', breadcrumb: '我的订单列表' },
      // { path: '/web/ShoppingMall', component: '../pages/ShoppingMall/index', breadcrumb: '商城首页' },
      // { path: '/web/ProductClassify', component: '../pages/ShoppingMall/ProductList', breadcrumb: '商品分类' },
      // { path: '/web/BrandPavilion', component: '../pages/ShoppingMall/BrandPavilion', breadcrumb: '品牌馆' },
      // { path: '/web/SearchProduct', component: '../pages/ShoppingMall/SearchProduct', breadcrumb: '商品列表' },
      // { path: '/web/SearchProduct-keyword', component: '../pages/ShoppingMall/SearchProduct', breadcrumb: '商品列表' },
      // { path: '/web/ProductDetail', component: '../pages/ShoppingMall/ProductDetail', breadcrumb: '商品详情' },
      // { path: '/web/MyShoppingCart', component: '../pages/ShoppingMall/MyShoppingCart', breadcrumb: '我的购物车' },
      { path: '/web/MarketReceipt', component: '../pages/MarketReceipt/index', breadcrumb: '销售开票' },

      // 销售
      { path: '/web/IntentionToOrder-wfp', component: '../pages/IntentionToOrder/index', breadcrumb: '未分配的意向订单' },
      { path: '/web/IntentionToOrder-yfp', component: '../pages/IntentionToOrder/index', breadcrumb: '已分配的意向订单' },
      { path: '/web/OrderListTD', component: '../pages/OrderList/index', breadcrumb: '退单申请列表' },
      { path: '/web/AccountForSales', component: '../pages/AccountForSales/index', breadcrumb: '销售明细表' },
      { path: '/web/SummaryOfSales-SP', component: '../pages/SummaryOfSales/index', breadcrumb: '销售汇总表(按商品)' },
      { path: '/web/SummaryOfSales-KH', component: '../pages/SummaryOfSales/index', breadcrumb: '销售汇总表(按客户)' },
      { path: '/web/SummaryOfSales-XS', component: '../pages/SummaryOfSales/index', breadcrumb: '销售汇总表(按销售人员)' },
      { path: '/web/SummaryOfSales-FL', component: '../pages/SummaryOfSales/index', breadcrumb: '销售汇总表(按分类)' },

      // 仓库
      { path: '/web/OrderList-cangku', component: '../pages/OrderList/index', breadcrumb: '订单列表' },
      { path: '/web/OrderListTD-cangku', component: '../pages/OrderList/index', breadcrumb: '退单申请列表' },
      { path: '/web/CommodityStocks', component: '../pages/CommodityStocks/index', breadcrumb: '商品库存' },
      { path: '/web/InventoryVerification', component: '../pages/InventoryVerification/index', breadcrumb: '库存盘点' },
      { path: '/web/InventoryVerificationDetail', component: '../pages/InventoryVerification/index', breadcrumb: '库存盘点' },
      { path: '/web/InventoryRecords', component: '../pages/InventoryRecords/index', breadcrumb: '盘点记录' },
      { path: '/web/OtherStockOut', component: '../pages/OtherStockInOut/index', breadcrumb: '其他出库单' },
      { path: '/web/OtherStockIn', component: '../pages/OtherStockInOut/index', breadcrumb: '其他入库单' },
      { path: '/web/CommodityWarning', component: '../pages/CommodityEdit/index', breadcrumb: '商品预警设置' },

      // 财务
      { path: '/web/SettlementAccount', component: '../pages/SettlementAccount/index', breadcrumb: '结算账户' },
      { path: '/web/Receipt', component: '../pages/Receipt/index', breadcrumb: '收款单' },
      { path: '/web/Receipt-XJ', component: '../pages/Receipt/index', breadcrumb: '收款单（现金）' },
      { path: '/web/PaymentOrder', component: '../pages/PaymentOrder/index', breadcrumb: '付款单' },
      { path: '/web/VerificationSheet', component: '../pages/VerificationSheet/index', breadcrumb: '核销单' },
      { path: '/web/CapitalTransferVoucher', component: '../pages/CapitalTransferVoucher/index', breadcrumb: '资金转账单' },

      { path: '/web/AccountsPayable', component: '../pages/AccountsPayable/index', breadcrumb: '应付账款明细表' },
      { path: '/web/AccountsReceivable', component: '../pages/AccountsReceivable/index', breadcrumb: '应收账款明细表' },
      { path: '/web/AccountSummary', component: '../pages/AccountSummary/index', breadcrumb: '应收/付账款汇总表' },
      { path: '/web/AccountSummary-Supplier', component: '../pages/AccountSummary/ForSupplier', breadcrumb: '应付账款汇总(供应商)' },
      { path: '/web/AccountSummary-member', component: '../pages/AccountSummary/ForMember', breadcrumb: '应收账款汇总(会员)' },
      { path: '/web/AccountSummary-XS', component: '../pages/AccountSummary/index', breadcrumb: '应收账款汇总表(按销售人员)' },
      { path: '/web/AccountCapitalCollect', component: '../pages/AccountCapitalCollect/index', breadcrumb: '账户资金汇总' },
      { path: '/web/AccountCapitalList', component: '../pages/AccountCapitalList/index', breadcrumb: '账户资金列表' },
      { path: '/web/SellingProfitList', component: '../pages/SellingProfitList/index', breadcrumb: '销售利润列表' },

      { path: '/web/OrderListView', component: '../pages/OrderList/OrderListView', breadcrumb: '订单列表' },
      { path: '/web/CommodityInventoryBalance', component: '../pages/CommodityInventoryBalance/index', breadcrumb: '商品库存余额' },

      // 采购
      { path: '/web/BuyerReceipt', component: '../pages/BuyerReceipt/index', breadcrumb: '采购开票' },
      { path: '/web/PurchaseList', component: '../pages/PurchaseList/index', breadcrumb: '采购明细表' },
      { path: '/web/PurchaseSummarySP', component: '../pages/PurchaseSummary/index', breadcrumb: '采购汇总表(按商品)' },
      { path: '/web/PurchaseSummaryGYS', component: '../pages/PurchaseSummary/index', breadcrumb: '采购汇总表(按供应商)' },

      // 工程
      { path: '/web/ProjectAcquisition', component: '../pages/ProjectAcquisition/index', breadcrumb: '工程领料' },

      { path: '/web/HomePage', component: '../pages/HomePage/index', breadcrumb: '首页' },

      { path: '/404', component: './404' },
    ],
  },
  { path: '/404', component: './404' },
];
