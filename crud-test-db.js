import { DBView } from './crud-db.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDDBView = {
  template: `
  <h1>This is an crud/db page</h1>
  <DBView
    :db="db"
    :url="url"
  />
  `,
  components: {
    DBView,
  },
  setup () {
    const db = {
      name: 'Friend',
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

    return {
      db,
      url,
    }
  },
}
