import React, { Component } from 'react'
import InputText from '../../Elements/InputText'
import LogContainer from './LogContainer'

class Logs extends Component {
  constructor () {
    super()
  }

  render () {
    return (
      <div className="LogsScreen">
        <main>
          <LogContainer />
        </main>
      </div>
    )
  }
}

export default Logs
