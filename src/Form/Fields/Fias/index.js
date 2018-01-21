import React, { PropTypes, Component } from 'react'
import TextField from 'material-ui/TextField'
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import FloatingActionButton from 'material-ui/FloatingActionButton'
import SocialLocationCity from 'material-ui/svg-icons/social/location-city'
import Spiner from './Spiner';
import AddressDialog from '../AddressField/AddressDialog'

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
      addrObj: value ? value.address : {},
      addresses: [],
      houses: [],
      textValue: value ? value.text : '',
      isVisible: false,
      fetchingError: null,
      openAddressDialog: false,
      addressSubstring: null,
      houseSubstring: null,
      filteredHouses: []
    }
  }

  _data = () => ({ address: this.state.addrObj, text: this.state.textValue })

  _hideAddressDropdown = () => this.setState({ isVisible: false })

  _handleAddressSelect = (addr) => {
    this.refs.fiasTextField.focus()

    this.setState({
      textValue: addr.title + ', ',
      addressSubstring: addr.title + ', ',
      mode: MODES.SELECTING_HOUSE
    })

    this._loadHouses(addr.aoguid)
  }

  _loadAddresses = (query) => {
    const { addressesUrl } = this.props;
    this.setState({ isLoading: true })

    fetchAddresses(addressesUrl, query)
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

  _loadHouses = (aoguid) => {
    const { housesUrl } = this.props;
    this.setState({ isLoading: true })

    fetchHouses(housesUrl, aoguid)
      .then(json => {
        if (json.error) {
          this.setState({
            fetchingError: json.error,
            isVisible: true,
            isLoading: false
          })
        } else {
          const composedHouses = this._composeHouseString(json.houses)

          this.setState({
            addrObj: json.addr_obj,
            houses: composedHouses,
            filteredHouses: composedHouses,
            isVisible: true,
            isLoading: false,
            mode: MODES.SELECTING_HOUSE
          })
        }
      })
  }


  _handleHouseSelect = (houseObj) => {
    const { addressSubstring } = this.state
    const arr = new Array();

    if (houseObj.house) {
      arr.push(houseObj.house)
    }

    if (houseObj.building) {
      arr.push(houseObj.building)
    }

    if (houseObj.structure) {
      arr.push(houseObj.structure)
    }

    this.setState({
      houseSubstring: arr.join(''),
      addrObj: { ...this.state.addrObj, ...houseObj },
      textValue: `${addressSubstring}${arr.join('')}, `,
      isVisible: false,
      mode: MODES.SELECTING_APPARTMENT
    })

    this.refs.fiasTextField.focus()
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

  _ejectHouseFromAddressString = (value) => {
    const arr = value.split(',')
    return arr[arr.length - 1] //.replace(/\s/g, '')
  }

  _handleSwitchingToPreviousMode = (e) => {
    const { addressSubstring, houseSubstring } = this.state
    const value = e.target.value

    if (addressSubstring && (addressSubstring.length > value.length)) {
      this.setState({
        mode: MODES.SELECTING_ADDRESS,
        houseSubstring: null
      })
    }

    if (houseSubstring && ((addressSubstring + houseSubstring).length > value.length)) {
      this.setState({
        mode: MODES.SELECTING_HOUSE,
        isVisible: true
      })
    }
  }

  _handleChange = (e) => {
    const { mode } = this.state
    const value = e.target.value

    this._handleSwitchingToPreviousMode(e)

    this.setState({ textValue: value })

    switch(mode) {
      case MODES.SELECTING_HOUSE:
        this._filterOfHouses(value)
        break
      case MODES.SELECTING_APPARTMENT:
        this._ejectAppartmentFromAddressString(value)
        break
      default:
        this._loadAddresses(value)
        break
    }
  }

  _composeHouseString = (houses) => {
    return houses.map(house => {
      const arr = new Array();

      if (house.house) {
        arr.push(`дом ${house.house}`)
      }

      if (house.building) {
        arr.push(`корпус ${house.building}`)
      }

      if (house.structure) {
        arr.push((`строение ${house.structure}`))
      }

      return {
        originalObject: house,
        text: arr.join(', ')
      }
    })
  }

  _filterOfHouses = (value) => {
    const { houses } = this.state
    const ejectedValue = this._ejectHouseFromAddressString(value)
    const filteredHouses = houses.filter(house => house.text.includes(ejectedValue))

    this.setState({filteredHouses})
  }

  _formatAddressString = (address) => {
    if (!address) return null
    const appendStringToAddress = (addrStr, string, prefix) => {
      if (string) {
        return `${addrStr}${addrStr ? ', ' : ''}${prefix || ''}${string}`
      } else {
        return addrStr
      }
    }
    return Object.keys(addressPartitionals).reduce((addrStr, key) => (
      appendStringToAddress(addrStr, address[key])
    ), '')
  }

  _openAddressDialog = () => this.setState({ openAddressDialog: true })
  _closeAddressDialog = () => this.setState({ openAddressDialog: false })
  _handlePopupKeyUp = (e) => e.keyCode==27 && this._closeAddressDialog()
  _handleSubmit = (e) => {
    e.preventDefault()
    const value = Object.keys(addressPartitionals).reduce((result, name) => {
      const { value } = e.target.elements.namedItem(name)
      value ? result[name] = value : null
      return result
    },{})

    this.setState({
      addrObj: { ...this.state.addrObj, ...value },
      openAddressDialog: false
    })
  }

  _listItemWithAddresDialogButton = () =>
    <ListItem
      disabled={true}
      primaryText='Адрес отсутствует в базе ФИАС. Нажмите кнопку и введите адрес вручную'
      rightAvatar={this._openAddressDialogButton()}
    />

  _listItems = () => {
    const {
      addresses,
      filteredHouses,
      fetchingError,
      mode,
      textValue
    } = this.state
    const items = new Array()

    if (fetchingError) {
      return <ListItem disabled={true} primaryText={`${fetchingError}`} />
    }

    switch(mode) {
      case MODES.SELECTING_ADDRESS:
        if (addresses.length === 0 && textValue.length > 0) {
          items.push(this._listItemWithAddresDialogButton())
        }

        addresses.map((address, index) => {
          items.push(
            <ListItem
              key={index}
              onClick={() =>this._handleAddressSelect(address)}
              primaryText={address.title}
            />
          )
        })
        break
      case MODES.SELECTING_HOUSE:
        if (filteredHouses.length === 0 && textValue.length > 0) {
          items.push(this._listItemWithAddresDialogButton())
        }

        filteredHouses.slice(0, 9).map((house, index) => {
          items.push(
            <ListItem
              key={index}
              onClick={() =>this._handleHouseSelect(house.originalObject)}
              primaryText={`${house.text}`}
            />
          )
        })
        break
      default:
        break
    }

    return items
  }

  _openAddressDialogButton = () => (<FloatingActionButton
    mini={true}
    onClick={this._openAddressDialog}
    secondary={true}
    tabIndex={-1}
    >
    <SocialLocationCity/>
  </FloatingActionButton>)

  render() {
    const { title, required, name } = this.props;
    const {
      isVisible,
      isLoading,
      addrObj,
      openAddressDialog
    } = this.state;

    return (
      <div>
        <input
          key={name}
          type='hidden'
          name={name}
          value={JSON.stringify(this._data())}
        />
        <AddressDialog
          open={openAddressDialog}
          title={title}
          value={addrObj}
          addressPartitionals={addressPartitionals}
          onClose={this._closeAddressDialog}
          onSubmit={ this._handleSubmit }
          onKeyUp={ this._handlePopupKeyUp }
        />
        <TextField
          ref='fiasTextField'
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
                  ) : (
                    <List>{this._listItems()}</List>
                  )
                }
              </Paper>
            </div>
          )
        }
      </div>
    )
  }
}

const addressPartitionals = {
  zip: 'Индекс',
  region: 'Регион',
  sub_region: 'Район',
  city: 'Город',
  settlement: 'Населенный пункт',
  street: 'Улица',
  house: 'Дом',
  building: 'Строение',
  appartment: 'Помещение'
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
