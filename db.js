export class Database {
  constructor(url, db) {
    this.url = url
    this.reset(db)
  }

  reset (db) {
    this.db = db
    this.type = this.db.name
    this.name = this.type[0].toLowerCase() + this.type.slice(1)
  }

  async post (body) {
    const res = await fetch(this.url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json())

    return res.data
  }

  async create (row) {
    const body = {
      query: `
      mutation (
        $data: [${this.type}CreateInput!]!
      ) {
        ${this.name}_create(data: $data) {
          _id
        }
      }
      `,
      variables: {
        data: [row],
      },
    }

    const res = await this.post(body)
    return res[`${this.name}_create`]
  }

  ensureId (_id) {
    if (!_id) {
      throw new Error('_id required')
    }
  }

  async update (row) {
    this.ensureId(row._id)
    const { _id, ...data } = row

    const body = {
      query: `
      mutation (
        $filter: JSON!
        $data: ${this.type}UpdateInput!
      ) {
        ${this.name}_update(filter: $filter, data: $data)
      }
      `,
      variables: {
        filter: {
          _id,
        },
        data,
      },
    }

    const res = await this.post(body)
    return res[`${this.name}_update`]
  }

  async delete (row) {
    this.ensureId(row._id)

    const body = {
      query: `
      mutation (
        $filter: JSON!
      ) {
        ${this.name}_delete(filter: $filter)
      }
      `,
      variables: {
        filter: {
          _id: row._id,
        },
      },
    }

    const res = await this.post(body)
    return res[`${this.name}_delete`]
  }

  domain2filter (domains = []) {
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

  async search (query) {
    const { filter: domains = [], page = {}, sort: sorter } = query
    const { limit, offset } = page
    const sort = sorter && sorter.name && sorter.order && { [sorter.name]: sorter.order === 'ascending' ? 1 : -1 }

    const filter = this.domain2filter(domains)
    const fields_string = this.db.fields.map(d => {
      return d.name
    }).join(' ')

    const body = {
      query: `
      query (
        $query: QueryInput
      ) {
        ${this.name}_find(query: $query) {
          count
          data { ${fields_string} }
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

    const res = await this.post(body)
    return res[`${this.name}_find`]
  }
}

export const types2gql = (types = []) => {
  return types.map(({ name, fields = [] }) => {

    const fields_string = fields.map(field => {
return `  ${field.name}: ${field.type.name}\n`
    }).join('')
return `
type ${name} {
${fields_string}
}
`

  }).join('')
}

