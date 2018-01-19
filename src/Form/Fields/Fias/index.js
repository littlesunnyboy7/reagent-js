import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import Spiner from './Spiner';

import { fetchAddresses, fetchHouses } from './fetch_data'
import { MODES } from './constants'

import './style.less'

class Fias extends Component {
  constructor(props) {
    super(props)
    const { value } = props;

    this.state = {
      mode: MODES.SELECTING_ADDRESS,
      isLoading: false,
      addrObj: {},
      addresses: [],
      houses: [],
      textValue: value ? value.text : '',
      isVisible: false,
      fetchingError: null
    }
  }

  _data = () => ({ address: this.state.addrObj, text: this.state.textValue })

  _hideAddressDropdown = () => this.setState({ isVisible: false })

  _handleLoadHouses = (addr) => {
    const { housesUrl } = this.props;
    this.setState({ isLoading: true, textValue: addr.title })
    fetchHouses(housesUrl, addr.aoguid)
      .then(json => {
        if (json.error) {
          this.setState({
            fetchingError: json.error,
            isVisible: true,
            isLoading: false
          })
        } else {
          this.setState({
            addrObj: json.addr_obj,
            houses: json.houses,
            isVisible: true,
            isLoading: false,
            mode: MODES.SELECTING_HOUSE
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
      mode: MODES.SELECTING_APPARTMENT
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
    const { addressesUrl } = this.props;
    const value = e.target.value

    this.setState({ textValue: value })

    if (this.state.mode === MODES.SELECTING_APPARTMENT) {
      this._ejectAppartmentFromAddressString(value)
    } else {
      this.setState({ isLoading: true })
      fetchAddresses(addressesUrl, value)
        .then(addresses => {
          if (addresses.error) {
            this.setState({
              fetchingError: addresses.error,
              isVisible: true,
              isLoading: false
            })
          } else {
            this.setState({
              addresses,
              isVisible: true,
              isLoading: false
            })
          }
        })
    }

    if (value.length == 0) {
      this.setState({ mode: MODES.SELECTING_ADDRESS })
    }
  }

  _listItems = () => {
    const { addresses, houses, fetchingError, mode } = this.state
    const items = new Array()

    if (fetchingError) {
      return <ListItem disabled={true} primaryText={`${fetchingError}`} />
    }

    if (houses.length > 0 && mode === MODES.SELECTING_HOUSE) {
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
    const { isVisible, isLoading } = this.state;

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
                  isLoading ? (
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
  addressesUrl: PropTypes.string.isRequired,
  housesUrl: PropTypes.string.isRequired,
  value: PropTypes.object,
  required: PropTypes.bool
}

export default Fias;
