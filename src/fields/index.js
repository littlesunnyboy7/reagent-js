import TextField from './TextField'
import TimeRangeField from './TimeRangeField'
import ToggleField from './ToggleField'
import ObjectField from './ObjectField'
import CheckboxField from './CheckboxField'
import FileField from './FileField'
import AddressField from './AddressField'
import SelectField from './SelectField'
import RadioField from './RadioField'
import DateField from './DateField'

export const fields = {
  string: TextField,
  time_ranges: TimeRangeField,
  toggle: ToggleField,
  object: ObjectField,
  checkbox: CheckboxField,
  file: FileField,
  address: AddressField,
  select: SelectField,
  radio: RadioField,
  date: DateField,
}

export { default } from './Field'