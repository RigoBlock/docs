import './Search.scss'
import { Index } from 'elasticlunr'
import React, { Component } from 'react'

// Search component
export default class Search extends Component {
  render() {
    return (
      <input
        type="text"
        className="search"
        placeholder="Search"
        onChange={this.props.onSearch(this.getOrCreateIndex())}
      />
    )
  }

  getOrCreateIndex = () => {
    if (!this.index) {
      // Create an elastic lunr index and hydrate with graphql query results
      this.index = Index.load(this.props.searchIndex.index)
    }
    return this.index
  }

  onSearch = evt => {
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
      this.props.stateFunc(newState.results)
    }

    this.setState(newState)
  }
}
