
export class Database {
  constructor(url, db) {
    this.url = url
    this.db = db
    this.name = this.db.name
    this.type = this.name[0].toUpperCase() + this.name.slice(1)
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

  async update (row) {
    console.log('update', row)
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
          _id: row._id,
        },
        data,
      },
    }

    const res = await this.post(body)
    return res[`${this.name}_update`]
  }

  async delete (row) {
    console.log('delete', row)
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
    console.log('search', query)
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

export const buildDB = (url, db) => {

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
}
