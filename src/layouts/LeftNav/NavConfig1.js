let NAV = {
  'admin': [
    {
      title: '进销存中心',
      url: 'OperationsManagement',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品品牌✔',
          url: 'CommodityBrand',
          key: '1-1',
        }, {
          title: '商品分类✔',
          url: 'CommodityCategory',
          key: '1-2',
        }, {
          title: '商品规格✔',
          url: 'CommodityProperty',
          key: '1-3',
        }, {
          title: '商品管理✔',
          url: 'CommodityManage',
          key: '1-4',
        }, {
          title: '缺货预警✔',
          url: 'InventoryWarning',
          key: '1-5',
        }, {
          title: '滞销品预警✔',
          url: 'UnsoldGoodsWarning',
          key: '1-6',
        }, {
          title: '应付报表',
          url: 'EvaluationChannel',
          key: '1-7',
        }, {
          title: '供应商管理✔',
          url: 'SupplierManagement',
          key: '1-8',
        // }, {
        //   title: '角色',
        //   url: 'EvaluationChannel',
        //   key: '1-9',
        }, {
          title: '计量单位✔',
          url: 'UnitOfMeasurement',
          key: '1-10',
        },
      ]
    },
    {
      title: '统计中心',
      url: 'Index',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '周热销商品列表',
          url: 'SpokespersonRebate',
          key: '2-1',
        }, {
          title: '商品周销售趋势',
          url: 'TeacherRebate',
          key: '2-2',
        }, 
        // {
        //   title: '平台订单量',
        //   url: 'TeacherRebate',
        //   key: '2-3',
        // }, 
        {
          title: '财务信息',
          url: 'TeacherRebate',
          key: '2-4',
        }, 
        // {
        //   title: '商品实时库存',
        //   url: 'TeacherRebate',
        //   key: '2-5',
        // }, 
        {
          title: '工程相关统计',
          url: 'TeacherRebate',
          key: '2-6',
        },
      ]
    },
    {
      title: '人事管理',
      url: 'UserManagement',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '会员管理',
          url: '',
          key: '3-1',
          sub: [
            {
              title: '会员列表✔',
              url: 'MemberList',
              key: '3-1-1',
            }, 
          ]
        }, {
          title: '用户列表✔',
          url: 'UsersList',
          key: '3-2',
        }, {
          title: '销售数据✔',
          url: 'SalesStatistics',
          key: '3-3',
          sub: [
            {
              title: '销售汇总(按商品)✔',
              url: 'SalesStatistics-SP',
              key: '3-3-1',
            }, {
              title: '销售汇总(按会员)✔',
              url: 'SalesStatistics-HY',
              key: '3-3-2',
            }, {
              title: '销售汇总(按销售)✔',
              url: 'SalesStatistics-XS',
              key: '3-3-3',
            }, 
          ]
        }
        // {
        //   title: '客服人员',
        //   url: 'TeacherRebate',
        //   key: '3-2',
        // }, {
        //   title: '销售人员',
        //   url: 'TeacherRebate',
        //   key: '3-3',
        // }, {
        //   title: '发货管理人员',
        //   url: 'TeacherRebate',
        //   key: '3-4',
        // }, {
        //   title: '送货人',
        //   url: 'TeacherRebate',
        //   key: '3-5',
        // }, {
        //   title: '超级送货人',
        //   url: 'TeacherRebate',
        //   key: '3-6',
        // }, {
        //   title: '配货人',
        //   url: 'TeacherRebate',
        //   key: '3-7',
        // }, {
        //   title: '财务人员',
        //   url: 'TeacherRebate',
        //   key: '3-8',
        // }, {
        //   title: '采购人员',
        //   url: 'TeacherRebate',
        //   key: '3-9',
        // }, {
        //   title: '工程中心人员',
        //   url: 'TeacherRebate',
        //   key: '3-10',
        // }, {
        //   title: '商品运营人员',
        //   url: 'TeacherRebate',
        //   key: '3-11',
        // }, {
        //   title: '品牌运营人员',
        //   url: 'TeacherRebate',
        //   key: '3-12',
        // },
      ]
    },
    {
      title: '商品运营中心✔',
      url: 'OrderFormManagement',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品编辑发布✔',
          url: 'CommodityEdit?status=0',
          key: '4-1',
        }, {
          title: '已发布列表✔',
          url: 'CommodityReleased?status=1',
          key: '4-2',
        }, {
          title: '客服待沟通列表✔',
          url: 'ServiceToCommunicate',
          key: '4-3',
        // }, {
        //   title: '渠道数据',
        //   url: 'SpokespersonRebate',
        //   key: '4-4',
        }, {
          title: '配置中心✔',
          url: '',
          key: '4-5',
          sub: [
            {
              title: 'banner管理✔',
              url: 'BannerManagement',
              key: '4-5-1',
              icon: 'iconxiangyou',
            },
          ]
        }, {
          title: '促销商品设置✔',
          url: 'CommodityPromotion',
          key: '4-6',
        }, {
          title: '热销商品设置✔',
          url: 'CommodityHot',
          key: '4-7',
        }
      ]
    },
    {
      title: '工程中心✔',
      url: '',
      key: '5',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '工程订单列表✔',
          url: 'ProjectOrder',
          key: '5-1',
        }
      ]
    },
    {
      title: '新闻资讯✔',
      url: 'NewsInformation',
      key: '6',
      icon: 'iconxiangyou',
    },
    {
      title: '人才招聘✔',
      url: 'TalentRecruitment',
      key: '7',
      icon: 'iconxiangyou',
    },
    {
      title: '客户留言✔',
      url: 'CustomerMessage',
      key: '8',
      icon: 'iconxiangyou',
    },
    {
      title: 'banner管理✔',
      url: 'BannerManagement',
      key: '9',
      icon: 'iconxiangyou',
    },
    {
      title: '仓库报表✔',
      url: '',
      key: '10',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品收发明细表✔',
          url: 'ProdSendAndReceiveDetailed',
          key: '10-1',
        }, {
          title: '商品收发汇总表✔',
          url: 'ProdSendAndReceiveSummary',
          key: '10-2',
        }, 
      ]
    },
  ],
  gongcheng: [
    {
      title: '工程订单列表✔',
      url: 'ProjectOrder',
      key: '1',
    }
  ],
  yunying: [
    {
      title: '商品编辑发布✔',
      url: 'CommodityEdit?status=0',
      key: '1',
    }, {
      title: '已发布列表✔',
      url: 'CommodityReleased?status=1',
      key: '2',
    }, {
      title: '客服待沟通列表✔',
      url: 'ServiceToCommunicate',
      key: '3',
    // }, {
    //   title: '渠道数据',
    //   url: 'SpokespersonRebate',
    //   key: '4',
    }, {
      title: '配置中心✔',
      url: '',
      key: '5',
      sub: [
        {
          title: 'banner管理✔',
          url: 'BannerManagement',
          key: '5-1',
          icon: 'iconxiangyou',
        },
      ]
    }, {
      title: '促销商品设置✔',
      url: 'CommodityPromotion',
      key: '6',
    }, {
      title: '热销商品设置✔',
      url: 'CommodityHot',
      key: '7',
    }
  ],
  xiaoshou: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '未分配的意向订单✔',
          url: 'IntentionToOrder-wfp?assigned=-2',
          key: '1-1',
        }, {
          title: '已分配的意向订单✔',
          url: 'IntentionToOrder-yfp?assigned=-1',
          key: '1-2',
        }, {
          title: '退单申请列表',
          url: 'OrderList',
          key: '1-3',
        },
      ]
    },
    {
      title: '人事管理',
      url: 'UserManagement',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '会员管理',
          url: '',
          key: '3-1',
          sub: [
            {
              title: '会员列表',
              url: 'MemberList',
              key: '3-1-1',
            }, 
          ]
        }, {
          title: '销售数据✔',
          url: 'SalesStatistics',
          key: '3-3',
          sub: [
            {
              title: '销售汇总(按商品)✔',
              url: 'SalesStatistics-SP',
              key: '3-3-1',
            }, {
              title: '销售汇总(按会员)✔',
              url: 'SalesStatistics-HY',
              key: '3-3-2',
            }, {
              title: '销售汇总(按销售)✔',
              url: 'SalesStatistics-XS',
              key: '3-3-3',
            }, 
          ]
        }
      ]
    },
    {
      title: '销售报表',
      url: '',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售明细表✔',
          url: 'AccountForSales',
          key: '4-1',
        }, {
          title: '销售汇总表(按商品)✔',
          url: 'SummaryOfSales-SP',
          key: '4-2',
        }, {
          title: '销售汇总表(按客户)✔',
          url: 'SummaryOfSales-KH',
          key: '4-3',
        }, {
          title: '销售汇总表(按销售人员)✔',
          url: 'SummaryOfSales-XS',
          key: '4-4',
        },
      ]
    },
  ],
  kefu: [
    {
      title: '意向订单✔',
      url: 'IntentionToOrder',
      key: '1',
      icon: 'iconxiangyou',
    },
    {
      title: '客户留言✔',
      url: 'CustomerMessage',
      key: '2',
      icon: 'iconxiangyou',
    },
  ],
  kefu_mgr: [
    {
      title: '意向订单✔',
      url: 'IntentionToOrder',
      key: '1',
      icon: 'iconxiangyou',
    },
    {
      title: '客户留言✔',
      url: 'CustomerMessage',
      key: '2',
      icon: 'iconxiangyou',
    },
  ],
  huiyuan: [
    {
      title: '个人中心',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '个人信息',
          url: 'PersonalInfo',
          key: '1-1',
        },
        {
          title: '收货地址✔',
          url: 'ShippingAddress',
          key: '1-2',
        }
      ]
    },
    {
      title: '数据中心',
      url: '',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '订单统计',
          url: 'OrdersStatistics',
          key: '2-1',
        },
        {
          title: '财务信息',
          url: 'FinancialInfo',
          key: '2-2',
        }
      ]
    },
    {
      title: '订单中心',
      url: '',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '意向订单',
          url: 'IntentionToOrder',
          key: '3-1',
        },
        {
          title: '我的订单列表',
          url: 'MyOrderList',
          key: '3-2',
        }
      ]
    },
    {
      title: '商城',
      url: 'ShoppingMall',
      key: '4',
      icon: 'iconxiangyou',
    },
    {
      title: '工程中心✔',
      url: '',
      key: '5',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '工程订单列表✔',
          url: 'ProjectOrder',
          key: '5-1',
        }
      ]
    },
  ],
  cangku: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '退单申请列表',
          url: 'OrderList-cangku?orderType=-2',
          key: '1-2',
        },
      ]
    }, {
      title: '购货',
      url: '',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '2-1',
          sub: [
            {
              title: '采购单✔',
              url: 'OrderForm',
              key: '2-1-1',
            }, {
              title: '购货退货单✔',
              url: 'CreditOrder',
              key: '2-1-2',
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '2-1-3',
            },
          ]
        }, {
          title: '采购报表',
          url: 'OrderList',
          key: '2-2',
          sub: [
            {
              title: '采购明细表✔',
              url: 'PurchaseList',
              key: '2-2-1',
            }, {
              title: '采购汇总表(按商品)✔',
              url: 'PurchaseSummarySP?type=1',
              key: '2-2-2',
            }, {
              title: '采购汇总表(按供应商)✔',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2-2-3',
            }, {
              title: '采购付款一览表',
              url: 'OrderList',
              key: '2-2-4',
            },
          ]
        },
      ]
    }, {
      title: '库存盘点',
      url: 'InventoryVerification',
      key: '3',
      icon: 'iconxiangyou',
    }, {
      title: '盘点记录',
      url: 'InventoryRecords',
      key: '4',
      icon: 'iconxiangyou',
    }, {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '5',
      icon: 'iconxiangyou',
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '6',
      icon: 'iconxiangyou',
    }
  ],
  caiwu: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '退单申请列表',
          url: 'OrderList',
          key: '1-2',
        },
      ]
    },
    {
      title: '购货',
      url: '',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '2-1',
          sub: [
            {
              title: '采购单✔',
              url: 'OrderForm',
              key: '2-1-1',
            }, {
              title: '购货退货单✔',
              url: 'CreditOrder',
              key: '2-1-2',
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '2-1-3',
            },
          ]
        }, {
          title: '采购报表',
          url: 'OrderList',
          key: '2-2',
          sub: [
            {
              title: '采购明细表✔',
              url: 'PurchaseList',
              key: '2-2-1',
            }, {
              title: '采购汇总表(按商品)✔',
              url: 'PurchaseSummarySP?type=1',
              key: '2-2-2',
            }, {
              title: '采购汇总表(按供应商)✔',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2-2-3',
            }, {
              title: '采购付款一览表',
              url: 'OrderList',
              key: '2-2-4',
            },
          ]
        },
      ]
    },
    {
      title: '资金',
      url: '',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '资金单据',
          url: '',
          key: '3-1',
          sub: [
            {
              title: '收款单✔',
              url: 'Receipt',
              key: '3-1-1',
            }, {
              title: '付款单✔',
              url: 'PaymentOrder',
              key: '3-1-2',
            }, {
              title: '核销单',
              url: 'VerificationSheet',
              key: '3-1-3',
            }, {
              title: '资金转账单✔',
              url: 'CapitalTransferVoucher',
              key: '3-1-4',
            },
          ]
        }, {
          title: '资金报表',
          url: '',
          key: '3-2',
          sub: [
            {
              title: '应付账款明细表✔',
              url: 'AccountsPayable',
              key: '3-2-1',
            }, {
              title: '应收账款明细表✔',
              url: 'AccountsReceivable',
              key: '3-2-2',
            }, {
              title: '应收/付账款汇总表✔',
              url: 'AccountSummary',
              key: '3-2-3',
            }, {
              title: '账户资金列表✔',
              url: 'AccountCapitalList',
              key: '3-2-4',
            }, {
              title: '账户资金汇总✔',
              url: 'AccountCapitalCollect',
              key: '3-2-5',
            },
          ]
        },
      ]
    },
    {
      title: '结算账户✔',
      url: 'SettlementAccount',
      key: '4',
      icon: 'iconxiangyou',
    },
    , {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '5',
      icon: 'iconxiangyou',
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '6',
      icon: 'iconxiangyou',
    }
  ],
  caigou: [
    {
      title: '购货',
      url: '',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '2-1',
          sub: [
            {
              title: '采购单✔',
              url: 'OrderForm',
              key: '2-1-1',
            }, {
              title: '购货退货单✔',
              url: 'CreditOrder',
              key: '2-1-2',
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '2-1-3',
            },
          ]
        }, {
          title: '采购报表',
          url: 'OrderList',
          key: '2-2',
          sub: [
            {
              title: '采购明细表✔',
              url: 'PurchaseList',
              key: '2-2-1',
            }, {
              title: '采购汇总表(按商品)✔',
              url: 'PurchaseSummarySP?type=1',
              key: '2-2-2',
            }, {
              title: '采购汇总表(按供应商)✔',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2-2-3',
            }, {
              title: '采购付款一览表(暂时不做)',
              url: 'OrderList',
              key: '2-2-4',
            },
          ]
        },
      ]
    },
  ]
};

export default NAV;
