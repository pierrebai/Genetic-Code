let _initial_x = 0
let _initial_y = 0
let _zoom = 1
const _zoom_factor = 1.2
const _shrink_factor = 1 / _zoom_factor

let _drag_start_x = undefined
let _drag_start_y = undefined

function setup__movement() {
  _initial_x = width / 2
  _initial_y = height / 2
  _zoom = 1
}

function apply_movement() {
  translate(_initial_x, _initial_y)
  scale(_zoom)
}

function recenter_movement() {
  _initial_x = width / 2
  _initial_y = height / 2
  request_redraw()
}

function get_movement_line_weight() {
  if (_zoom >= 1.5)
    return 2 / (_zoom)

  if (_zoom >= 0.2)
    return 1 / (_zoom)

  return 1 / (_zoom * 2)
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width)
    return

  if (mouseY < 0 || mouseY > height)
    return

  _drag_start_x = mouseX
  _drag_start_y = mouseY
}

function mouseDragged() {
  if (_drag_start_x == undefined)
    return

  if (_drag_start_y == undefined)
    return

  _initial_x += mouseX - _drag_start_x
  _initial_y += mouseY - _drag_start_y
  _drag_start_x = mouseX
  _drag_start_y = mouseY
  request_redraw()
}

function mouseReleased() {
  _drag_start_x = undefined
  _drag_start_y = undefined
}

function mouseWheel(event) {
  if (event.delta < 0) {
    _zoom *= _zoom_factor
    _initial_x = (_initial_x - mouseX) * _zoom_factor + mouseX
    _initial_y = (_initial_y - mouseY) * _zoom_factor + mouseY
    }
  else {
    _zoom *= _shrink_factor
    _initial_x = (_initial_x - mouseX) * _shrink_factor + mouseX
    _initial_y = (_initial_y - mouseY) * _shrink_factor + mouseY
  }

  request_redraw()
 
  return false
}