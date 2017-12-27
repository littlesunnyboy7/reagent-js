import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List';

class FIAS extends Component {
  state = { addresses: [] }

  _handleChange = (e) => {
    const value = e.target.value
    const self = this

    if (value.length > 2) {
      fetch(`http://192.168.33.48:8060/lookup?lookup=${value}`)
        .then(response => response.json())
        .then(addresses => {
          self._cleanState()
          self.setState({ addresses })
        })
    }
  }

  _cleanState = () => this.setState({ addresses: [] })

  render() {
    return (
      <div>
        <TextField
          onChange={this._handleChange}
        />
        <List>
          {
            this.state.addresses.map((address, index) => <ListItem key={index} primaryText={address.title} />)
          }
        </List>
      </div>
    )
  }
}

export default FIAS;
