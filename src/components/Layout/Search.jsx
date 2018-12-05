import './Search.scss'
import { Index } from 'elasticlunr'
import { navigateTo } from 'gatsby-link'
import React, { Component } from 'react'

export default class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: ''
    }
  }

  componentDidMount() {
    // if (this.props.location.pathname === '/search') {
    //   this.nameInput.focus()
    // }
  }
  render() {
    const { pathname } = this.props.location
    // const query = path
    return (
      <input
        type="text"
        className="search"
        ref={input => {
          this.nameInput = input
        }}
        placeholder="Search"
        value={this.props.location.pathname}
        // onClick={() => navigateTo('/search')}
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

  // onSearch = evt => {
  //   const query = evt.target.value
  //   console.log('QUERY', query)
  //   const newState = {
  //     query
  //   }
  //   navigateTo('/search?q=' + query)

  //   if (query.length >= 3) {
  //     this.index = this.getOrCreateIndex()
  //     newState.results = this.index
  //       .search(query, {
  //         title: { boost: 2 },
  //         content: { boost: 1 }
  //       })
  //       // Map over each ID and return the full document
  //       .map(({ ref }) => this.index.documentStore.getDoc(ref))
  //   }

  //   this.setState(newState)
  // }
}
