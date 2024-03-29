
import { createApp, reactive, ref, inject, computed } from 'vue/dist/vue.esm-bundler.js'
import { createRouter, createWebHashHistory, useRouter, useRoute } from 'vue-router'
import ElementPlus, { ElMessage, ElLoading } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const KEY = 'access_token'

const AccessToken = {
  set: access_token => access_token ? localStorage.setItem(KEY, access_token) : localStorage.removeItem(KEY),
  get: access_token => localStorage.getItem(KEY),
}

class Auth {
  constructor(options = {}) {
    this.options = options
    this.user = null
    this.access_token = null
  }

  async me (access_token, autoLogin) {
    if (!access_token) return null
    try {
      this.user = await this.options.fetchUser(access_token)
      this.access_token = access_token
      if (autoLogin) AccessToken.set(access_token)
      return this.user
    } catch (e) {
      // ignore error
      return null
    }
  }

  getUser () {
    return this.user
  }

  async login (signData = {}) {
    const access_token = await this.options.signin(signData)
    return this.me(access_token, signData.autoLogin)
  }

  async logout () {
    AccessToken.set(null)
    this.access_token = null
    this.user = null
  }

  async checkin () {
    if (this.access_token && this.user) {
      return this.user
    }
    const access_token = AccessToken.get()
    return this.me(access_token)
  }
}

const DefaultAuther = {
  fetchUser: async (access_token) => {
    return {
      username: 'username',
    }
  },

  signin: async (signData) => {
    return 'access_token sample'
  },
}

const buildAuth = (options) => {
  const auth = new Auth(options)
  const user = ref(auth.user)
  const access_token = ref(auth.access_token)
  const sync = () => {
    user.value = auth.user
    access_token.value = auth.access_token
  }
  const checkin = async () => {
    await auth.checkin()
    sync()
  }
  const logout = async () => {
    await auth.logout()
    sync()
  }
  const login = async (signData) => {
    await auth.login(signData)
    sync()
  }

  return {
    login,
    logout,
    checkin,
    user,
    access_token,
    options,
  }
}

export const useAuth = () => {
  const auth = inject('auth')
  return auth
}

const DefaultI18n = {
  en: {
    'small.login.email': 'Email:',
    'small.login.password': 'Password:',
    'small.login.remember_me': 'Remember me:',
    'small.login.login': 'Login',
    'small.login.logout': 'Logout',
  },
  'zh-cn': {
    'small.login.email': '邮箱:',
    'small.login.password': '密码:',
    'small.login.remember_me': '记住我:',
    'small.login.login': '登录',
    'small.login.logout': '登出',
  },
}

const buildLang = (name = 'en') => {
  const language = ref(name)
  const locale = computed(() => (language.value === 'zh-cn' ? zhCn : en))
  const smallt = computed(() => (key) => DefaultI18n[language.value][key] || key)

  const toggle = () => {
    language.value = language.value === 'zh-cn' ? 'en' : 'zh-cn'
  }

  return {
    language,
    locale,
    smallt,
    toggle,
  }
}

export const useLang = () => {
  const lang = inject('lang')
  return lang
}

const LoginView = {
  template: `
  <div style="display:flex;height:100vh;justify-content:center;align-items:center;flex-flow:column;background-color:#eee;">
    <div style="background-color:white;padding:0 20px;border-radius:10px;min-width:400px;">
    <h1 style="text-align:center;">{{appname}}</h1>
    <el-divider />
    <el-form :model="form" label-width="auto" label-position="left">
      <el-form-item :label="smallt('small.login.email')">
        <el-input v-model="form.email" type="text" />
      </el-form-item>
      <el-form-item :label="smallt('small.login.password')">
        <el-input v-model="form.password" type="password" />
      </el-form-item>
      <el-form-item :label="smallt('small.login.remember_me')">
        <el-switch v-model="form.autoLogin" /></el-form-item>
      <el-form-item>
        <el-button style="width:100%" type="primary" @click="onSubmit" :loading="loading">{{smallt('small.login.login')}}</el-button>
      </el-form-item>
    </el-form>
    </div>
  </div>
  `,
  setup() {
    const { smallt } = useLang()
    const auth = useAuth()
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)

    const form = reactive({
      email: '',
      password: '',
      autoLogin: false,
    })

    const onSubmit = async () => {
      loading.value = true
      try {
        await auth.login(form)
        const redirect = route.query.redirect || '/'
        router.push({
          path: redirect,
        })
      } catch (e) {
        ElMessage.error(e.message || e)
      }
      loading.value = false
    }

    return {
      loading,
      form,
      onSubmit,
      appname: auth.options.appname,
      smallt,
    }
  },
}

const DefaultFooter = {
  template: `&nbsp;`,
}

const SmallMenuItem = {
  template: `
    <template v-for="route in routes">
      <el-sub-menu :index="route.path" v-if="Array.isArray(route.children) && route.children.length > 0">
        <template #title>{{route.name}}</template>
        <SmallMenuItem :routes="route.children" />
      </el-sub-menu>
      <el-menu-item :index="route.path" v-else>{{route.name}}</el-menu-item>
    </template>
  `,
  props: {
    routes: {
      type: Array,
      default: () => [],
    },
  },
}

const DefaultNotFound = {
  template: `
  <h1>Not Found</h1>
  `,
}

const getRouteMap = (routes = []) => {
  return routes.reduce((m, d) => ({
    ...m,
    [d.name]: d.path,
    ...getRouteMap(d.children),
  }), {})
}

export const startMenu = (routes, mode = 'horizontal') => {

  const routeMap = getRouteMap(routes)

  return {
    template: `
  <el-menu
    :default-active="activeIndex"
    :mode="mode"
    :ellipsis="false"
    @select="handleSelect"
    :style="style"
  >
    <div :style="logostyle"></div>
    <SmallMenuItem :routes="routes" />
    <div style="flex-grow:1;" />
    <el-sub-menu index="2" v-if="user">
      <template #title>{{user.username}}</template>
      <el-menu-item index="/login">{{smallt('small.login.logout')}}</el-menu-item>
    </el-sub-menu>
  </el-menu>
    `,
    setup () {
      const { smallt } = useLang()
      const auth = useAuth()
      const route = useRoute()
      const router = useRouter()
      const activeIndex = computed(() => {
        return auth.user.value ? routeMap[route.name] : ''
      })
      const handleSelect = async (key, keyPath) => {
        if (key === '/login') {
          await auth.logout()
        }
        router.push({
          path: key,
        })
      }
      const style = mode === 'vertical' ? 'display:flex;flex-direction:column;height:100vh' : ''
      const logostyle = mode === 'vertical' ? 'height:20px' : ''
      return {
        logostyle,
        style,
        mode,
        routes,
        activeIndex,
        handleSelect,
        user: auth.user,
        appname: auth.options.appname,
        smallt,
      }
    },
  }
}

export const startApp = ({
  Header,
  Footer = DefaultFooter,
  NotFound = DefaultNotFound,
  routes = [],
  plugins = [],
  mount = '#app',
  auther,
  appname,
  language = 'zh-cn',
  mode = 'horizontal',
}) => {
  document.body.style.margin="0"
  appname = appname || routes[0]?.name || 'MyApp'

  const routes_with_login = [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    ...routes,
    {
      path: '/:404(.*)',
      name: 'notFound',
      component: NotFound,
    },
  ]

  const router = createRouter({
    history: createWebHashHistory(),
    routes: routes_with_login,
  })

  const auth = buildAuth({
    ...DefaultAuther,
    ...auther,
    appname,
  })

  const lang = buildLang(language)

  router.beforeEach(async (to, from) => {
    if (
      // 检查用户是否已登录
      !auth.user.value &&
      // ❗️ 避免无限重定向
      to.name !== 'login'
    ) {
      const loadingInstance = ElLoading.service({
        lock: true,
      })
      await auth.checkin()
      loadingInstance.close()
      if (!auth.user.value) {
        // 将用户重定向到登录页面
        return {
          name: 'login',
          query: { redirect: to.fullPath },
        }
      }
    }
  })

  const DefaultHeader = startMenu(routes, mode)

  const App = {
    template: `
    <el-config-provider :locale="locale">
    <template v-if="$route.name === 'login'">
        <RouterView />
    </template>
    <el-container v-else-if="mode==='vertical'">
      <el-aside width="auto">
        <Header />
      </el-aside>
      <el-container>
        <el-main>
          <RouterView />
        </el-main>
        <el-footer>
          <Footer />
        </el-footer>
      </el-container>
    </el-container>
    <el-container v-else>
      <el-header>
        <Header />
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
      <el-footer>
        <Footer />
      </el-footer>
    </el-container>
    </el-config-provider>
    `,
    setup () {
      return {
        locale: lang.locale,
        mode,
      }
    },
    components: {
      Header: Header || DefaultHeader,
      Footer,
    },
  }

  const app = createApp(App)

  app.use(router)
  app.use(ElementPlus)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  for (const plugin of plugins) {
    app.use(plugin)
  }

  app.provide('auth', auth)
  app.provide('lang', lang)
  app.component('SmallMenuItem', SmallMenuItem)

  app.mount(mount)

  return app
}
