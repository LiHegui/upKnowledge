import React from "react"
import { useState, useMemo } from "react"

function HOC(Component) {
  const proDidMount = Component.prototype.componentDidMount
  Component.prototype.componentDidMount = function () {
    console.log('劫持生命周期：componentDidMount')
    proDidMount.call(this)
  }
  return class wrapComponent extends React.Component {
    render() {
      return <Component {...this.props} />
    }
  }
}
class Index extends React.Component {
  componentDidMount() {
    console.log('———didMounted———')
  }
  render() {
    return <div>hello,world</div>
  }
}

const IndexHoc = HOC(Index)

export default () => {
  return <div>
    <IndexHoc />
  </div>
}