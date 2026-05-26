export type Locale = "en" | "zh";

export type LocaleMessages = {
  language: {
    label: string;
    en: string;
    zh: string;
  };
  site: {
    promo: string;
    openCart: string;
    openMenu: string;
    nav: {
      shop: string;
      run: string;
      train: string;
      court: string;
      guides: string;
      fitGuide: string;
    };
    footer: {
      description: string;
      newsletterPlaceholder: string;
      join: string;
      shop: string;
      support: string;
      allGear: string;
      trainingGuides: string;
      shippingReturns: string;
      about: string;
    };
  };
  admin: {
    shell: {
      admin: string;
    };
    roles: Record<string, string>;
    nav: Record<string, string>;
    common: {
      open: string;
      edit: string;
      view: string;
      save: string;
      saving: string;
      create: string;
      loading: string;
      unknown: string;
      noEmail: string;
      noCountry: string;
      noResults: string;
      search: string;
      allStatus: string;
      allCategories: string;
      allStock: string;
      allPayments: string;
      allFulfillment: string;
      notAvailable: string;
      system: string;
      quantityShort: string;
      notApplicable: string;
      to: string;
      each: string;
    };
    logout: {
      signOut: string;
      signingOut: string;
      unavailable: string;
    };
    login: {
      eyebrow: string;
      title: string;
      body: string;
      email: string;
      password: string;
      signIn: string;
      signingIn: string;
      failed: string;
    };
    dashboard: {
      eyebrow: string;
      title: string;
      body: string;
      loading: string;
      loadFailed: string;
      kpis: {
        gmv: string;
        orders: string;
        aov: string;
        conversion: string;
        salesTotal: string;
        paidFulfilled: string;
        averageOrderValue: string;
        sessionsFallback: string;
      };
      topProducts: string;
      topProductsBody: string;
      lowStockAlerts: string;
      lowStockAlertsBody: string;
      noLowStockAlerts: string;
      stockLine: string;
      recentOrders: string;
      recentOrdersBody: string;
      noRecentOrders: string;
      table: {
        order: string;
        status: string;
        country: string;
        total: string;
        created: string;
      };
    };
    orders: {
      eyebrow: string;
      title: string;
      body: string;
      searchPlaceholder: string;
      loading: string;
      loadFailed: string;
      table: {
        order: string;
        payment: string;
        fulfillment: string;
        total: string;
        created: string;
      };
      filters: {
        allPayments: string;
        pending: string;
        paid: string;
        failed: string;
        refunded: string;
        allFulfillment: string;
        unfulfilled: string;
        fulfilled: string;
      };
      noOrders: string;
      noEmail: string;
      noCountry: string;
    };
    orderDetail: {
      eyebrow: string;
      body: string;
      loadFailed: string;
      missingId: string;
      loading: string;
      notFoundTitle: string;
      notFoundBody: string;
      cards: {
        payment: string;
        fulfillment: string;
        total: string;
        placed: string;
      };
      sections: {
        detail: string;
        items: string;
        notes: string;
        shipping: string;
        fulfillment: string;
        timeline: string;
      };
      fields: {
        email: string;
        country: string;
        checkoutSession: string;
        paymentIntent: string;
      };
      notePlaceholder: string;
      addNote: string;
      savingNote: string;
      noNotes: string;
      fulfillmentBody: string;
      markFulfilled: string;
      markingFulfilled: string;
      alreadyFulfilled: string;
      fulfilledAt: string;
      noStatusEvents: string;
      noShippingAddress: string;
    };
    products: {
      eyebrow: string;
      title: string;
      body: string;
      newProduct: string;
      loading: string;
      loadFailed: string;
      summary: {
        products: string;
        variants: string;
        unitsOnHand: string;
      };
      searchPlaceholder: string;
      filters: {
        allStatus: string;
        draft: string;
        active: string;
        archived: string;
        allCategories: string;
        allStock: string;
        inStock: string;
        lowStock: string;
        outOfStock: string;
      };
      table: {
        product: string;
        status: string;
        category: string;
        variants: string;
        stock: string;
        updated: string;
      };
      units: string;
      lowOut: string;
      noProducts: string;
    };
    inventory: {
      eyebrow: string;
      title: string;
      body: string;
      loading: string;
      loadFailed: string;
      adjustFailed: string;
      searchPlaceholder: string;
      reasonPlaceholder: string;
      quantityPlaceholder: string;
      filters: {
        allCategories: string;
        allStock: string;
        lowStock: string;
        outOfStock: string;
        inStock: string;
      };
      table: {
        sku: string;
        product: string;
        category: string;
        stock: string;
        threshold: string;
        status: string;
        adjust: string;
      };
      apply: string;
      noSkus: string;
    };
    contentIndex: {
      eyebrow: string;
      title: string;
      body: string;
      open: string;
      sections: {
        guides: { title: string; body: string };
        faq: { title: string; body: string };
        collections: { title: string; body: string };
        staticPages: { title: string; body: string };
      };
    };
  };
};

export const localeCookieName = "pulsegear_locale";

export const localeMessages: Record<Locale, LocaleMessages> = {
  en: {
    language: {
      label: "Language",
      en: "EN",
      zh: "中文",
    },
    site: {
      promo: "Free shipping over $60 / 30-day returns",
      openCart: "Open cart",
      openMenu: "Open menu",
      nav: {
        shop: "Shop",
        run: "Run",
        train: "Train",
        court: "Court",
        guides: "Guides",
        fitGuide: "Fit Guide",
      },
      footer: {
        description: "Lightweight support and carry essentials for running, training, and court sports.",
        newsletterPlaceholder: "Email for training guides",
        join: "Join",
        shop: "Shop",
        support: "Support",
        allGear: "All gear",
        trainingGuides: "Training Guides",
        shippingReturns: "Shipping & Returns",
        about: "About",
      },
    },
    admin: {
      shell: {
        admin: "Admin",
      },
      roles: {
        SUPER_ADMIN: "Super Admin",
        ADMIN: "Admin",
        OPERATOR: "Operator",
        CONTENT_EDITOR: "Content Editor",
        ANALYST: "Analyst",
        VIEWER: "Viewer",
      },
      nav: {
        "/admin/dashboard": "Dashboard",
        "/admin/products": "Products",
        "/admin/orders": "Orders",
        "/admin/inventory": "Inventory",
        "/admin/content": "Content",
        "/admin/seo": "SEO",
        "/admin/analytics": "Analytics",
        "/admin/marketing/merchant-feed": "Marketing",
        "/admin/settings": "Settings",
      },
      common: {
        open: "Open",
        edit: "Edit",
        view: "View",
        save: "Save",
        saving: "Saving...",
        create: "Create",
        loading: "Loading...",
        unknown: "Unknown",
        noEmail: "No email",
        noCountry: "No country",
        noResults: "No results",
        search: "Search",
        allStatus: "All status",
        allCategories: "All categories",
        allStock: "All stock",
        allPayments: "All payments",
        allFulfillment: "All fulfillment",
        notAvailable: "Not available",
        system: "System",
        quantityShort: "Qty",
        notApplicable: "N/A",
        to: "to",
        each: "each",
      },
      logout: {
        signOut: "Sign out",
        signingOut: "Signing out",
        unavailable: "Admin API is unavailable. Redirected to the login page.",
      },
      login: {
        eyebrow: "PulseGear admin",
        title: "Sign in",
        body: "Use an admin account to access dashboard, product operations, SEO controls, and content management modules.",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        signingIn: "Signing in",
        failed: "Login failed",
      },
      dashboard: {
        eyebrow: "Operations",
        title: "Dashboard",
        body: "Track real order-driven commerce performance while behavioral metrics stay on mock fallback until GA4 is connected.",
        loading: "Loading dashboard analytics...",
        loadFailed: "Failed to load dashboard analytics",
        kpis: {
          gmv: "GMV",
          orders: "Orders",
          aov: "AOV",
          conversion: "Conversion",
          salesTotal: "day sales total",
          paidFulfilled: "Paid and fulfilled orders",
          averageOrderValue: "Average order value",
          sessionsFallback: "Sessions are mock fallback",
        },
        topProducts: "Top products",
        topProductsBody: "Ranked by revenue, then units sold.",
        lowStockAlerts: "Low stock alerts",
        lowStockAlertsBody: "Active variants at or below their low stock threshold.",
        noLowStockAlerts: "No low stock alerts right now.",
        stockLine: "Stock {stock} / Threshold {threshold}",
        recentOrders: "Recent orders",
        recentOrdersBody: "Latest paid and fulfilled orders in the selected window.",
        noRecentOrders: "No recent orders in the selected range.",
        table: {
          order: "Order",
          status: "Status",
          country: "Country",
          total: "Total",
          created: "Created",
        },
      },
      orders: {
        eyebrow: "Operations",
        title: "Orders",
        body: "Search by order number or email, track payment and fulfillment state, and jump into order detail for notes and fulfillment actions.",
        searchPlaceholder: "Search orderNo or email",
        loading: "Loading orders...",
        loadFailed: "Failed to load orders",
        table: {
          order: "Order",
          payment: "Payment",
          fulfillment: "Fulfillment",
          total: "Total",
          created: "Created",
        },
        filters: {
          allPayments: "All payments",
          pending: "Pending",
          paid: "Paid",
          failed: "Failed",
          refunded: "Refunded",
          allFulfillment: "All fulfillment",
          unfulfilled: "Unfulfilled",
          fulfilled: "Fulfilled",
        },
        noOrders: "No orders match the current filters.",
        noEmail: "No email",
        noCountry: "No country",
      },
      orderDetail: {
        eyebrow: "Operations",
        body: "Review order detail, Stripe IDs, shipping address, notes, and fulfillment activity.",
        loadFailed: "Failed to load order",
        missingId: "Order id is missing.",
        loading: "Loading order...",
        notFoundTitle: "Order not found",
        notFoundBody: "The requested order could not be loaded from the admin API.",
        cards: {
          payment: "Payment",
          fulfillment: "Fulfillment",
          total: "Total",
          placed: "Placed",
        },
        sections: {
          detail: "Order detail",
          items: "Items",
          notes: "Internal notes",
          shipping: "Shipping address",
          fulfillment: "Fulfillment",
          timeline: "Status timeline",
        },
        fields: {
          email: "Email",
          country: "Country",
          checkoutSession: "Checkout Session",
          paymentIntent: "PaymentIntent",
        },
        notePlaceholder: "Add an internal note for operations or support.",
        addNote: "Add note",
        savingNote: "Saving note",
        noNotes: "No notes yet.",
        fulfillmentBody: "Mark the order fulfilled when operations complete packing and handoff. Future work will extend this to carrier and tracking integration.",
        markFulfilled: "Mark fulfilled",
        markingFulfilled: "Marking fulfilled",
        alreadyFulfilled: "Already fulfilled",
        fulfilledAt: "Fulfilled at",
        noStatusEvents: "No status events yet.",
        noShippingAddress: "No shipping address",
      },
      products: {
        eyebrow: "Catalog",
        title: "Products",
        body: "Manage catalog status, variant mix, pricing, and inventory from one admin surface.",
        newProduct: "New product",
        loading: "Loading products...",
        loadFailed: "Failed to load products",
        summary: {
          products: "Products",
          variants: "Variants",
          unitsOnHand: "Units on hand",
        },
        searchPlaceholder: "Search title, slug, SKU",
        filters: {
          allStatus: "All status",
          draft: "Draft",
          active: "Active",
          archived: "Archived",
          allCategories: "All categories",
          allStock: "All stock",
          inStock: "In stock",
          lowStock: "Low stock",
          outOfStock: "Out of stock",
        },
        table: {
          product: "Product",
          status: "Status",
          category: "Category",
          variants: "Variants",
          stock: "Stock",
          updated: "Updated",
        },
        units: "units",
        lowOut: "{low} low / {out} out",
        noProducts: "No products match the current filters.",
      },
      inventory: {
        eyebrow: "Operations",
        title: "Inventory",
        body: "Monitor all active and inactive SKUs, filter low stock, and record manual stock corrections with a reason.",
        loading: "Loading inventory...",
        loadFailed: "Failed to load inventory",
        adjustFailed: "Failed to adjust inventory",
        searchPlaceholder: "Search SKU, product, color, size",
        reasonPlaceholder: "Reason",
        quantityPlaceholder: "+/- qty",
        filters: {
          allCategories: "All categories",
          allStock: "All stock",
          lowStock: "Low stock",
          outOfStock: "Out of stock",
          inStock: "In stock",
        },
        table: {
          sku: "SKU",
          product: "Product",
          category: "Category",
          stock: "Stock",
          threshold: "Threshold",
          status: "Status",
          adjust: "Adjust",
        },
        apply: "Apply",
        noSkus: "No SKUs match the current filters.",
      },
      contentIndex: {
        eyebrow: "Content",
        title: "Content Center",
        body: "Manage the bilingual content surfaces that feed guides, FAQs, and approved collection landings.",
        open: "Open",
        sections: {
          guides: {
            title: "Guides",
            body: "Manage guide publishing, bilingual article copy, and linked product context.",
          },
          faq: {
            title: "FAQ",
            body: "Maintain support answers and bilingual FAQ copy used on the storefront.",
          },
          collections: {
            title: "Collection Landings",
            body: "Edit SEO-safe category and scenario landing intros without opening new route sprawl.",
          },
          staticPages: {
            title: "Static Pages",
            body: "Maintain bilingual About, Fit Guide, and Home Page content without leaving fixed storefront routes hardcoded.",
          },
        },
      },
    },
  },
  zh: {
    language: {
      label: "语言",
      en: "EN",
      zh: "中文",
    },
    site: {
      promo: "满 $60 免运费 / 30 天退货",
      openCart: "打开购物车",
      openMenu: "打开菜单",
      nav: {
        shop: "商城",
        run: "跑步",
        train: "训练",
        court: "球场",
        guides: "指南",
        fitGuide: "尺码指南",
      },
      footer: {
        description: "面向跑步、训练与球类运动的轻量支撑与随身装备。",
        newsletterPlaceholder: "输入邮箱获取训练指南",
        join: "订阅",
        shop: "选购",
        support: "支持",
        allGear: "全部装备",
        trainingGuides: "训练指南",
        shippingReturns: "配送与退货",
        about: "关于我们",
      },
    },
    admin: {
      shell: {
        admin: "后台",
      },
      roles: {
        SUPER_ADMIN: "超级管理员",
        ADMIN: "管理员",
        OPERATOR: "运营",
        CONTENT_EDITOR: "内容编辑",
        ANALYST: "分析师",
        VIEWER: "查看者",
      },
      nav: {
        "/admin/dashboard": "看板",
        "/admin/products": "商品",
        "/admin/orders": "订单",
        "/admin/inventory": "库存",
        "/admin/content": "内容",
        "/admin/seo": "SEO",
        "/admin/analytics": "分析",
        "/admin/marketing/merchant-feed": "营销",
        "/admin/settings": "设置",
      },
      common: {
        open: "打开",
        edit: "编辑",
        view: "查看",
        save: "保存",
        saving: "保存中...",
        create: "创建",
        loading: "加载中...",
        unknown: "未知",
        noEmail: "无邮箱",
        noCountry: "无国家",
        noResults: "暂无结果",
        search: "搜索",
        allStatus: "全部状态",
        allCategories: "全部品类",
        allStock: "全部库存",
        allPayments: "全部支付",
        allFulfillment: "全部履约",
        notAvailable: "不可用",
        system: "系统",
        quantityShort: "数量",
        notApplicable: "无",
        to: "变更为",
        each: "每件",
      },
      logout: {
        signOut: "退出登录",
        signingOut: "退出中",
        unavailable: "后台 API 当前不可用，已跳转到登录页。",
      },
      login: {
        eyebrow: "PulseGear 后台",
        title: "登录",
        body: "使用管理员账号访问看板、商品运营、SEO 控制和内容管理模块。",
        email: "邮箱",
        password: "密码",
        signIn: "登录",
        signingIn: "登录中",
        failed: "登录失败",
      },
      dashboard: {
        eyebrow: "运营",
        title: "看板",
        body: "查看真实订单驱动的经营表现；在 GA4 接入前，行为指标仍使用 mock fallback。",
        loading: "正在加载看板数据...",
        loadFailed: "加载看板数据失败",
        kpis: {
          gmv: "成交额",
          orders: "订单数",
          aov: "客单价",
          conversion: "转化率",
          salesTotal: "天销售总额",
          paidFulfilled: "已支付与已履约订单",
          averageOrderValue: "平均订单金额",
          sessionsFallback: "Session 指标仍为 fallback",
        },
        topProducts: "热门商品",
        topProductsBody: "按销售额排序，其次按销量排序。",
        lowStockAlerts: "低库存提醒",
        lowStockAlertsBody: "已启用变体中，库存低于或等于预警阈值的项。",
        noLowStockAlerts: "当前没有低库存提醒。",
        stockLine: "库存 {stock} / 阈值 {threshold}",
        recentOrders: "最近订单",
        recentOrdersBody: "所选时间窗口内最新的已支付和已履约订单。",
        noRecentOrders: "当前时间范围内没有最近订单。",
        table: {
          order: "订单",
          status: "状态",
          country: "国家",
          total: "总额",
          created: "创建时间",
        },
      },
      orders: {
        eyebrow: "运营",
        title: "订单",
        body: "按订单号或邮箱搜索，跟踪支付和履约状态，并进入订单详情处理备注与履约。",
        searchPlaceholder: "搜索订单号或邮箱",
        loading: "正在加载订单...",
        loadFailed: "加载订单失败",
        table: {
          order: "订单",
          payment: "支付",
          fulfillment: "履约",
          total: "总额",
          created: "创建时间",
        },
        filters: {
          allPayments: "全部支付",
          pending: "待支付",
          paid: "已支付",
          failed: "失败",
          refunded: "已退款",
          allFulfillment: "全部履约",
          unfulfilled: "未履约",
          fulfilled: "已履约",
        },
        noOrders: "当前筛选条件下没有订单。",
        noEmail: "无邮箱",
        noCountry: "无国家",
      },
      orderDetail: {
        eyebrow: "运营",
        body: "查看订单详情、Stripe ID、收货地址、内部备注和履约记录。",
        loadFailed: "加载订单失败",
        missingId: "缺少订单 ID。",
        loading: "正在加载订单...",
        notFoundTitle: "未找到订单",
        notFoundBody: "后台 API 未能返回该订单。",
        cards: {
          payment: "支付",
          fulfillment: "履约",
          total: "总额",
          placed: "下单时间",
        },
        sections: {
          detail: "订单详情",
          items: "商品明细",
          notes: "内部备注",
          shipping: "收货地址",
          fulfillment: "履约处理",
          timeline: "状态时间线",
        },
        fields: {
          email: "邮箱",
          country: "国家",
          checkoutSession: "Checkout Session",
          paymentIntent: "PaymentIntent",
        },
        notePlaceholder: "添加给运营或客服的内部备注。",
        addNote: "添加备注",
        savingNote: "保存备注中",
        noNotes: "暂时没有备注。",
        fulfillmentBody: "当仓配完成打包和交接后，可将订单标记为已履约。后续可继续扩展承运商和追踪号集成。",
        markFulfilled: "标记为已履约",
        markingFulfilled: "标记履约中",
        alreadyFulfilled: "已履约",
        fulfilledAt: "履约时间",
        noStatusEvents: "暂时没有状态事件。",
        noShippingAddress: "没有收货地址",
      },
      products: {
        eyebrow: "商品目录",
        title: "商品",
        body: "在同一个后台界面管理商品状态、变体结构、价格与库存。",
        newProduct: "新建商品",
        loading: "正在加载商品...",
        loadFailed: "加载商品失败",
        summary: {
          products: "商品数",
          variants: "变体数",
          unitsOnHand: "现有库存",
        },
        searchPlaceholder: "搜索标题、slug、SKU",
        filters: {
          allStatus: "全部状态",
          draft: "草稿",
          active: "启用",
          archived: "归档",
          allCategories: "全部品类",
          allStock: "全部库存",
          inStock: "有库存",
          lowStock: "低库存",
          outOfStock: "缺货",
        },
        table: {
          product: "商品",
          status: "状态",
          category: "品类",
          variants: "变体",
          stock: "库存",
          updated: "更新时间",
        },
        units: "件",
        lowOut: "{low} 低库存 / {out} 缺货",
        noProducts: "当前筛选条件下没有商品。",
      },
      inventory: {
        eyebrow: "运营",
        title: "库存",
        body: "监控所有启用和停用 SKU，筛选低库存，并记录带原因的人工库存调整。",
        loading: "正在加载库存...",
        loadFailed: "加载库存失败",
        adjustFailed: "调整库存失败",
        searchPlaceholder: "搜索 SKU、商品、颜色、尺码",
        reasonPlaceholder: "原因",
        quantityPlaceholder: "+/- 数量",
        filters: {
          allCategories: "全部品类",
          allStock: "全部库存",
          lowStock: "低库存",
          outOfStock: "缺货",
          inStock: "有库存",
        },
        table: {
          sku: "SKU",
          product: "商品",
          category: "品类",
          stock: "库存",
          threshold: "阈值",
          status: "状态",
          adjust: "调整",
        },
        apply: "应用",
        noSkus: "当前筛选条件下没有 SKU。",
      },
      contentIndex: {
        eyebrow: "内容",
        title: "内容中心",
        body: "管理驱动 guides、FAQ 和已批准 collection landing 的双语内容面。",
        open: "打开",
        sections: {
          guides: {
            title: "Guides",
            body: "管理 guide 的发布状态、双语文章文案和关联商品上下文。",
          },
          faq: {
            title: "FAQ",
            body: "维护前台使用的支持问答与双语 FAQ 文案。",
          },
          collections: {
            title: "Collection Landings",
            body: "编辑经批准的品类页与场景页 SEO 安全落地文案，不再扩散路由。",
          },
          staticPages: {
            title: "Static Pages",
            body: "维护 About、Fit Guide 和 Home Page 的双语内容，不再把固定页面文案写死在路由里。",
          },
        },
      },
    },
  },
};

export function normalizeLocale(value?: string | null): Locale {
  return value === "zh" ? "zh" : "en";
}
