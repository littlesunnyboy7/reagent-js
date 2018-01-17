import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Spiner from './Spiner';

import './Spiner/style.less'

class FIAS extends Component {
  state = {
    address_is_selected: false,
    load: false,
    addr_obj: {},
    addresses: [],
    houses: []
  }

  _style = () => {
    return {
      minWidth: '60%',
      zIndex: 2,
      position: 'absolute',
    }
  }

  _handleLoadHouses = (aoguid) => {
    const self = this
    self.setState({ load: true })
    fetch(`http://fiasco.dev.it.vm/lookup/get_houses_and_obj?lookup=${aoguid}`)
      .then(response => response.json())
      .then(json => {
        self.setState({
          addr_obj: json.addr_obj,
          houses: json.houses,
          load: false,
          address_is_selected: true
        })
      })
  }

  _handleHouseSelect = (house_obj) => {
    this.setState({
      addr_obj: Object.assign(this.state.addr_obj, house_obj)
    })

    console.log('-----', this.state)
  }

  _handleKeyUp = (e) => {
    const value = e.target.value
    const self = this

    if (this.state.address_is_selected) {
      console.log('asd');
    } else {
      self.setState({ load: true })
      fetch(`http://fiasco.dev.it.vm/lookup?lookup=${value}`)
        .then(response => response.json())
        .then(addresses => {
          self._cleanState()
          self.setState({ addresses, load: false })
        })
    }
  }

  _cleanState = () => this.setState({ addresses: [], load: false })

  render() {
    return (
      <div>
        <TextField
          onKeyUp={this._handleKeyUp}
        />
        <div style={this._style()}>
        <Paper style={ { maxHeight: 500, overflowY: 'scroll' } }>
          {
            this.state.load ? (
              <Spiner />
            ) : (
              <List>
                {
                  this.state.houses.length > 0 ? (
                    this.state.houses.map((house, index) => <ListItem key={index} onClick={() =>this._handleHouseSelect(house)} primaryText={house.house} />)
                  ) : (
                    this.state.addresses.map((address, index) => <ListItem key={index} onClick={() =>this._handleLoadHouses(address.aoguid)} primaryText={address.title} />)
                  )
                }
              </List>
            )
          }
        </Paper>
        </div>
      </div>
    )
  }
}

export default FIAS;
