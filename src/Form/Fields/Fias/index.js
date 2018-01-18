import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Spiner from './Spiner';

import { fetchAddresses, fetchHouses } from './fetch_data'

import './style.less'

class Fias extends Component {
  constructor(props) {
    super(props)
    const { value } = props;

    this.state = {
      house_is_selected: false,
      load: false,
      addr_obj: {},
      addresses: [],
      houses: [],
      text_value: value ? value.text : '',
      display: 'none'
    }
  }

  _hideAddressDropdown = () => this.setState({ display: 'none', address_is_selected: false })

  _handleLoadHouses = (addr) => {
    const { houses_url } = this.props;
    this.setState({ load: true, text_value: addr.title })
    fetchHouses(this, houses_url, addr.aoguid)
  }

  _handleHouseSelect = (house_obj) => {
    let str = this.state.text_value;
    const arr = new Array();

    if (house_obj.house) {
      arr.push(`, дом ${house_obj.house}`)
    }

    if (house_obj.building) {
      arr.push(`, корпус ${house_obj.building}`)
    }

    str += arr.join('')

    this.setState({
      addr_obj: Object.assign(this.state.addr_obj, house_obj),
      text_value: str,
      display: 'none',
      house_is_selected: true
    })
  }

  _handleChange = (e) => {
    const { addresses_url } = this.props;
    const value = e.target.value

    this.setState({ text_value: value })

    if (this.state.house_is_selected) {
      const arr = value.split(',')
      this.setState({
        addr_obj: Object.assign(this.state.addr_obj, { flat: arr[arr.length - 1].replace(/\s/g, '') })
      })
    } else {
      this.setState({ load: true })
      fetchAddresses(this, addresses_url, value)
    }

    if (value.length == 0) {
      this._cleanState()
    }
  }

  _cleanState = () => this.setState({
    house_is_selected: false,
    addresses: [],
    load: false,
    addr_obj: {},
    houses: [] ,
    display: 'none'
  })

  render() {
    const { title, required, name } = this.props;
    return (
      <div>
        <input
          key={name}
          type='hidden'
          name={name}
          value={JSON.stringify(this.state)}
        />
        <TextField
          floatingLabelText={title}
          style={ { zIndex: 3 } }
          onChange={this._handleChange}
          required={required}
          value={ this.state.text_value }
          fullWidth={true}
        />
        <div
          className='c-fiac__paper-background'
          style={{display: this.state.display}}
          onClick={() => this._hideAddressDropdown()}
        ></div>
        <Paper
          className='c-fiac__paper'
          style={{display: this.state.display}}
        >
          {
            this.state.load ? (
              <Spiner />
            ) : (
              <List>
                {
                  this.state.houses.length > 0 ? (
                    this.state.houses.map((house, index) => <ListItem key={index} onClick={() =>this._handleHouseSelect(house)} primaryText={`${house.house ? `Дом ${house.house}` : ''} ${ house.building ? ` корпус ${house.building}`  : '' }`} />)
                  ) : (
                    this.state.addresses.map((address, index) => <ListItem key={index} onClick={() =>this._handleLoadHouses(address)} primaryText={address.title} />)
                  )
                }
              </List>
            )
          }
        </Paper>
      </div>
    )
  }
}

Fias.propTypes = {
  title: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  addresses_url: PropTypes.string.isRequired,
  houses_url: PropTypes.string.isRequired,
  value: PropTypes.object,
  required: PropTypes.bool,

}

export default Fias;
