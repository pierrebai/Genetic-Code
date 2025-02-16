let initial_x = 0
let initial_y = 0
let movement = 8
const zoom_factor = 1.2
const shrink_factor = 1 / zoom_factor

let _drag_start_x = undefined
let _drag_start_y = undefined

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

  initial_x += mouseX - _drag_start_x
  initial_y += mouseY - _drag_start_y
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
    movement *= zoom_factor
    initial_x = (initial_x - mouseX) * zoom_factor + mouseX
    initial_y = (initial_y - mouseY) * zoom_factor + mouseY
    }
  else {
    movement *= shrink_factor
    initial_x = (initial_x - mouseX) * shrink_factor + mouseX
    initial_y = (initial_y - mouseY) * shrink_factor + mouseY
  }

  request_redraw()
 
  return false
}