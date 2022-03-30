let NAV = {
  'admin': [
    {
      title: '首页',
      url: 'HomePage',
      key: '0',
      icon: 'iconxiangyou'
    },
    {
      title: '进销存中心',
      url: 'OperationsManagement',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品品牌',
          url: 'CommodityBrand',
          key: '1-1'
        }, {
          title: '商品分类',
          url: 'CommodityCategory',
          key: '1-2'
        }, {
          title: '商品规格',
          url: 'CommodityProperty',
          key: '1-3'
        }, {
          title: '商品管理',
          url: 'CommodityManage',
          key: '1-4'
        }, {
          title: '缺货预警',
          url: 'InventoryWarning',
          key: '1-5'
        }, {
          title: '滞销品预警',
          url: 'UnsoldGoodsWarning',
          key: '1-6'
        }, {
          title: '计量单位',
          url: 'UnitOfMeasurement',
          key: '1-10'
        }
      ]
    },
    {
      title: '统计中心',
      url: 'Index',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        // {
        //   title: '周热销商品列表',
        //   url: 'SpokespersonRebate',
        //   key: '2-1',
        // },
        // {
        //   title: '商品周销售趋势',
        //   url: 'TeacherRebate',
        //   key: '2-2',
        // },
        // {
        //   title: '平台订单量',
        //   url: 'TeacherRebate',
        //   key: '2-3',
        // },
        // {
        //   title: '财务信息',
        //   url: 'TeacherRebate',
        //   key: '2-4',
        // },
        // {
        //   title: '商品实时库存',
        //   url: 'TeacherRebate',
        //   key: '2-5',
        // },
        {
          title: '工程相关统计',
          url: 'EngineeringStatistic',
          key: '2-6'
        }
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
              key: '3-1-1'
            }
          ]
        }, {
          title: '用户列表',
          url: 'UsersList',
          key: '3-2'
        }, {
          title: '销售数据',
          url: 'SalesStatistics',
          key: '3-3',
          sub: [
            {
              title: '销售排名(按商品)',
              url: 'SalesStatistics-SP',
              key: '3-3-1'
            }, {
              title: '销售排名(按会员)',
              url: 'SalesStatistics-HY',
              key: '3-3-2'
            }, {
              title: '销售排名(按销售)',
              url: 'SalesStatistics-XS',
              key: '3-3-3'
            }
          ]
        }
      ]
    },
    {
      title: '供应商管理',
      url: 'SupplierManagement',
      key: '4',
      icon: 'iconxiangyou'
    },
    {
      title: '商品运营中心',
      url: 'OrderFormManagement',
      key: '5',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品编辑发布',
          url: 'CommodityEdit?status=0',
          key: '5-1'
        }, {
          title: '已发布列表',
          url: 'CommodityReleased?status=1',
          key: '5-2'
        }, {
          title: '客服待沟通列表',
          url: 'ServiceToCommunicate',
          key: '5-3'
        }, {
          title: '促销商品设置',
          url: 'CommodityPromotion',
          key: '5-6'
        }, {
          title: '热销商品设置',
          url: 'CommodityHot',
          key: '5-7'
        }
      ]
    },
    {
      title: '订单列表',
      url: '',
      key: '1a',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '全部订单',
          url: 'OrderList-cangku',
          key: '1a-0'
        }, {
          title: '意向订单',
          url: 'IntentionToOrder',
          key: '1a-1'
        }, {
          title: '未分配的意向订单',
          url: 'IntentionToOrder-wfp?assigned=-2',
          key: '1a-2'
        }, {
          title: '已分配的意向订单',
          url: 'IntentionToOrder-yfp?assigned=-1',
          key: '1a-3'
          // }, {
          //   title: '退单申请列表',
          //   url: 'OrderList',
          //   key: '1a-4',
        }
      ]
    },
    {
      title: '工程中心',
      url: '',
      key: '6',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '工程订单列表',
          url: 'ProjectOrder',
          key: '6-1'
        }
      ]
    },
    {
      title: '购货',
      url: '',
      key: '2a',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '2a-1',
          sub: [
            {
              title: '采购单',
              url: 'OrderForm',
              key: '2a-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '2a-1-2'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '2a-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '2a-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '2a-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2a-2-3'
            }
            // {
            //   title: '采购付款一览表',
            //   url: 'OrderList',
            //   key: '2-2-4',
            // },
          ]
        }
      ]
    },
    {
      title: '销售开票',
      url: 'MarketReceipt',
      key: '7a',
      icon: 'iconxiangyou'
    },
    {
      title: '销售报表',
      url: '',
      key: '13',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售明细表',
          url: 'AccountForSales',
          key: '13-1'
        }, {
          title: '销售汇总表(按商品)',
          url: 'SummaryOfSales-SP',
          key: '13-2'
        }, {
          title: '销售汇总表(按客户)',
          url: 'SummaryOfSales-KH',
          key: '13-3'
        }, {
          title: '销售汇总表(按销售人员)',
          url: 'SummaryOfSales-XS',
          key: '13-4'
        }, {
          title: '销售汇总表(按分类)',
          url: 'SummaryOfSales-FL',
          key: '13-5'
        }
      ]
    },
    {
      title: '商品库存余额',
      url: 'CommodityInventoryBalance',
      key: '3a',
      icon: 'iconxiangyou'
    }, {
      title: '商品库存',
      url: 'CommodityStocks',
      key: '2aa',
      icon: 'iconxiangyou'
    }, {
      title: '盘点记录',
      url: 'InventoryRecords',
      key: '4a',
      icon: 'iconxiangyou'
    }, {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '5a',
      icon: 'iconxiangyou'
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '6a',
      icon: 'iconxiangyou'
    },
    {
      title: '资金',
      url: '',
      key: '8a',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '资金单据',
          url: '',
          key: '8a-1',
          sub: [
            {
              title: '收款单',
              url: 'Receipt',
              key: '8a-1-1'
            }, {
              title: '收款单（现金）',
              url: 'Receipt-XJ?billType=1',
              key: '8a-1-2'
            }, {
              title: '付款单',
              url: 'PaymentOrder',
              key: '8a-1-3'
            }, {
              title: '核销单',
              url: 'VerificationSheet',
              key: '8a-1-4'
            }, {
              title: '资金转账单',
              url: 'CapitalTransferVoucher',
              key: '8a-1-5'
            }
          ]
        }, {
          title: '资金报表',
          url: '',
          key: '8a-2',
          sub: [
            {
              title: '应付账款明细表',
              url: 'AccountsPayable',
              key: '8a-2-1'
            }, {
              title: '应收账款明细表',
              url: 'AccountsReceivable',
              key: '8a-2-2'
            }, {
              title: '应收/付账款汇总表',
              url: 'AccountSummary',
              key: '8a-2-3'
            }, {
              title: '应付账款汇总(供应商)',
              url: 'AccountSummary-Supplier',
              key: '8a-2-8'
            }, {
              title: '应收账款汇总(会员)',
              url: 'AccountSummary-member',
              key: '8a-2-9'
            }, {
              title: '应收账款汇总表(按销售人员)',
              url: 'AccountSummary-XS?type=3',
              key: '8a-2-4'
            }, {
              title: '账户资金列表',
              url: 'AccountCapitalList',
              key: '8a-2-5'
            }, {
              title: '账户资金汇总',
              url: 'AccountCapitalCollect',
              key: '8a-2-6'
            }, {
              title: '销售利润表',
              url: 'SellingProfitList',
              key: '8a-2-7'
            }
          ]
        }
      ]
    },
    {
      title: '新闻资讯',
      url: 'NewsInformation',
      key: '7',
      icon: 'iconxiangyou'
    },
    {
      title: '人才招聘',
      url: 'TalentRecruitment',
      key: '8',
      icon: 'iconxiangyou'
    },
    {
      title: '客户留言',
      url: 'CustomerMessage',
      key: '9',
      icon: 'iconxiangyou'
    },
    {
      title: '客服待沟通列表',
      url: 'ServiceToCommunicate',
      key: '9a',
      icon: 'iconxiangyou'
    },
    {
      title: 'banner管理',
      url: 'BannerManagement',
      key: '10',
      icon: 'iconxiangyou'
    },
    {
      title: '收款账户设置',
      url: 'AccountPayee',
      key: '11',
      icon: 'iconxiangyou'
    },
    {
      title: '结算账户',
      url: 'SettlementAccount',
      key: '10a',
      icon: 'iconxiangyou'
    },
    {
      title: '结账记录',
      url: 'ClosingEntries',
      key: '12',
      icon: 'iconxiangyou'
    },
    {
      title: '仓库报表',
      url: '',
      key: '14',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品收发明细表',
          url: 'ProdSendAndReceiveDetailed',
          key: '14-1'
        }, {
          title: '商品收发汇总表',
          url: 'ProdSendAndReceiveSummary',
          key: '14-2'
        }
      ]
    }
  ],
  gongcheng: [
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  gc_weibao: [
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  gc_zhihuixiaofang: [
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  gc_gongcheng: [
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  gc_chengben: [
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  yunying: [
    {
      title: '商品编辑发布',
      url: 'CommodityEdit?status=0',
      key: '1',
      icon: 'iconxiangyou'
    }, {
      title: '已发布列表',
      url: 'CommodityReleased?status=1',
      key: '2',
      icon: 'iconxiangyou'
    }, {
      title: '促销商品设置',
      url: 'CommodityPromotion',
      key: '3',
      icon: 'iconxiangyou'
    }, {
      title: '热销商品设置',
      url: 'CommodityHot',
      key: '4',
      icon: 'iconxiangyou'
    }, {
      title: '商品销量设置',
      url: 'CommoditySalesVolume',
      key: '5',
      icon: 'iconxiangyou'
    }, {
      title: '客服待沟通列表',
      url: 'ServiceToCommunicate',
      key: '6',
      icon: 'iconxiangyou'
      // }, {
      //   title: '渠道数据',
      //   url: '',
      //   key: '7',
    }, {
      title: '配置中心',
      url: '',
      key: '8',
      icon: 'iconxiangyou',
      sub: [
        {
          title: 'banner管理',
          url: 'BannerManagement',
          key: '8-1'
        }
      ]
    }, {
      title: '新闻资讯',
      url: 'NewsInformation',
      key: '9',
      icon: 'iconxiangyou'
    }
  ],
  yunying_mgr: [
    {
      title: '商品编辑发布',
      url: 'CommodityEdit?status=0',
      key: '1',
      icon: 'iconxiangyou'
    }, {
      title: '已发布列表',
      url: 'CommodityReleased?status=1',
      key: '2',
      icon: 'iconxiangyou'
    }, {
      title: '促销商品设置',
      url: 'CommodityPromotion',
      key: '3',
      icon: 'iconxiangyou'
    }, {
      title: '热销商品设置',
      url: 'CommodityHot',
      key: '4',
      icon: 'iconxiangyou'
    }, {
      title: '商品销量设置',
      url: 'CommoditySalesVolume',
      key: '5',
      icon: 'iconxiangyou'
    }, {
      title: '客服待沟通列表',
      url: 'ServiceToCommunicate',
      key: '6',
      icon: 'iconxiangyou'
    }, {
      title: '配置中心',
      url: '',
      key: '8',
      icon: 'iconxiangyou',
      sub: [
        {
          title: 'banner管理',
          url: 'BannerManagement',
          key: '8-1'
        }
      ]
    }, {
      title: '新闻资讯',
      url: 'NewsInformation',
      key: '9',
      icon: 'iconxiangyou'
    },
    {
      title: '意向订单',
      url: 'IntentionToOrder',
      key: '10',
      icon: 'iconxiangyou'
    },
    {
      title: '客户留言',
      url: 'CustomerMessage',
      key: '11',
      icon: 'iconxiangyou'
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
          title: '全部订单',
          url: 'OrderList-cangku?orderType=1',
          key: '1-1'
        },
        {
          title: '未分配的意向订单',
          url: 'IntentionToOrder-wfp?assigned=-2',
          key: '1-2'
        }, {
          title: '已分配的意向订单',
          url: 'IntentionToOrder-yfp?assigned=-1',
          key: '1-3'
        }, {
          title: '退单申请列表',
          url: 'OrderListTD?orderType=-2',
          key: '1-4'
        }
      ]
    },
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: '2',
      icon: 'iconxiangyou'
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
              key: '3-1-1'
            }
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
          title: '销售明细表',
          url: 'AccountForSales',
          key: '4-1'
        }, {
          title: '销售汇总表(按商品)',
          url: 'SummaryOfSales-SP',
          key: '4-2'
        }, {
          title: '销售汇总表(按客户)',
          url: 'SummaryOfSales-KH',
          key: '4-3'
        }, {
          title: '销售汇总表(按销售人员)',
          url: 'SummaryOfSales-XS',
          key: '4-4'
        }, {
          title: '销售汇总表(按分类)',
          url: 'SummaryOfSales-FL',
          key: '4-5'
        }
      ]
    },
    {
      title: '销售数据',
      url: 'SalesStatistics',
      key: '5',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售排名(按商品)',
          url: 'SalesStatistics-SP',
          key: '5-1'
        }, {
          title: '销售排名(按会员)',
          url: 'SalesStatistics-HY',
          key: '5-2'
        }
      ]
    },
    {
      title: '资金报表',
      url: '',
      key: '6',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '应收账款明细表',
          url: 'AccountsReceivable',
          key: '6-1'
        }, {
          title: '应收账款汇总表',
          url: 'AccountSummary?type=2',
          key: '6-2'
        }
      ]
    }
  ],
  xiaoshou_mgr: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '全部订单',
          url: 'OrderList-cangku?orderType=1',
          key: '1-1'
        },
        {
          title: '未分配的意向订单',
          url: 'IntentionToOrder-wfp?assigned=-2',
          key: '1-2'
        }, {
          title: '已分配的意向订单',
          url: 'IntentionToOrder-yfp?assigned=-1',
          key: '1-3'
        }, {
          title: '退单申请列表',
          url: 'OrderListTD?orderType=-2',
          key: '1-4'
        }
      ]
    },
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: 'a1',
      icon: 'iconxiangyou'
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
              key: '3-1-1'
            }
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
          title: '销售明细表',
          url: 'AccountForSales',
          key: '4-1'
        }, {
          title: '销售汇总表(按商品)',
          url: 'SummaryOfSales-SP',
          key: '4-2'
        }, {
          title: '销售汇总表(按客户)',
          url: 'SummaryOfSales-KH',
          key: '4-3'
        }, {
          title: '销售汇总表(按销售人员)',
          url: 'SummaryOfSales-XS',
          key: '4-4'
        }, {
          title: '销售汇总表(按分类)',
          url: 'SummaryOfSales-FL',
          key: '4-5'
        }
      ]
    },
    {
      title: '销售数据',
      url: 'SalesStatistics',
      key: '5',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售排名(按商品)',
          url: 'SalesStatistics-SP',
          key: '5-1'
        }, {
          title: '销售排名(按会员)',
          url: 'SalesStatistics-HY',
          key: '5-2'
        }, {
          title: '销售排名(按销售)',
          url: 'SalesStatistics-XS',
          key: '5-3'
        }
      ]
    },
    {
      title: '资金报表',
      url: '',
      key: '6',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '应收账款明细表',
          url: 'AccountsReceivable',
          key: '6-1'
        }, {
          title: '应收账款汇总表',
          url: 'AccountSummary?type=2',
          key: '6-2'
        }
      ]
    },
    {
      title: '订单确认',
      url: 'OrderList-kf?orderType=0',
      key: '7',
      icon: 'iconxiangyou'
    },
    {
      title: '订单价格编辑',
      url: 'OrderPriceEdit-sz',
      key: '8',
      icon: 'iconxiangyou'
    }
  ],
  xiaoshou_sz: [
    {
      title: '订单列表',
      url: 'OrderList-cangku?orderType=1',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '订单确认',
      url: 'OrderList-kf?orderType=0',
      key: '2',
      icon: 'iconxiangyou'
    },
    {
      title: '订单价格编辑',
      url: 'OrderPriceEdit-sz',
      key: '3',
      icon: 'iconxiangyou'
    }
  ],
  kefu: [
    {
      title: '意向订单',
      url: 'IntentionToOrder',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '客户留言',
      url: 'CustomerMessage',
      key: '2',
      icon: 'iconxiangyou'
    }
  ],
  huiyuan: [
    {
      title: '商城',
      url: 'ShoppingMall',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '个人中心',
      url: '',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '个人信息',
          url: 'PersonalInfo',
          key: '2-1'
        },
        {
          title: '收货地址',
          url: 'ShippingAddress',
          key: '2-2'
        }
      ]
    },
    // {
    //   title: '数据中心',
    //   url: '',
    //   key: '2',
    //   icon: 'iconxiangyou',
    //   sub: [
    //     {
    //       title: '订单统计',
    //       url: 'OrdersStatistics',
    //       key: '2-1',
    //     },
    //     {
    //       title: '财务信息',
    //       url: 'FinancialInfo',
    //       key: '2-2',
    //     }
    //   ]
    // },
    {
      title: '订单中心',
      url: '',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '意向订单',
          url: 'IntentionToOrder',
          key: '3-1'
        },
        {
          title: '我的订单列表',
          url: 'MyOrderList',
          key: '3-2'
        }
      ]
    },
    {
      title: '工程中心',
      url: '',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '工程订单列表',
          url: 'ProjectOrder',
          key: '4-1'
        }
      ]
    },
    {
      title: '销售开票',
      url: 'MarketReceipt',
      key: '5',
      icon: 'iconxiangyou'
    }
    // {
    //   title: '资金报表',
    //   url: '',
    //   key: '6',
    //   icon: 'iconxiangyou',
    //   sub: [
    //     {
    //       title: '应付账款汇总表',
    //       url: 'AccountSummary?type=1',
    //       key: '6-1',
    //     }
    //   ]
    // }
  ],
  cangku: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '订单列表',
          url: 'OrderList-cangku?orderType=1',
          key: '1-1'
        },
        {
          title: '退单申请列表',
          url: 'OrderListTD-cangku?orderType=-2',
          key: '1-2'
        }
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
              title: '采购单',
              url: 'OrderForm',
              key: '2-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '2-1-2'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '2-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '2-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '2-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2-2-3'
            }
            // {
            //   title: '采购付款一览表',
            //   url: '',
            //   key: '2-2-4',
            // },
          ]
        }
      ]
    }, {
      title: '商品库存',
      url: 'CommodityStocks',
      key: '2a',
      icon: 'iconxiangyou'
    }, {
      title: '库存盘点',
      url: 'InventoryVerification',
      key: '3',
      icon: 'iconxiangyou'
    }, {
      title: '盘点记录',
      url: 'InventoryRecords',
      key: '4',
      icon: 'iconxiangyou'
    }, {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '5',
      icon: 'iconxiangyou'
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '6',
      icon: 'iconxiangyou'
    }, {
      title: '工程领料',
      url: 'ProjectAcquisition',
      key: '10',
      icon: 'iconxiangyou'
    }, {
      title: '商品预警设置',
      url: 'CommodityWarning',
      key: '7',
      icon: 'iconxiangyou'
    }, {
      title: '销售报表',
      url: '',
      key: '8',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售明细表',
          url: 'AccountForSales',
          key: '8-1'
        }
        // {
        //   title: '销售汇总表(按商品)',
        //   url: 'SummaryOfSales-SP',
        //   key: '8-2',
        // }, {
        //   title: '销售汇总表(按客户)',
        //   url: 'SummaryOfSales-KH',
        //   key: '8-3',
        // }, {
        //   title: '销售汇总表(按销售人员)',
        //   url: 'SummaryOfSales-XS',
        //   key: '8-4',
        // },
      ]
    }, {
      title: '仓库报表',
      url: '',
      key: '9',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品收发明细表',
          url: 'ProdSendAndReceiveDetailed',
          key: '9-1'
        }, {
          title: '商品收发汇总表',
          url: 'ProdSendAndReceiveSummary',
          key: '9-2'
        }
      ]
    }
  ],
  cangku_qt: [
    {
      title: '订单列表',
      url: '',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '订单列表',
          url: 'OrderList-cangku?orderType=1',
          key: '1-1'
        },
        {
          title: '退单申请列表',
          url: 'OrderListTD-cangku?orderType=-2',
          key: '1-2'
        }
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
              title: '采购单',
              url: 'OrderForm',
              key: '2-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '2-1-2'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '2-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '2-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '2-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '2-2-3'
            }
            // {
            //   title: '采购付款一览表',
            //   url: '',
            //   key: '2-2-4',
            // },
          ]
        }
      ]
    }, {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '5',
      icon: 'iconxiangyou'
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '6',
      icon: 'iconxiangyou'
    }
  ],
  caiwu: [
    {
      title: '首页',
      url: 'HomePage',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '统计中心',
      url: 'Index',
      key: '2',
      icon: 'iconxiangyou',
      sub: [
        // {
        //   title: '周热销商品列表',
        //   url: 'SpokespersonRebate',
        //   key: '2-1',
        // },
        // {
        //   title: '商品周销售趋势',
        //   url: 'TeacherRebate',
        //   key: '2-2',
        // },
        // {
        //   title: '平台订单量',
        //   url: 'TeacherRebate',
        //   key: '2-3',
        // },
        // {
        //   title: '财务信息',
        //   url: 'TeacherRebate',
        //   key: '2-4',
        // },
        // {
        //   title: '商品实时库存',
        //   url: 'TeacherRebate',
        //   key: '2-5',
        // },
        {
          title: '工程相关统计',
          url: 'EngineeringStatistic',
          key: '2-6'
        }
      ]
    },
    {
      title: '工程订单列表',
      url: 'ProjectOrder',
      key: 'a1',
      icon: 'iconxiangyou'
    },
    {
      title: '订单列表',
      url: '',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '订单列表',
          url: 'OrderListView',
          key: '3-1'
        }, {
          title: '退单申请列表',
          url: 'OrderListTD?orderType=-2',
          key: '3-2'
        }
      ]
    },
    {
      title: '购货',
      url: '',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '4-1',
          sub: [
            {
              title: '采购单',
              url: 'OrderForm',
              key: '4-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '4-1-2'
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '4-1-3'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '4-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '4-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '4-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '4-2-3'
            }
            // {
            //   title: '采购付款一览表',
            //   url: '',
            //   key: '4-2-4',
            // },
          ]
        }
      ]
    },
    {
      title: '销售开票',
      url: 'MarketReceipt',
      key: '5',
      icon: 'iconxiangyou'
    },
    {
      title: '销售报表',
      url: '',
      key: '6',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售明细表',
          url: 'AccountForSales',
          key: '6-1'
        }, {
          title: '销售汇总表(按商品)',
          url: 'SummaryOfSales-SP',
          key: '6-2'
        }, {
          title: '销售汇总表(按客户)',
          url: 'SummaryOfSales-KH',
          key: '6-3'
        }, {
          title: '销售汇总表(按销售人员)',
          url: 'SummaryOfSales-XS',
          key: '6-4'
        }, {
          title: '销售汇总表(按分类)',
          url: 'SummaryOfSales-FL',
          key: '6-5'
        }
      ]
    },
    {
      title: '销售数据',
      url: 'SalesStatistics',
      key: '7',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售排名(按商品)',
          url: 'SalesStatistics-SP',
          key: '7-1'
        }, {
          title: '销售排名(按会员)',
          url: 'SalesStatistics-HY',
          key: '7-2'
        }, {
          title: '销售排名(按销售)',
          url: 'SalesStatistics-XS',
          key: '7-3'
        }
      ]
    },
    {
      title: '商品库存余额',
      url: 'CommodityInventoryBalance',
      key: '3a',
      icon: 'iconxiangyou'
    },
    {
      title: '商品库存',
      url: 'CommodityStocks',
      key: 'spkc1',
      icon: 'iconxiangyou'
    }, {
      title: '盘点记录',
      url: 'InventoryRecords',
      key: 'a3',
      icon: 'iconxiangyou'
    },
    {
      title: '其他出库单',
      url: 'OtherStockOut',
      key: '8',
      icon: 'iconxiangyou'
    }, {
      title: '其他入库单',
      url: 'OtherStockIn',
      key: '9',
      icon: 'iconxiangyou'
    },
    {
      title: '仓库报表',
      url: '',
      key: '10',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品收发明细表',
          url: 'ProdSendAndReceiveDetailed',
          key: '10-1'
        }, {
          title: '商品收发汇总表',
          url: 'ProdSendAndReceiveSummary',
          key: '10-2'
        }
      ]
    },
    {
      title: '资金',
      url: '',
      key: '11',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '资金单据',
          url: '',
          key: '11-1',
          sub: [
            {
              title: '收款单',
              url: 'Receipt',
              key: '11-1-1'
            }, {
              title: '收款单（现金）',
              url: 'Receipt-XJ?billType=1',
              key: '11-1-2'
            }, {
              title: '付款单',
              url: 'PaymentOrder',
              key: '11-1-3'
            }, {
              title: '核销单',
              url: 'VerificationSheet',
              key: '11-1-4'
            }, {
              title: '资金转账单',
              url: 'CapitalTransferVoucher',
              key: '11-1-5'
            }
          ]
        }, {
          title: '资金报表',
          url: '',
          key: '11-2',
          sub: [
            {
              title: '应付账款明细表',
              url: 'AccountsPayable',
              key: '11-2-1'
            }, {
              title: '应收账款明细表',
              url: 'AccountsReceivable',
              key: '11-2-2'
            }, {
              title: '应收/付账款汇总表',
              url: 'AccountSummary',
              key: '11-2-3'
            }, {
              title: '应付账款汇总(供应商)',
              url: 'AccountSummary-Supplier',
              key: '11-2-8'
            }, {
              title: '应收账款汇总(会员)',
              url: 'AccountSummary-member',
              key: '11-2-9'
            }, {
              title: '应收账款汇总表(按销售人员)',
              url: 'AccountSummary-XS?type=3',
              key: '11-2-4'
            }, {
              title: '账户资金列表',
              url: 'AccountCapitalList',
              key: '11-2-5'
            }, {
              title: '账户资金汇总',
              url: 'AccountCapitalCollect',
              key: '11-2-6'
            }, {
              title: '销售利润表',
              url: 'SellingProfitList',
              key: '11-2-7'
            }
          ]
        }
      ]
    },
    {
      title: '结算账户',
      url: 'SettlementAccount',
      key: '12',
      icon: 'iconxiangyou'
    },
    {
      title: '供应商管理',
      url: 'SupplierManagement',
      key: '13',
      icon: 'iconxiangyou'
    },
    {
      title: '会员列表',
      url: 'MemberList',
      key: '14',
      icon: 'iconxiangyou'
    },
    {
      title: '结账记录',
      url: 'ClosingEntries',
      key: '15',
      icon: 'iconxiangyou'
    }
  ],
  caiwu_cn: [
    {
      title: '购货',
      url: '',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '4-1',
          sub: [
            {
              title: '采购单',
              url: 'OrderForm',
              key: '4-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '4-1-2'
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '4-1-3'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '4-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '4-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '4-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '4-2-3'
            }
            // {
            //   title: '采购付款一览表',
            //   url: '',
            //   key: '4-2-4',
            // },
          ]
        }
      ]
    },
    {
      title: '商品库存',
      url: 'CommodityStocks',
      key: 'spkc1',
      icon: 'iconxiangyou'
    },
    {
      title: '销售开票',
      url: 'MarketReceipt',
      key: '5',
      icon: 'iconxiangyou'
    },
    {
      title: '销售报表',
      url: '',
      key: '6',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '销售明细表',
          url: 'AccountForSales',
          key: '6-1'
        }, {
          title: '销售汇总表(按商品)',
          url: 'SummaryOfSales-SP',
          key: '6-2'
        }, {
          title: '销售汇总表(按客户)',
          url: 'SummaryOfSales-KH',
          key: '6-3'
        }, {
          title: '销售汇总表(按销售人员)',
          url: 'SummaryOfSales-XS',
          key: '6-4'
        }, {
          title: '销售汇总表(按分类)',
          url: 'SummaryOfSales-FL',
          key: '6-5'
        }
      ]
    },
    {
      title: '资金',
      url: '',
      key: '11',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '资金单据',
          url: '',
          key: '11-1',
          sub: [
            {
              title: '收款单',
              url: 'Receipt',
              key: '11-1-1'
            }, {
              title: '收款单（现金）',
              url: 'Receipt-XJ?billType=1',
              key: '11-1-2'
            }, {
              title: '付款单',
              url: 'PaymentOrder',
              key: '11-1-3'
            }, {
              title: '核销单',
              url: 'VerificationSheet',
              key: '11-1-4'
            }, {
              title: '资金转账单',
              url: 'CapitalTransferVoucher',
              key: '11-1-5'
            }
          ]
        }, {
          title: '资金报表',
          url: '',
          key: '11-2',
          sub: [
            {
              title: '应付账款明细表',
              url: 'AccountsPayable',
              key: '11-2-1'
            }, {
              title: '应收账款明细表',
              url: 'AccountsReceivable',
              key: '11-2-2'
            }, {
              title: '应收/付账款汇总表',
              url: 'AccountSummary',
              key: '11-2-3'
            }, {
              title: '应付账款汇总(供应商)',
              url: 'AccountSummary-Supplier',
              key: '11-2-8'
            }, {
              title: '应收账款汇总(会员)',
              url: 'AccountSummary-member',
              key: '11-2-9'
            }, {
              title: '应收账款汇总表(按销售人员)',
              url: 'AccountSummary-XS?type=3',
              key: '11-2-4'
            }, {
              title: '账户资金列表',
              url: 'AccountCapitalList',
              key: '11-2-5'
            }, {
              title: '账户资金汇总',
              url: 'AccountCapitalCollect',
              key: '11-2-6'
            }, {
              title: '销售利润表',
              url: 'SellingProfitList',
              key: '11-2-7'
            }
          ]
        }
      ]
    },
    {
      title: '结算账户',
      url: 'SettlementAccount',
      key: '12',
      icon: 'iconxiangyou'
    }
  ],
  caigou: [
    {
      title: '进销存中心',
      url: 'OperationsManagement',
      key: '1',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '商品品牌',
          url: 'CommodityBrand',
          key: '1-1'
        }, {
          title: '商品分类',
          url: 'CommodityCategory',
          key: '1-2'
        }, {
          title: '商品规格',
          url: 'CommodityProperty',
          key: '1-3'
        }, {
          title: '商品管理',
          url: 'CommodityManage',
          key: '1-4'
        }, {
          title: '缺货预警',
          url: 'InventoryWarning',
          key: '1-5'
        }, {
          title: '滞销品预警',
          url: 'UnsoldGoodsWarning',
          key: '1-6'
        }, {
          title: '计量单位',
          url: 'UnitOfMeasurement',
          key: '1-10'
        }
      ]
    },
    {
      title: '供应商管理',
      url: 'SupplierManagement',
      key: '2',
      icon: 'iconxiangyou'
    },
    {
      title: '购货',
      url: '',
      key: '3',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '采购单据',
          url: '',
          key: '3-1',
          sub: [
            {
              title: '采购单',
              url: 'OrderForm',
              key: '3-1-1'
            }, {
              title: '采购退货单',
              url: 'CreditOrder',
              key: '3-1-2'
            }, {
              title: '采购开票',
              url: 'BuyerReceipt',
              key: '3-1-3'
            }
          ]
        }, {
          title: '采购报表',
          url: '',
          key: '3-2',
          sub: [
            {
              title: '采购明细表',
              url: 'PurchaseList',
              key: '3-2-1'
            }, {
              title: '采购汇总表(按商品)',
              url: 'PurchaseSummarySP?type=1',
              key: '3-2-2'
            }, {
              title: '采购汇总表(按供应商)',
              url: 'PurchaseSummaryGYS?type=2',
              key: '3-2-3'
            }
            // {
            //   title: '采购付款一览表(暂时不做)',
            //   url: '',
            //   key: '3-2-4',
            // },
          ]
        }
      ]
    },
    {
      title: '资金报表',
      url: '',
      key: '4',
      icon: 'iconxiangyou',
      sub: [
        {
          title: '应付账款明细表',
          url: 'AccountsPayable',
          key: '4-1'
        }, {
          title: '应付账款汇总表',
          url: 'AccountSummary?type=1',
          key: '4-2'
        }
      ]
    }

  ],
  hr: [
    {
      title: '人才招聘',
      url: 'TalentRecruitment',
      key: '1',
      icon: 'iconxiangyou'
    },
    {
      title: '客户留言',
      url: 'CustomerMessage',
      key: '2',
      icon: 'iconxiangyou'
    },
    {
      title: '用户列表',
      url: 'UsersList',
      key: '3',
      icon: 'iconxiangyou'
    }
    // {
    //   title: '销售数据',
    //   url: 'SalesStatistics',
    //   key: '3',
    //   icon: 'iconxiangyou',
    //   sub: [
    //     {
    //       title: '销售排名(按商品)',
    //       url: 'SalesStatistics-SP',
    //       key: '3-1',
    //     }, {
    //       title: '销售排名(按会员)',
    //       url: 'SalesStatistics-HY',
    //       key: '3-2',
    //     }, {
    //       title: '销售排名(按销售)',
    //       url: 'SalesStatistics-XS',
    //       key: '3-3',
    //     },
    //   ]
    // }
  ]
};

export default NAV;
