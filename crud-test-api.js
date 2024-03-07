
import {
  CRUD,
} from './crud.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';

export const CRUDAPIView = {
  template: `
  <h1>This is an crud/api page</h1>
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

    const processCreate = async (row) => {
      console.log('create', row)
      const body = {
        query: `
        mutation (
          $data: [FriendCreateInput!]!
        ) {
          friend_create(data: $data) {
            _id
          }
        }
        `,
        variables: {
          data: [row],
        },
      }

      const res = await post(url, body)
      return res.friend_create
    }

    const processUpdate = async (row) => {
      console.log('update', row)
      const { _id, ...data } = row
      const body = {
        query: `
        mutation (
          $filter: JSON!
          $data: FriendUpdateInput!
        ) {
          friend_update(filter: $filter, data: $data)
        }
        `,
        variables: {
          filter: {
            _id: row._id,
          },
          data,
        },
      }

      const res = await post(url, body)
      return res.friend_update
    }

    const processDelete = async (row) => {
      console.log('delete', row)
      const body = {
        query: `
        mutation (
          $filter: JSON!
        ) {
          friend_delete(filter: $filter)
        }
        `,
        variables: {
          filter: {
            _id: row._id,
          },
        },
      }

      const res = await post(url, body)
      return res.friend_delete
    }

    const domain2filter = (domains = []) => {
      return domains.reduce((m, d) => {
        let value = d.value
        switch (d.operator) {
          case '>': value = { __gt: value }; break;
          case '>=': value = { __gte: value }; break;
          case '<': value = { __lt: value }; break;
          case '<=': value = { __lte: value }; break;
        }

        return {
          ...m,
          [d.name]: value,
        }
      }, {})
    }

    const processSearch = async (query) => {
      console.log('search', query)
      const { filter: domains = [], page = {}, sort: sorter } = query
      const { limit, offset } = page
      const sort = sorter && sorter.name && sorter.order && { [sorter.name]: sorter.order === 'ascending' ? 1 : -1 }

      const filter = domain2filter(domains)
      const body = {
        query: `
        query (
          $query: QueryInput
        ) {
          friend_find(query: $query) {
            count
            data {
              _id
              name
            }
          }
        }
        `,
        variables: {
          query: {
            filter,
            limit,
            offset,
            sort,
          },
        },
      }

      const res = await post(url, body)
      return res.friend_find
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

const post = async (url, body) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(res => res.json())

  return res.data
}
