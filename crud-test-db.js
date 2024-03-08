
import {
  CRUD,
} from './crud.js'

import { Database } from './db.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDDBView = {
  template: `
  <h1>This is an crud/db page</h1>
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
      name: 'document',
      fields: [
        {
          name: '_id',
          type: {
            name: 'ID',
          },
          sortable: 'custom',
        },
        {
          name: 'name',
          type: {
            name: 'String',
          },
          sortable: 'custom',
        },
        {
          name: 'db',
          type: {
            name: 'Database',
          },
        },
      ]
    }

    const url = 'http://localhost:4002/graphql/doc'

    const database = new Database(url, db)

    const processCreate = async (row) => {
      console.log('database/create', row)
      return database.create(row)
    }

    const processUpdate = async (row) => {
      console.log('database/update', row)
      return database.update(row)
    }

    const processDelete = async (row) => {
      console.log('database/delete', row)
      return database.delete(row)
    }

    const processSearch = async (query) => {
      console.log('database/search', query)
      return database.search(query)
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
