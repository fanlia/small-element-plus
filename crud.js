
import { ref, reactive, watch, toRaw, onMounted } from 'vue'

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

export const SmallFilter = {
  template: `
  <el-form :model="form" :inline="true">
    <div v-for="domain in form.domains" :key="domain.key" class="small-filter-domain">
      <el-form-item>
        <el-select v-model="domain.name">
          <el-option :value="field.name" :label="field.label || field.name" v-for="field in db.fields" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-select v-model="domain.operator">
          <el-option value="=" label="=" />
          <el-option value=">=" label=">=" />
          <el-option value=">" label=">" />
          <el-option value="<=" label="<=" />
          <el-option value="<" label="<" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="domain.value" />
      </el-form-item>
      <el-form-item>
        <el-button @click="onRemove(domain)">
          <el-icon><Minus /></el-icon>
        </el-button>
      </el-form-item>
    </div>
    <el-form-item>
      <el-button @click="onAdd">
        <el-icon><Plus /></el-icon>
      </el-button>
      <el-button type="primary" @click="onSubmit">Search</el-button>
    </el-form-item>
  </el-form>
  `,
  props: ['db'],
  emits: ['filter'],
  components: {
  },
  setup ({ db }, { emit }) {

    const newDomain = () => ({
      key: Date.now(),
      name: '',
      operator: '=',
      value: '',
    })

    const form = reactive({
      domains: [
        newDomain(),
      ],
    })

    const onAdd = () => {
      form.domains.push(newDomain())
    }

    const onRemove = (domain) => {
      const index = form.domains.findIndex(d => d.key === domain.key)
      console.log({index})
      form.domains.splice(index, 1)
    }

    const onSubmit = () => {
      const item = toRaw(form.domains.filter(d => d.name))
      emit('filter', item)
    }

    return {
      form,
      onSubmit,
      onAdd,
      onRemove,
    }
  },
}

export const SmallSearch = {
  template: `
  <div>
  <el-table :data="pageData.data">
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
  <el-pagination :total="pageData.count" @change='handlePage' style="margin-top:1em;" v-if="pageData.count" />
  </div>
  `,
  props: ['db', 'pageData'],
  emits: ['detail', 'edit', 'delete', 'page'],
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

    const handlePage = (currentPage, pageSize) => {
      const limit = pageSize
      const offset = (currentPage - 1) * pageSize
      emit('page', {
        limit,
        offset,
      })
    }

    return {
      handleDetail,
      handleEdit,
      handleDelete,
      handlePage,
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
      :on-preview="handlePictureCardPreview"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>
    <el-dialog v-model="dialogVisible">
      <div style="text-align:center;">
        <img w-full :src="dialogImageUrl" alt="Preview Image" />
      </div>
    </el-dialog>
  `,

  props: {
    modelValue: {
      type: String,
    },
    action: {
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
    const handleUploadSuccess = (files) => {
      emit('update:modelValue', files[0].url)
    }

    const dialogImageUrl = ref('')
    const dialogVisible = ref(false)

    const handlePictureCardPreview = (uploadFile) => {
      dialogImageUrl.value = uploadFile.url
      dialogVisible.value = true
    }

    return {
      fileList,
      limit,
      beforeUpload,
      handleUploadSuccess,
      handlePictureCardPreview,
      dialogImageUrl,
      dialogVisible,
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
      <SmallUpload v-model="form[name]" :="type.data" />
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
  <el-form :model="form" label-width="auto" v-if="item">
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
  <el-table :data="itemdata" :show-header="false" v-if="item">
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
  props: ['db', 'item'],
  components: {
    SmallReadItem,
  },
  setup (props) {

    const to_itemdata = (item) => item ? props.db.fields.map(field => ({ ...field, value: item[field.name]})) : []

    const itemdata = ref(to_itemdata(props.item))

    watch(() => props.item, (item) => {
      itemdata.value = to_itemdata(item)
    })

    return {
      itemdata,
    }
  },
}

const Nope = () => {}

export const CRUD = {
  template: `
  <p>
  <el-button type="primary" size="small" @click="dialogVisibleCreate = true">New</el-button>
  <el-button type="primary" size="small" @click="dialogVisibleFilter = true">Search</el-button>
  </p>
  <SmallSearch :db="db" :pageData="pageData" @detail="handleDetail" @edit="handleEdit" @delete="handleDelete" @page="handlePage" v-loading="loading" />
  <el-dialog v-model="dialogVisibleEdit">
    <SmallEdit :db="db" :item="item" @update="handleUpdate" />
  </el-dialog>
  <el-dialog v-model="dialogVisibleRead">
    <SmallRead :db="db" :item="item" />
  </el-dialog>
  <el-dialog v-model="dialogVisibleCreate">
    <SmallCreate :db="db" @create="handleCreate" />
  </el-dialog>
  <el-dialog v-model="dialogVisibleFilter">
    <SmallFilter :db="db" @filter="handleFilter" />
  </el-dialog>
  `,
  components: {
    SmallFilter,
    SmallSearch,
    SmallCreate,
    SmallRead,
    SmallEdit,
  },
  props: [
    'db',
    'processSearch',
    'processCreate',
    'processUpdate',
    'processDelete',
  ],
  setup ({
    db,
    processSearch = Nope,
    processCreate = Nope,
    processUpdate = Nope,
    processDelete = Nope,
  }) {

    const loading = ref(true)

    const pageData = ref({
      data: [],
      count: 0,
    })

    const item = ref(null)

    const dialogVisibleCreate = ref(false)
    const dialogVisibleEdit = ref(false)
    const dialogVisibleRead = ref(false)
    const dialogVisibleFilter = ref(false)

    const query = {}

    const search = async () => {
      loading.value = true
      try {
        const res = await processSearch(query)
        pageData.value = res
      } catch (e) {
        console.log('search error', e)
        // ignore
      }
      loading.value = false
    }

    onMounted(async () => {
      await search()
    })

    const handleDetail = (row) => {
      item.value = row
      dialogVisibleRead.value = true
    }

    const handleCreate = async (row) => {
      try {
        await processCreate({ ...row })
      } catch (e) {
        console.log('create error', e)
        // ignore
      }
      search()
      dialogVisibleCreate.value = false
    }

    const handleEdit = (row) => {
      item.value = row
      dialogVisibleEdit.value = true
    }

    const handleUpdate = async (row) => {
      try {
        await processUpdate({ ...row })
      } catch (e) {
        console.log('update error', e)
        // ignore
      }
      search()
      dialogVisibleEdit.value = false
    }

    const handleDelete = async (row) => {
      try {
        await processDelete({ ...row })
      } catch (e) {
        console.log('delete error', e)
        // ignore
      }
      search()
    }

    const handlePage = async (page) => {
      query.page = page
      search()
    }

    const handleFilter = async (filter) => {
      query.filter = filter
      search(query)
      dialogVisibleFilter.value = false
    }

    return {
      loading,
      db,
      pageData,
      item,
      handleDetail,
      handleCreate,
      handleEdit,
      handleUpdate,
      handleDelete,
      handlePage,
      handleFilter,

      dialogVisibleCreate,
      dialogVisibleRead,
      dialogVisibleEdit,
      dialogVisibleFilter,
    }
  },
}

