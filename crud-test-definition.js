
import {
  CRUD,
} from './crud.js'

import { Database, types2gql } from './db.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDDefinitionView = {
  template: `
  <h1>This is an crud/definition page</h1>
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
      name: 'definition',
      fields: [
        {
          name: '_id',
          type: {
            name: 'ID',
          },
        },
        {
          name: 'name',
          type: {
            name: 'String',
          },
        },
        {
          name: 'gql',
          type: {
            name: 'String',
          },
        },
        {
          name: 'types',
          type: {
            name: 'Database',
          },
        },
      ]
    }

    const url = 'http://localhost:4002/graphql/definition'

    const database = new Database(url, db)

    const processCreate = async (row) => {
      console.log('database/create', row)
      row.gql = types2gql(row.types)
      return database.create(row)
    }

    const processUpdate = async (row) => {
      console.log('database/update', row)
      row.gql = types2gql(row.types)
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
