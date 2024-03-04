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

const TestView = {
  template: `
    <h2>Test</h2>
    <router-view></router-view>
  `,
}

const Test1View = {
  template: `
  <h1>This is an test/1 page</h1>
  `
}

const Test2View = {
  template: `
  <h1>This is an test/2 page</h1>
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
  {
    path: '/test',
    name: 'Test',
    component: TestView,
    children: [
      {
        path: '/test/test1',
        name: 'Test 1',
        component: Test1View,
      },
      {
        path: '/test/test2',
        name: 'Test 2',
        component: Test2View,
      },
    ],
  },
]

startApp({
  routes,
})

