let _ui_div = undefined
let _ui_line_div = undefined
let _ui_line_prev = undefined

const _ui_pt_width = 350
const _ui_button_pt_width = 60
const _ui_label_pt_width = 100
const _ui_overall_offset = 20
const _ui_overall_pt_padding = 8

function create_ui(values, callbacks) {
  overall_ui = {}
  _start_ui()
  _create_ui_section(overall_ui, values, callbacks)
  return overall_ui
}

function select_ui_function(fn, obj) {
  Object.assign(fn, obj)
  return fn
}

function _start_ui() {
  const offset = 20
  _ui_div = createDiv()
  _ui_div.position(width + _ui_overall_offset, _ui_overall_offset)
  _ui_div.style('background:white')
  _ui_div.style(`width:${_ui_pt_width}pt`)
  _ui_div.style(`height:${height - _ui_overall_offset * 2}px`)
  _ui_div.style(`padding:${_ui_overall_pt_padding}pt`)
}

function _create_ui_section(overall_ui, values, callbacks) {

  for (const [name, value] of Object.entries(values)) {
    let sub_ui = undefined
    if (value == undefined) {
      _start_ui_line()
    }
    else if (_is_number(value)) {
      sub_ui = _create_ui_integer(name, value, callbacks[name])
    }
    else if (_is_text(value)) {
      sub_ui = _create_ui_text(name, value, callbacks[name])
    }
    else if (_is_array(value)) {
      sub_ui = _create_ui_select(name, value, callbacks[name], overall_ui, callbacks)
    }
    else if (value === true || value === false) {
      sub_ui = _create_ui_checkmark(name, value, callbacks[name])
    }
    else if (value === File) {
      sub_ui = _create_ui_filename(name, value, callbacks[name])
    }
    else if (_is_function(value)) {
      sub_ui = _create_ui_button(name, value, callbacks[name])
    }
    else if (_is_object(value)) {
      sub_ui = {}
      _create_ui_header(name)
      _create_ui_section(sub_ui, value, callbacks[name])
    }

    overall_ui[name] = sub_ui
  }
}

function _is_number(value) {
  return Number.isInteger(value)
}

function _is_text(value) {
  return typeof value === 'string' || value instanceof String
}

function _is_array(value) {
  return value instanceof Array
}

function _is_object(value) {
  return value instanceof Object
}

function _is_function(value) {
  return value instanceof Function
}

function _create_ui_header(name) {
  _start_ui_line()
  _add_ui_to_line(createSpan(`<h3 style="font-size:14pt">${_convert_to_label(name)}</h3>`))
}

function _create_ui_label(name) {
  label = createSpan(_convert_to_label(name))
  label.style(`width:${_ui_label_pt_width}pt`)
  return label
}

function _create_ui_text(name, value, callback) {
  _start_ui_line()
  _add_separator_to_line()
  _add_ui_to_line(_create_ui_label(name), 'text')
  _add_separator_to_line()
  const input = _add_ui_to_line(createInput('' + value, 'text'))
  input.style(`width:${_ui_pt_width - 160}pt`)

  if (_is_function(callback)) {
    input.input(function() {
    callback(input.value())
    })
  }

  return input
}

function _create_ui_integer(name, value, callback) {
  _start_ui_line('integer')
  _add_separator_to_line()
  _add_ui_to_line(_create_ui_label(name), 'integer')
  _add_separator_to_line()
  const input = _add_ui_to_line(createInput('' + value, 'number'), 'integer')
  input.style('width:30pt')

  if (_is_function(callback)) {
      input.input(function() {
      callback(input.value())
    })
  }

  return input
}

function _create_ui_select(name, values, callback, overall_ui, callbacks) {
  if (!values.length)
    return

  _create_ui_header(name)

  _start_ui_line()
  _add_ui_to_line(_create_ui_label('Select ' + name), 'select')
  _add_separator_to_line()
  let select = _add_ui_to_line(createSelect())
  select.style(`min-width:${_ui_button_pt_width}pt`)

  let sub_ui = select

  // If the first value is an object, create an entire new section
  // with that object.
  const is_object = _is_object(values[0])
  let labels = undefined
  if (is_object) {
    sub_ui = {}
    _create_ui_section(sub_ui, values[0], callbacks[name])
    labels = []
    _start_ui_line()
    _create_ui_button('Save ' + name, function() {
      const index = select.value()
      console.log('selected', index)
      console.log('previous value', values[index])
      for (const [sub_name, sub_value] of Object.entries(values[index])) {
        const new_value = sub_ui[sub_name].value()
        values[index][sub_name] = new_value
        // callbacks[name][sub_name](new_value)
      }
      console.log('new value', values[index])
    })
    //_create_ui_button('Add ' + name)

    for (const value of values) {
      labels.push(value.name)
    }

  }
  else {
    labels = values
  }

  for (let i = 0; i < labels.length; ++i) {
    select.option('' + labels[i], i)
  }

  if (_is_function(callback)) {
    select.input(function() {
      callback(select.selected())
    })
  }
  else if (is_object) {
    select.input(function() {
      const index = select.value()
      console.log('selected', index)
      console.log('found value', values[index])
      for (const [sub_name, sub_value] of Object.entries(values[index])) {
        sub_ui[sub_name].value(sub_value)
        callbacks[name][sub_name](sub_value)
      }
    })
  }

  return sub_ui
}

function _create_ui_checkmark(name, value, callback) {
  let check = _add_ui_to_line(createCheckbox(_convert_to_label(name), false | value))

  if (_is_function(callback)) {
    check.mouseClicked(function() {
      callback(check.checked())
    })
  }

  return check
}

function _create_ui_filename(name, value, callback) {
  _start_ui_line()
  _add_separator_to_line()
  _add_ui_to_line(_create_ui_label(name + ': '), 'file')
  const fileLabel = _add_ui_to_line(createSpan('(No file selected)'))
  _add_separator_to_line()

  const fileInput = _add_ui_to_line(createFileInput(function (file) {
    if (file != undefined)
      _update_file_label(fileLabel, file.name)
    if (_is_function(callback)) {
      callback(file)
    }
  }))
  fileInput.style('display:none')

  const fileButton = _add_ui_to_line(createButton('Select...'))
  fileButton.style(`width:${_ui_button_pt_width}pt`)
  fileButton.mouseClicked(function () {
    fileInput.elt.click()
  })
  return fileInput
}

function _create_ui_button(name, value, callback) {
  _start_ui_line('button')
  _add_separator_to_line()
  let button = _add_ui_to_line(createButton(_convert_to_label(name)), 'button')
  button.style(`min-width:${_ui_button_pt_width}pt`)

  if (callback == undefined)
    callback = value
  if (_is_function(callback)) {
    button.mouseClicked(callback)
  }

  return button
}

function _convert_to_label(name) {
  // TODO: detect capitalization or underscore and add spaces, etc
  label = ''
  let next_upper = true
  for (let ch of name) {
    if (ch == '_' || ch == ' ') {
      if (label.length > 0 && label[-1] != ' ')
        label += ' '
      next_upper = true
    }
    else {
      if (ch.toUpperCase(ch) == ch) {
        if (label.length > 0 && label[-1] != ' ')
          label += ' '
      }
      if (next_upper)
        label += ch.toUpperCase()
      else
        label += ch
      next_upper = false
    }
  }
  return label
}

function _start_ui_line(elem_type) {
  if (_ui_line_prev != undefined && _ui_line_prev == elem_type)
    return

  _ui_line_div = createDiv()
  _ui_line_div.parent(_ui_div)
  _ui_line_div.style('padding:3pt')
  _ui_line_prev = undefined
}

function _add_ui_to_line(elem, elem_type) {
  elem.parent(_ui_line_div)
  if (elem_type != undefined)
    _ui_line_prev = elem_type
  return elem
}

function _add_separator_to_line(elem) {
  if (_ui_line_prev == undefined)
    return
  let sep = _add_ui_to_line(createSpan(' '))
  sep.style('width:12pt;padding:2pt')
}

function _update_file_label(fileLabel, url) {
  let fileName
  if (url != undefined)
    fileName = url.match('([^/.]+)+/?(\.[a-zA-Z0-9]+)?$')[1]
  else
    fileName = '(No file selected)'
  fileLabel.html(fileName)
}
