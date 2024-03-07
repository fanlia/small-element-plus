
import {
  CRUD,
} from './crud.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDView = {
  template: `
  <h1>This is an crud page</h1>
  <CRUD
    :db="db"
    :processSearch="processSearch"
    :processCreate="processCreate"
    :processUpdate="processUpdate"
    :processDelete="processDelete"
  />
  `,
  components: {
    CRUD,
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

    let data = [
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
    ]

    const processCreate = (row) => {
      console.log('create', row)
      data.push({ ...row, _id: `_id${data.length + 1}` })
    }

    const processUpdate = (row) => {
      console.log('update', row)
      const index = data.findIndex(d => d._id === row._id)
      console.log({index})
      data.splice(index, 1, { ...row })
    }

    const processDelete = (row) => {
      console.log('delete', row)
      data = data.filter(d => d._id !== row._id)
    }

    const compare = (v1, op, v2) => {
      switch (op) {
        case '=': return v1 === v2;
        case '>': return v1 > v2;
        case '>=': return v1 >= v2;
        case '<': return v1 < v2;
        case '<=': return v1 <= v2;
        default: return false;
      }
    }

    const processSearch = (query) => {
      console.log('search', query)
      const { filter = [], page = {} } = query
      const found = data.filter(d => filter.every(f => compare(d[f.name], f.operator, f.value)))
      return {
        data: found,
        count: data.length * 10,
      }
    }

    return {
      db,
      processSearch,
      processCreate,
      processUpdate,
      processDelete,
    }
  },
}

