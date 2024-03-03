import { startApp } from './index.js'

import { ref } from 'vue'

const Counter = {
  setup() {
    const count = ref(0)
    return { count }
  },
  template: `
    <el-button @click="count++">
      You clicked me {{ count }} times.
    </el-button>`
}

const HomeView = {
  template: `
  <h1>This is an home page</h1>
  <p>
    <Counter />
  </p>
  <el-alert title="success alert" type="success" />
  <el-alert title="info alert" type="info" />
  <el-alert title="warning alert" type="warning" />
  <el-alert title="error alert" type="error" />
  `,
  components: {
    Counter,
  },
}

const AboutView = {
  template: `
  <h1>This is an about page</h1>
  `
}

const routes = [
  {
    path: '/',
    name: 'MyApp',
    component: HomeView
  },
  {
    path: '/about',
    name: 'About',
    component: AboutView
  },
]

startApp({
  routes,
})

