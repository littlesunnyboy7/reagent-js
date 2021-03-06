import React, { PropTypes, Component } from 'react'

import TextField from 'material-ui/TextField'

import FieldTitle from '../FieldTitle'
import SelectDialog from './SelectDialog'
import SelectedItemList from './SelectedItemList'

import { getText } from '../../utils.js'

class ModalSelectField extends Component {
  constructor (props) {
    super (props)
    const { value, defaultValue } = props
    let selectedItems = value || defaultValue || []
    if (!Array.isArray(selectedItems)) {
      selectedItems = [selectedItems]
    }
    this.state = {
      open: false,
      searchWords: '',
      focused: false,
      selectedItems
    }
    this.lang = {
      text: 'Поиск в справочнике'
    }
  }

  componentDidMount = () => {
    this.validation()
  }

  handleFocus = () => this.setState({focused: true})

  handleBlur = () => this.setState({focused: false}, this.validation)

  handleOpen = () => this.setState({open: true})

  handleClose = () => this.setState({open: false, searchWords: ''}, this.focus)

  handleSearch = (e, text) => this.setState({searchWords: text})

  handleItemCheck = (e, isSelected) => {
    const { selectedItems } = this.state
    const { multiple } = this.props
    const { value } = e.target
    if (!multiple) {
      this.setState({ selectedItems: [value] })
    } else if ( isSelected ) {
      this.setState({selectedItems: selectedItems.concat(value)})
    } else {
      this.setState({selectedItems: selectedItems.filter( id => id != value )})
    }
  }

  handleSelectedItemClick = (id) => {
    const { selectedItems } = this.state
    this.setState({selectedItems: selectedItems.filter( item => item != id )}, this.focus)
  }

  handleChange = (e, text) => this.setState({open: true, searchWords: text})

  focus = () => this.refs.input.focus()

  validation = () => {
    const { selectedItems } = this.state
    const { min, max, required } = this.props
    const { input } = this.refs
    const node = input.getInputNode()
    //console.log('[MULTISELECT FIELD] validation', selectedItems, min, max);
    if (min && selectedItems.length < min) {
      node.setCustomValidity(`Должно быть выбрано количество элементов большее, либо равное ${min}`)
    } else if (max && selectedItems.length > max) {
      node.setCustomValidity(`Должно быть выбрано количество элементов меньшее, либо равное ${max}`)
    } else if (required && !selectedItems.length) {
      node.setCustomValidity('Пожалуйста, заполните это поле.')
    } else {
      node.setCustomValidity('')
    }
  }

  filterItems (items, searchWords, selectedItems) {
    return items.filter( item =>
      !item.disabled && (
        searchWords == '' ? true : item.title.toLowerCase().includes(searchWords.toLowerCase())
      ) && (
        !selectedItems.includes(item)
      )
    )
    //const findedItems = searchWords == '' ? items : items.filter(({title}) => title.toLowerCase().includes(searchWords))
  }

  handleShowMore = () => {
    const { lastViewedIndex } = this.state
    if (lastViewedIndex < this.props.items.length) {
      this.setState({lastViewedIndex: lastViewedIndex + 20})
    }
  }

  render () {
    const { title, items, name, required, multiple } = this.props
    const { ModalSelectField } = this.context
    const { searchWords, selectedItems, focused, open, lastViewedIndex } = this.state
    const filteredItems = this.filterItems(items, searchWords, selectedItems)
    return (
      <div
        className='c-field'
        >
        <FieldTitle
          title={title}
          required={required}
          focused={focused || open}
        />
        <div>
          <TextField
            name='modalselect_input'
            hintText={ getText(this.lang, ModalSelectField, 'text') }
            fullWidth={ true }
            value=""
            onChange={ this.handleChange }
            onFocus={ this.handleFocus }
            onBlur={ this.handleBlur }
            onDoubleClick={ this.handleOpen }
            autoComplete='off'
            ref='input'
          />
          <SelectedItemList
            name={name}
            items={items}
            onClick={this.handleSelectedItemClick}
            selectedItems={selectedItems}
            dialogOpen={this.state.open}
          />
        </div>
        <SelectDialog
          title={title}
          open={this.state.open}
          items={filteredItems}
          selectedItems={selectedItems}
          searchWords={searchWords}
          totalCount={items.length}
          onClose={this.handleClose}
          onMore={this.handleShowMore}
          onSearch={this.handleSearch}
          onCheck={this.handleItemCheck}
          multiple={ multiple }
        />
      </div>
    )
  }
}

ModalSelectField.contextTypes = {
  ModalSelectField: PropTypes.shape({
    text: PropTypes.string
  })
};

export default ModalSelectField
