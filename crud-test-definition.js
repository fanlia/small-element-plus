
import { DBView, DefinitionView } from './crud-db.js'

import { Database, types2gql } from './db.js'

import { ref } from 'vue'

import { json } from '@codemirror/lang-json';
import { html } from '@codemirror/lang-html';


export const CRUDDefinitionView = {
  template: `
  <h1>This is an crud/definition page</h1>
  <DefinitionView
    :url="definition_url"
    :processRowClick="processRowClick"
  />

  <el-divider />
  <h2>{{dbName}}</h2>

  <el-tabs v-model="activeName">
    <el-tab-pane :label="def.db.name" :name="def.db.name" v-for="def in defs" :key="dbName + def.db.name">
      <DBView :db="def.db" :url="def.url" />
    </el-tab-pane>
  </el-tabs>
  `,
  components: {
    DBView,
    DefinitionView,
  },
  setup () {

    const dbName = ref('')
    const activeName = ref('')
    const defs = ref([])

    const baseUrl = 'http://localhost:4002/graphql'

    const definition_url = `${baseUrl}/definition`

    const processRowClick = async (row) => {
      const url = `${baseUrl}/${row.name}`
      defs.value = row.types.map(d => ({
        url,
        db: d,
      }))
      activeName.value = defs.value[0]?.db.name
      dbName.value = row.name
    }

    return {
      dbName,
      activeName,
      defs,
      definition_url,
      processRowClick,
    }
  },
}
