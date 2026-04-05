export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    public: {
      siteName: "",
      imgUrl: "",
    },
    trustProxy: "",
    discord: {
      clientId: "",
      clientSecret: "",
      botToken: "",
    },
  },
  routeRules: {
    "/dashboard/**": { ssr: false },
    "/": { ssr: false },
    "/rules": { swr: true },
  },
  spaLoadingTemplate: true,
  experimental: {
    asyncContext: true,
    componentIslands: true,
  },
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  css: ["./app/assets/css/main.css"],
  colorMode: {
    preference: "dark",
  },
  app: {
    head: {
      title: "Infósok Éjszakája",
    },
    pageTransition: {
      name: "page",
      mode: "out-in",
    },
  },
  modules: [
    "@nuxt/image",
    "@vueuse/nuxt",
    "@nuxt/ui",
    "nuxt-csurf",
    "nuxt-security",
    "@nuxtjs/google-fonts",
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate"],
      },
    ],
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxtjs/mdc",
  ],
  imports: {
    dirs: ["stores"],
  },
  ui: {
    safelistColors: ["primary", "astro", "astro-gray"],
  },
  mdc: {
    components: {
      prose: false,
    },
  },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  googleFonts: {
    families: {
      Roboto: true,
      Inter: true,
      Inconsolata: true,
    },
  },
  nitro: {
    preset: "bun",
    storage: {
      templates: {
        driver: "fs",
        base: "./server/mail/templates",
      },
      teamlogo: {
        driver: "fs",
        base: "./uploads",
      },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ["sharp"],
      },
    },
  },
  security: {
    csrf: true,
    rateLimiter: {
      tokensPerInterval: 150,
      interval: 10000,
    },
    headers: {
      contentSecurityPolicy: {
        "img-src": ["'self'", "data:", "https://cdn.discordapp.com"],
      },
    },
  },
  csurf: {
    enabled: true,
    cookieKey: "csrf-token",
    cookie: {
      httpOnly: false,
    },
    https: true,
  },
  $development: {
    security: {
      headers: {
        crossOriginEmbedderPolicy: "unsafe-none",
        crossOriginOpenerPolicy: "unsafe-none",
        contentSecurityPolicy: false,
      },
      corsHandler: {
        origin: "*",
        methods: "*",
      },
    },
    csurf: {
      https: false,
    },
  },
});
