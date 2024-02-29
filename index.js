
import { createApp, reactive, ref, inject } from 'vue'
import { createRouter, createWebHashHistory, useRouter, useRoute } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

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

export const useAuth = () => {
  const auth = inject('auth')
  return auth
}

const LoginView = {
  template: `
  <div style="display:flex;height:100vh;justify-content:center;align-items:center;flex-flow:column;">
    <h3>{{appname}}</h3>
    <el-form :model="form" label-width="100px" label-position="left">
      <el-form-item label="Email"><el-input v-model="form.email" type="text" /></el-form-item><el-form-item label="Password"><el-input v-model="form.password" type="password" /></el-form-item><el-form-item label="Remember me"><el-switch v-model="form.autoLogin" /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">Login</el-button>
      </el-form-item>
    </el-form>
  </div>
  `,
  setup() {
    const auth = useAuth()
    const router = useRouter()
    const route = useRoute()

    const form = reactive({
      email: '',
      password: '',
      autoLogin: false,
    })

    const onSubmit = async () => {
      await auth.login(form)
      const redirect = route.query.redirect || '/'
      router.push({
        path: redirect,
      })
    }

    return {
      form,
      onSubmit,
      appname: auth.options.appname,
    }
  },
}

const DefaultFooter = {
  template: `&nbsp;`,
}

const DefaultAside = {
  template: `&nbsp;`,
}

export const startMenu = (routes) => {

  return {
    template: `
  <el-menu
    :default-active="activeIndex"
    mode="horizontal"
    :ellipsis="false"
    @select="handleSelect"
  >
    <el-menu-item :index="route.path" v-for="route in routes">{{route.name}}</el-menu-item>
    <div style="flex-grow:1;" />
    <el-sub-menu index="2" v-if="user">
      <template #title>{{user.username}}</template>
      <el-menu-item index="/login">Logout</el-menu-item>
    </el-sub-menu>
  </el-menu>
    `,
    setup () {
      const auth = useAuth()
      const router = useRouter()
      const route = useRoute()
      console.log('menu auth', route.path)
      const handleSelect = async (key, keyPath) => {
        if (key === '/login') {
          await auth.logout()
        }
        router.push({
          path: key,
        })
      }
      const activeIndex = route.path
      return {
        routes,
        activeIndex,
        handleSelect,
        user: auth.user,
        appname: auth.options.appname,
      }
    },
  }
}

export const startApp = ({
  Header,
  Footer = DefaultFooter,
  Aside,
  routes = [],
  mount,
  auther,
}) => {
  const appname = routes[0].name

  const routes_with_login = [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    ...routes,
  ]

  const router = createRouter({
    history: createWebHashHistory(),
    routes: routes_with_login,
  })

  const auth = new Auth({
    ...DefaultAuther,
    ...auther,
    appname,
  })

  router.beforeEach(async (to, from) => {
    const user = await auth.checkin()
    if (
      // 检查用户是否已登录
      !user &&
      // ❗️ 避免无限重定向
      to.name !== 'login'
    ) {
      // 将用户重定向到登录页面
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }
  })

  const DefaultHeader = {
    template: `<Menu />`,
    components: {
      Menu: startMenu(routes),
    },
  }

  const App = {
    template: `
    <template v-if="$route.name === 'login'">
        <RouterView />
    </template>
    <el-container v-else-if="hasAside">
      <el-aside width="200px">
        <Aside />
      </el-aside>
      <el-container>
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
    `,
    setup () {
      const hasAside = !!Aside
      return {
        hasAside
      }
    },
    components: {
      Header: Header || DefaultHeader,
      Footer,
      Aside: Aside || DefaultAside,
    },
  }

  const app = createApp(App)

  app.use(router)
  app.use(ElementPlus)
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.provide('auth', auth)

  app.mount(mount)

  return app
}
