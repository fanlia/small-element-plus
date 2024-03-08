
import { CRUD } from './crud.js'

import { Database, types2gql } from './db.js'

export const DBView = {
  template: `
  <CRUD
    :db="db"
    :processSearch="processSearch"
    :processCreate="processCreate"
    :processUpdate="processUpdate"
    :processDelete="processDelete"
    :processRowClick="processRowClick"
  />
  `,
  props: ['db', 'url', 'processRowClick'],
  components: {
    CRUD,
  },
  setup ({ db, url }) {
    const database = new Database(url, db)

    const processCreate = async (row) => {
      return database.create(row)
    }

    const processUpdate = async (row) => {
      return database.update(row)
    }

    const processDelete = async (row) => {
      return database.delete(row)
    }

    const processSearch = async (query) => {
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

export const DefinitionView = {
  template: `
  <CRUD
    :db="db"
    :processSearch="processSearch"
    :processCreate="processCreate"
    :processUpdate="processUpdate"
    :processDelete="processDelete"
    :processRowClick="processRowClick"
  />
  `,
  props: ['url', 'processRowClick'],
  components: {
    CRUD,
  },
  setup ({ url }) {
    const db = {
      name: 'Definition',
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

    const database = new Database(url, db)

    const processCreate = async (row) => {
      if (row.types.length > 0) {
        row.gql = types2gql(row.types)
      }
      return database.create(row)
    }

    const processUpdate = async (row) => {
      if (row.types.length > 0) {
        row.gql = types2gql(row.types)
      }
      return database.update(row)
    }

    const processDelete = async (row) => {
      return database.delete(row)
    }

    const processSearch = async (query) => {
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
