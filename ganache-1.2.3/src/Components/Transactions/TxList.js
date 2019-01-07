import React, { Component } from 'react'
import connect from '../Helpers/connect'
import * as Transactions from '../../Actions/Transactions'

import MiniTxCard from './MiniTxCard'

import MiningIcon from '../../Elements/icons/force_mine.svg'

class TxList extends Component {
  render () {
    var content
    if (this.props.transactions.length > 0) {
      content = this.props.transactions.map((tx) => {
        return <MiniTxCard
          tx={tx}
          receipt={this.props.receipts[tx.hash]}
          key={`tx-${tx.hash}`}
        />
      })
    } else {
      content = 
        <div className="Waiting">
          No transactions
        </div>
    }

    return (
      <div className="TxList">
        { content }
      </div>
    )
  }
}

export default connect(TxList)