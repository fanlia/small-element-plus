
import { ref, reactive, onMounted, nextTick } from 'vue'

import { SparkApi } from 'xf-spark-api'

export const AIView = {
  template: `
  <div v-show="spark">
  <h3>xf spark</h3>
  <el-divider />
  <el-scrollbar ref="scroll" max-height="200px">
    <div ref="innerRef" style="min-height:100px">
    <p :style="message.type === 'question' ? 'text-align:right;padding: 0 5px; border-right:5px solid blue;' : 'padding: 0 5px; border-left:5px solid green;'" v-for="message in messages">{{message.value}}</p>
    </div>
  </el-scrollbar>
  <el-divider />
  <el-form :model="form">
    <el-form-item lable="question">
      <el-input v-model="form.question" type="textarea" />
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" @click="handleQuestion">ask ai</el-button>
    </el-form-item>
  </el-form>
  <el-divider />
  </div>
  <h3>xf spark options</h3>
  <el-form :model="optionsForm" label-width="auto">
    <el-form-item label="appid">
      <el-input v-model="optionsForm.appid" />
    </el-form-item>
    <el-form-item label="api_key">
      <el-input v-model="optionsForm.api_key" type="password" />
    </el-form-item>
    <el-form-item label="api_secret">
      <el-input v-model="optionsForm.api_secret" type="password" />
    </el-form-item>
    <el-form-item label="gpt_url">
      <el-input v-model="optionsForm.gpt_url" />
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" @click="handleOptions">save xf spark options</el-button>
    </el-form-item>
  </el-form>
  `,
  setup () {

    const scroll = ref()
    const innerRef = ref()
    const loading = ref(false)
    const messages = ref([
      {
        type: 'question',
        value: '你好',
      },
      {
        type: 'answer',
        value: '你好啊，你可问我问题',
      },
      {
        type: 'question',
        value: '最小的质数是多少',
      },
      {
        type: 'answer',
        value: '最小的质数是2',
      },
    ])

    onMounted(() => {
      scroll.value.setScrollTop(innerRef.value.clientHeight)
    })

    const form = reactive({
      question: '你好',
    })

    const spark = ref(null)

    const savedOptions = getSparkOptions()

    const optionsForm = reactive(savedOptions || {
      appid: "",
      api_key: "",
      api_secret: "",
      gpt_url: "wss://spark-api.xf-yun.com/v1.1/chat",
    })

    spark.value = savedOptions ? new SparkApi(savedOptions) : null

    const scrollBottom = () => {
      scroll.value.setScrollTop(innerRef.value.clientHeight)
    }

    const handleQuestion = async () => {
      loading.value = true
      const question = form.question

      messages.value.push({
        type: 'question',
        value: question,
      })

      await nextTick()
      scrollBottom()

      const index = messages.value.length

      let answer = ''

      messages.value.push({
        type: 'answer',
        value: answer,
      })

      await spark.value.run({
        question,
        onanswer: (result) => {
          answer += result.content
          messages.value.splice(index, 1, {
            type: 'answer',
            value: answer,
          })
          scrollBottom()
        },
      })

      scrollBottom()

      form.question = ''

      loading.value = false
    }

    const handleOptions = () => {
      if (optionsForm.appid && optionsForm.api_key && optionsForm.api_secret && optionsForm.gpt_url) {
        spark.value = new SparkApi(optionsForm)
        setSparkOptions(optionsForm)
      }
    }

    return {
      scroll,
      innerRef,
      form,
      optionsForm,
      spark,
      loading,
      messages,
      handleQuestion,
      handleOptions,
    }
  }
}

const KEY = 'xf-spark-options'

const getSparkOptions = () => {
  const item = localStorage.getItem(KEY)
  return item && JSON.parse(item)
}

const setSparkOptions = (options) => {
  localStorage.setItem(KEY, JSON.stringify(options))
}
