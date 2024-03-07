
import {
  SmallSearch,
  SmallCreate,
  SmallRead,
  SmallEdit,
} from './crud.js'

import { ref, computed, } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDView = {
  template: `
  <h1>This is an crud page</h1>
  <el-button type="primary" size="small" @click="dialogVisibleCreate = true">New</el-button>
  <SmallSearch :db="db" :data="data" :total="total" @detail="handleDetail" @edit="handleEdit" @delete="handleDelete" @search="handleSearch" />
  <el-dialog v-model="dialogVisibleEdit">
    <SmallEdit :db="db" :item="item" @update="handleUpdate" />
  </el-dialog>
  <el-dialog v-model="dialogVisibleRead">
    <SmallRead :db="db" :item="item" />
  </el-dialog>
  <el-dialog v-model="dialogVisibleCreate">
    <SmallCreate :db="db" @create="handleCreate" />
  </el-dialog>
  `,
  components: {
    SmallSearch,
    SmallCreate,
    SmallRead,
    SmallEdit,
  },
  setup () {
    const db = {
      name: 'data',
      fields: [
        {
          name: '_id',
          type: {
            name: 'ID',
          },
        },
        {
          name: 'string',
          type: {
            name: 'String',
          },
        },
        {
          name: 'html',
          type: {
            name: 'HTML',
          },
        },
        {
          name: 'code',
          type: {
            name: 'Code',
            data: {
              lang: html(),
              basic: true,
              style: "width:100%;",
            },
          },
        },
        {
          name: 'image',
          type: {
            name: 'Image',
            data: {
              action: "http://localhost:4002/api/upload",
            },
          },
        },
        {
          name: 'int',
          type: {
            name: 'Int',
          },
        },
        {
          name: 'float',
          type: {
            name: 'Float',
          },
        },
        {
          name: 'boolean',
          type: {
            name: 'Boolean',
          },
        },
        {
          name: 'datetime',
          type: {
            name: 'DateTime',
          },
        },
        {
          name: 'enum',
          type: {
            name: 'Enum',
            values: ['yes', 'no'],
          },
        },
      ],
    }

    const data = ref([
      {
        _id: '_id1',
        string: 'just a normal string',
        html: '<h3>hello</h3>',
        code: '<h3>hello code1</h3>',
        image: 'favicon.ico',
        int: 10,
        float: 11.1,
        boolean: true,
        datetime: new Date(),
        enum: 'yes',
      },
      {
        _id: '_id2',
        string: 'just a normal string',
        html: '<h3>hello</h3>',
        code: '<h3>hello code2</h3>',
        image: 'favicon.ico',
        int: 10,
        float: 11.1,
        boolean: true,
        datetime: new Date(),
        enum: 'yes',
      },
    ])

    const total = ref(100)

    const item = ref(null)

    const dialogVisibleCreate = ref(false)
    const dialogVisibleEdit = ref(false)
    const dialogVisibleRead = ref(false)

    const handleDetail = (row) => {
      console.log('detail', row)
      item.value = row
      dialogVisibleRead.value = true
    }

    const handleCreate = (row) => {
      console.log('create', row)
      data.value.push({ ...row })
    }

    const handleEdit = (row) => {
      console.log('edit', row)
      item.value = row
      dialogVisibleEdit.value = true
    }

    const handleUpdate = (row) => {
      console.log('update', row)
      const index = data.value.findIndex(d => d._id === row._id)
      data.value.splice(index, 1, { ...row })
    }

    const handleDelete = (row) => {
      console.log('delete', row)
      data.value = data.value.filter(d => d._id !== row._id)
    }

    const handleSearch = (query) => {
      console.log('search', query)
      total.value = 20
    }

    return {
      db,
      data,
      total,
      item,
      handleDetail,
      handleCreate,
      handleEdit,
      handleUpdate,
      handleDelete,
      handleSearch,

      dialogVisibleCreate,
      dialogVisibleRead,
      dialogVisibleEdit,
    }
  },
}

