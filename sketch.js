let ui

function setup() {
  createCanvas(800, 800)
  setup__movement()
  ui = create_ui(ui_values, ui_callbacks)
  _restart()
}

function _pause() {
  is_paused = true
}

function _run() {
  is_paused = false
}

function _restart() {
  stop_all_algorithms()
  evolution = new Evolution()
  queue_algorithm(evolution)
  background(0)
  _run()
}

const ui_values = {
  genetic_code: known_genetic_codes,
  evolution: {
    generations: 11,
    pause: _pause,
    run: _run,
    restart: _restart,
    recenter: recenter_movement
  }
}

function _parse_pair(text) {
  const from_to = text.split(':')
  if (from_to.length != 2)
    return [undefined, undefined]
  return from_to
}

function _parse_genes(value) {
  const genetic_code = {}

  const genes = value.split(' ')
  for (const gene of genes) {
    const [from, to] = _parse_pair(gene)
    if (from == undefined)
      continue
    genetic_code[from] = to
  }

  // console.log('genetic-code:', genetic_code)
  return genetic_code
}

function _parse_angles(value) {
  const angles = {}

  const angle_texts = value.split(' ')

  for (let i = 0; i < angle_texts.length; ++i) {
    const [from, angle_text] = _parse_pair(angle_texts[i])
    if (from == undefined)
      continue
    const angle = (360 + Number(angle_text)) % 360
    angles[from] = angle
  }

  // console.log('angles:', angles)
  return angles
}

function _parse_distances(value) {
  const distances = {}

  const distance_texts = value.split(' ')

  for (let i = 0; i < distance_texts.length; ++i) {
    const [from, distance_text] = _parse_pair(distance_texts[i])
    if (from == undefined)
      continue
    const distance = Number.parseFloat(distance_text)
    if (isNaN(distance))
      continue
    distances[from] = distance
  }

  // console.log('distances:', distances)
  return distances
}

let is_paused = false
let genetic_code = _parse_genes(ui_values.genetic_code[0].genes)
let angles = _parse_angles(ui_values.genetic_code[0].angles)
let distances = _parse_distances(ui_values.genetic_code[0].distances)
let initial_dna = ui_values.genetic_code[0].d_n_a
let evolution = undefined

const ui_callbacks = {
  genetic_code: {
    genes: function(value) { genetic_code = _parse_genes(value); _restart() },
    d_n_a: function(value) { initial_dna = value; _restart() },
    angles: function(value) { angles = _parse_angles(value); _restart() },
    distances: function(value) { distances = _parse_distances(value); _restart() },
  },
  evolution: {
    generations: function(value) { ui_values.evolution.generations = value; _restart() },
  }
}

let redraw_gen = undefined

function request_redraw() {
  if (evolution == undefined)
    return
  background(0)
  redraw_gen = evolution.draw()
}

function draw() {
  if (is_paused)
    return

  if (!evolution)
    return

  apply_movement()

  progress = run_current_algorithm_at_fps()
  if (progress)
    update_ui_header(ui.evolution.label, 'Evolution: ' + progress)
  else
    update_ui_header(ui.evolution.label, `Evolution: ${evolution.final_genes.length} genes`)

  if (redraw_gen) {
    const max_interactive_draw = 10
    let count = 0
    while (!redraw_gen.next().done && count++ < max_interactive_draw) {}

    if (redraw_gen.next().done) {
      redraw_gen = undefined
    }
  }
}
