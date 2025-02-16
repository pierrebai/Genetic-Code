let initial_x = 0
let initial_y = 0
let movement = 8

let _drag_start_x = 0
let _drag_start_y = 0

function mousePressed() {
  _drag_start_x = mouseX
  _drag_start_y = mouseY
}

function mouseDragged() {
  initial_x += mouseX - _drag_start_x
  initial_y += mouseY - _drag_start_y
  _drag_start_x = mouseX
  _drag_start_y = mouseY
  _force_redraw = true
}

function mouseWheel(event) {
  if (event.delta < 0) {
    movement *= 1.2
  }
  else {
    movement *= (1/1.2)
  }

  _force_redraw = true
 
  return false
}