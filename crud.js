
import { ref, reactive, watch, toRaw } from 'vue'

import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import CodeMirror from 'vue-codemirror6'
import './crud.css'

const SmallTableColumn = {
  template: `
    <el-table-column :label="label || name" v-if="type.name === 'DateTime'">
      <template #default="scope">{{new Date(scope.row[name]).toLocaleString()}}</template>
    </el-table-column>
    <el-table-column :label="label || name" v-else-if="type.name === 'HTML'">
      <template #default="scope">
        <div v-html="scope.row[name]"></div>
      </template>
    </el-table-column>
    <el-table-column :label="label || name" v-else-if="type.name === 'Code'">
      <template #default="scope">
        <el-scrollbar max-height="100px">
          <CodeMirror :modelValue="scope.row[name]" :="type.data" :readonly="true" />
        </el-scrollbar>
      </template>
    </el-table-column>
    <el-table-column :label="label || name" v-else-if="type.name === 'Image'">
      <template #default="scope">
        <el-image style="max-width:100px;max-height:100px" :src="scope.row[name]" />
      </template>
    </el-table-column>
    <el-table-column :label="label || name" v-else-if="type.name === 'Boolean'">
      <template #default="scope">
        <el-switch v-model="scope.row[name]" disabled />
      </template>
    </el-table-column>
    <el-table-column :label="label || name" v-else-if="type.name === 'Enum'">
      <template #default="scope">
        <el-tag>{{scope.row[name]}}</el-tag>
      </template>
    </el-table-column>
    <el-table-column :prop="name" :label="label || name" v-else />
  `,
  props: ['name', 'type', 'label'],
  components: {
    CodeMirror,
  },
}

export const SmallSearch = {
  template: `
  <el-table :data="data">
    <SmallTableColumn :="field" v-for="field in db.fields" />
    <el-table-column fixed="right" label="Operations" width="200px">
      <template #default="scope">
        <el-button link type="primary" size="small" @click="handleDetail(scope.row)"
          >Detail</el-button
        >
        <el-button link type="primary" size="small" @click="handleEdit(scope.row)">Edit</el-button>
        <el-popconfirm title="Are you sure to delete this?" @confirm="handleDelete(scope.row)">
          <template #reference>
            <el-button link type="danger" size="small">Delete</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>

  </el-table>
  `,
  props: ['db', 'data'],
  emits: ['detail', 'edit', 'delete'],
  components: {
    SmallTableColumn,
  },
  setup (props, { emit }) {
    const handleDetail = (row) => {
      emit('detail', row)
    }

    const handleEdit = (row) => {
      emit('edit', row)
    }

    const handleDelete = (row) => {
      emit('delete', row)
    }

    return {
      handleDetail,
      handleEdit,
      handleDelete,
    }
  },
}

const getDefaults = (fields) => {
  return fields.reduce((m, d) => {
    const typeName = d.type.name
    const value = typeName === 'Boolean' ? false
      : typeName === 'DateTime' ? new Date()
      : typeName === 'Enum' ? d.type.values[0]
      : typeName === 'Int' ? 0
      : typeName === 'Float' ? 0
      : ''
    return {
      ...m,
      [d.name]: value,
    }
  }, {})
}

const SmallUpload = {
  template: `
    <el-upload
      v-model:file-list="fileList"
      :action="action"
      list-type="picture-card"
      :limit="limit"
      :before-upload="beforeUpload"
      :on-success='handleUploadSuccess'
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
  `,

  props: {
    modelValue: {
      type: String,
    },
  },

  emits: ['update:modelValue'],

  setup (props, { emit }) {
    const fileList = ref(props.modelValue ? [{ url: props.modelValue }] : [])
    watch(() => props.modelValue, () => {
      fileList.value = props.modelValue ? [{ url: props.modelValue }] : []
    })

    const limit = 1
    const beforeUpload = (file) => {
      if (fileList.value.length >= limit) {
        return false
      }
    }
    const target = "http://localhost:4002"
    const action = `${target}/api/upload`
    const handleUploadSuccess = (files) => {
      emit('update:modelValue', `${target}/${files[0].url}`)
    }

    return {
      action,
      fileList,
      limit,
      beforeUpload,
      handleUploadSuccess,
    }
  },
}

const SmallFormItem = {
  template: `
    <el-form-item :label="label || name" v-if="type.name === 'DateTime'">
      <el-date-picker
        v-model="form[name]"
        type="datetime"
      />
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'HTML'">
      <div style="width:100%;">
        <QuillEditor style="min-height:100px;" v-model:content="form[name]" theme="snow" contentType="html" toolbar="essential" />
      </div>
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Code'">
      <el-scrollbar max-height="100px" style="width:100%">
        <CodeMirror v-model="form[name]" :="type.data" />
      </el-scrollbar>
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Image'">
      <SmallUpload v-model="form[name]" />
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Int'">
      <el-input-number v-model="form[name]" />
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Float'">
      <el-input-number v-model="form[name]" />
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Boolean'">
      <el-switch v-model="form[name]" />
    </el-form-item>
    <el-form-item :label="label || name" v-else-if="type.name === 'Enum'">
      <el-select v-model="form[name]">
        <el-option :label="value" :value="value" v-for="value in type.values" />
      </el-select>
    </el-form-item>
    <el-form-item :label="label || name" v-else>
      <el-input v-model="form[name]" />
    </el-form-item>
  `,
  props: ['form', 'name', 'type', 'label'],
  components: {
    QuillEditor,
    SmallUpload,
    CodeMirror,
  },
}

export const SmallCreate = {
  template: `
  <el-form :model="form" label-width="auto">
    <SmallFormItem :form="form" :="field" v-for="field in db.fields" />
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Create</el-button>
    </el-form-item>
  </el-form>
  `,
  props: ['db'],
  emits: ['create'],
  components: {
    SmallFormItem,
  },
  setup ({ db }, { emit }) {
    const defaults = getDefaults(db.fields)
    const form = reactive(defaults)

    const onSubmit = () => {
      const item = toRaw(form)
      emit('create', item)
    }

    return {
      form,
      onSubmit,
    }
  },
}

export const SmallEdit = {
  template: `
  <el-form :model="form" label-width="auto">
    <SmallFormItem :form="form" :="field" v-for="field in db.fields" />
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Update</el-button>
    </el-form-item>
  </el-form>
  `,
  props: ['db', 'item'],
  emits: ['update'],
  components: {
    SmallFormItem,
  },
  setup (props, { emit }) {
    const defaults = getDefaults(props.db.fields)
    const form = reactive({
      ...defaults,
      ...props.item,
    })

    watch(() => props.item, (newdata) => {
      for (const key in newdata) {
        form[key] = newdata[key]
      }
    })

    const onSubmit = () => {
      const item = toRaw(form)
      emit('update', item)
    }

    return {
      form,
      onSubmit,
    }
  },
}

const SmallReadItem = {
  template: `
    <div v-if="type.name === 'DateTime'">{{new Date(value).toLocaleString()}}</div>
    <div v-else-if="type.name === 'HTML'" v-html="value"></div>
    <div v-else-if="type.name === 'Code'">
      <el-scrollbar max-height="100px" style="width:100%">
        <CodeMirror :modelValue="value" :="type.data" :readonly="true" />
      </el-scrollbar>
    </div>
    <div style="display: flex; align-items: center" v-else-if="type.name === 'Image'">
      <el-image style="max-width:100px;max-height:100px" :src="value" />
    </div>
    <div v-else-if="type.name === 'Boolean'">
      <el-switch v-model="value" disabled />
    </div>
    <div v-else-if="type.name === 'Enum'">
        <el-tag>{{value}}</el-tag>
    </div>
    <div v-else>{{value}}</div>
  `,
  props: ['value', 'name', 'type', 'label'],
  components: {
    CodeMirror,
  },
}

export const SmallRead = {
  template: `
  <el-table :data="data" :show-header="false">
    <el-table-column label="label" width="100px">
      <template #default="scope">
        <el-text tag="b">{{scope.row.label || scope.row.name}}</el-text>
      </template>
    </el-table-column>
    <el-table-column label="value">
      <template #default="scope">
        <SmallReadItem :="scope.row" />
      </template>
    </el-table-column>
  </el-table>
  `,
  props: ['data'],
  components: {
    SmallReadItem,
  },
}
