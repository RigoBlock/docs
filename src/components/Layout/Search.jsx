import { Index } from 'elasticlunr'
import React, { Component } from 'react'

// Search component
export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: ``,
      results: []
    }
  }

  render() {
    return (
      <div>
        <input type="text" value={this.state.query} onChange={this.search} />
        <ul>
          {this.state.results.map(page => (
            <li key={page.title}>{page.title}</li>
          ))}
        </ul>
      </div>
    )
  }

  getOrCreateIndex = () => {
    return this.index
      ? this.index
      : // Create an elastic lunr index and hydrate with graphql query results
        Index.load(this.props.searchIndex.index)
  }

  search = evt => {
    const query = evt.target.value
    const newState = {
      query
    }
    if (query.length >= 3) {
      this.index = this.getOrCreateIndex()
      newState.results = this.index
        .search(query, {
          title: { boost: 2 },
          content: { boost: 1 }
        })
        // Map over each ID and return the full document
        .map(({ ref }) => this.index.documentStore.getDoc(ref))
    }

    this.setState(newState)
  }
}
