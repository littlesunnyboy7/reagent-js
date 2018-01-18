import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Spiner from './Spiner';

import { fetchAddresses, fetchHouses } from './fetch_data'

import './style.less'

class Fias extends Component {
  constructor(props) {
    super(props)
    const { value } = props;

    this.state = {
      houseIsSelected: false,
      load: false,
      addrObj: {},
      addresses: [],
      houses: [],
      textValue: value ? value.text : '',
      isVisible: false
    }
  }

  _data = () => {
    return {
      address: this.state.addrObj,
      text: this.state.textValue
    }
  }

  _hideAddressDropdown = () => this.setState({ isVisible: false })

  _handleLoadHouses = (addr) => {
    const { houses_url } = this.props;
    this.setState({ load: true, textValue: addr.title })
    fetchHouses(houses_url, addr.aoguid)
      .then(json => {
        if (json.error) {
          this.setState({
            houses: json,
            load: false
          })
        } else {
          this.setState({
            addrObj: json.addr_obj,
            houses: json.houses,
            load: false
          })
        }
      })
  }

  _handleHouseSelect = (houseObj) => {
    let str = this.state.textValue;
    const arr = new Array();

    if (houseObj.house) {
      arr.push(`, дом ${houseObj.house}`)
    }

    if (houseObj.building) {
      arr.push(`, корпус ${houseObj.building}`)
    }

    str += arr.join('')
    this.setState({
      addrObj: { ...this.state.addrObj, ...houseObj },
      textValue: str,
      isVisible: false,
      houseIsSelected: true
    })
  }

  _ejectAppartmentFromAddressString = (value) => {
    const arr = value.split(',')
      this.setState({
        addrObj: {
          ...this.state.addrObj,
          appartment: arr[arr.length - 1].replace(/\s/g, '')
        }
      })
  }

  _handleChange = (e) => {
    const { addresses_url } = this.props;
    const value = e.target.value

    this.setState({ textValue: value })

    if (this.state.houseIsSelected) {
      this._ejectAppartmentFromAddressString(value)
    } else {
      this.setState({ load: true })
      fetchAddresses(addresses_url, value)
        .then(addresses => {
          this._cleanState()
          this.setState({ addresses, load: false, isVisible: true })
        })
    }

    if (value.length == 0) {
      this._cleanState()
    }
  }

  _cleanState = () => this.setState({
    houseIsSelected: false,
    addresses: [],
    load: false,
    addrObj: {},
    houses: [] ,
    isVisible: false
  })

  _listItems = () => {
    const { addresses, houses } = this.state
    const items = new Array()

    if (addresses.error || houses.error) {
      return <ListItem disabled={true} primaryText={`${addresses.error || houses.error}`} />
    }

    if (houses.length > 0) {
      houses.map((house, index) => {
        items.push(
          <ListItem
            key={index}
            onClick={() =>this._handleHouseSelect(house)}
            primaryText={`${house.house ? `Дом ${house.house}` : ''} ${ house.building ? ` корпус ${house.building}`  : '' }`}
          />
        )
      })
    } else {
      addresses.map((address, index) => {
        items.push(
          <ListItem
            key={index}
            onClick={() =>this._handleLoadHouses(address)}
            primaryText={address.title}
          />
        )
      })
    }

    return items
  }

  render() {
    const { title, required, name } = this.props;
    const { isVisible } = this.state;

    return (
      <div>
        <input
          key={name}
          type='hidden'
          name={name}
          value={JSON.stringify(this._data())}
        />
        <TextField
          floatingLabelText={title}
          style={ { zIndex: 3 } }
          onChange={this._handleChange}
          required={required}
          value={ this.state.textValue }
          fullWidth={true}
        />
        {
          isVisible && (
            <div>
              <div
                className='c-fiac__paper-background'
                onClick={() => this._hideAddressDropdown()}
              ></div>
              <Paper
                className='c-fiac__paper'
              >
                {
                  this.state.load ? (
                    <Spiner />
                  ) : ( this._listItems() )
                }
              </Paper>
            </div>
          )
        }
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
  required: PropTypes.bool
}

export default Fias;
