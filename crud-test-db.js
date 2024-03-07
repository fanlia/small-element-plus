
import {
  CRUD,
} from './crud.js'

import { buildDB } from './db.js'

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
      name: 'friend',
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
      ]
    }

    const url = 'http://localhost:4002/graphql/demo'

    return buildDB(url, db)
  },
}
