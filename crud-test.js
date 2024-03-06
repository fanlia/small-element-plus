
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
  <SmallSearch :db="db" :data="data" @detail="handleDetail" @edit="handleEdit" @delete="handleDelete" />
  <SmallEdit :db="db" :item="item" v-if="item" @update="handleUpdate" />
  <SmallRead :data="itemdata" v-if="item" />
  <SmallCreate :db="db" @create="handleCreate" />
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

    const item = ref(data.value[0])

    const itemdata = computed(() => {
      return item.value ? db.fields.map(field => ({ ...field, value: item.value[field.name]})) : []
    })

    const handleDetail = (row) => {
      console.log('detail', row)
      item.value = row
    }

    const handleCreate = (row) => {
      console.log('create', row)
      data.value.push({ ...row })
    }

    const handleEdit = (row) => {
      console.log('edit', row)
      item.value = row
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

    return {
      db,
      data,
      item,
      itemdata,
      handleDetail,
      handleCreate,
      handleEdit,
      handleUpdate,
      handleDelete,
    }
  },
}

