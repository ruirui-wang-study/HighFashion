export type Locale = "en" | "zh";

export const localeCookieName = "pulsegear_locale";

export const localeMessages = {
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
        description: "面向跑步、训练与球类运动的轻量支撑与收纳装备。",
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
    },
  },
} as const;

export function normalizeLocale(value?: string | null): Locale {
  return value === "zh" ? "zh" : "en";
}
