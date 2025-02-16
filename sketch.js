let ui

function setup() {
  createCanvas(800, 800)
  ui = create_ui(ui_values, ui_callbacks)
  _recenter()
  _restart()
}

function _recenter() {
  initial_x = width / 2
  initial_y = height / 2
  request_redraw()
}

function _pause() {
  is_paused = true
}

function _run() {
  is_paused = false
}

function _restart() {
  dna = initial_dna
  generations = 0
  evolution = new Evolution()
  stop_all_algorithms()
  queue_algorithm(evolution)
  _run()
}

let known_genetic_codes = [
  {
    name: "Square Wiggle",
    genes: "a:aab b:abd c:c d:bdb",
    d_n_a: "ab",
    angles: "0 90 180 270",
  },
  {
    name: "Hex Wiggle",
    genes: "a:aab b:abc c:bcb",
    d_n_a: "a",
    angles: "0 60 120 180 -60 -120",
  },
  {
    name: "Snowflake",
    genes: "a:aab b:aabc c:bb",
    d_n_a: "a",
    angles: "0 60 120",
  },
  {
    name: "Twirly",
    genes: "a:aab b:aabc c:dd",
    d_n_a: "a",
    angles: "0 60 120 120",
  },
  {
    name: "Chaos",
    genes: "a:abc b:azc c:bzdba",
    d_n_a: "a",
    angles: "0 60 120",
  },
]

const ui_values = {
  genetic_code: known_genetic_codes,
  evolution: {
    generations: 8,
    pause: _pause,
    run: _run,
    restart: _restart,
    recenter: _recenter
  }
}

function _parse_genes(value) {
  const genetic_code = {}

  const genes = value.split(' ')
  for (const gene of genes) {
    const from_to = gene.split(':')
    if (from_to.length == 2)
      genetic_code[from_to[0]] = from_to[1]
  }

  // console.log('genetic-code:', genetic_code)
  return genetic_code
}

function _parse_angles(value) {
  const angles = {}

  const angle_texts = value.split(' ')

  const genes = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < angle_texts.length; ++i) {
    const angle = (360 + Number(angle_texts[i])) % 360
    angles[genes[i]] = angle
  }

  // console.log('angles:', angles)
  return angles
}

let is_paused = false
let genetic_code = _parse_genes(ui_values.genetic_code[0].genes)
let angles = _parse_angles(ui_values.genetic_code[0].angles)
let initial_dna = ui_values.genetic_code[0].d_n_a
let evolution = undefined

const ui_callbacks = {
  genetic_code: {
    genes: function(value) { genetic_code = _parse_genes(value); _restart() },
    d_n_a: function(value) { initial_dna = value; _restart() },
    angles: function(value) { angles = _parse_angles(value); _restart() },
  },
  evolution: {
    generations: function(value) { ui_values.evolution.generations = value; _restart() },
  }
}

let redraw_gen = undefined

function request_redraw() {
  if (evolution == undefined)
    return
  redraw_gen = evolution.draw()
}

function draw() {
  if (is_paused)
    return

  if (!evolution)
    return

  progress = run_current_algorithm_at_fps()
  if (progress)
    update_ui_header(ui.evolution.label, 'Evolution: ' + progress)
  else
    update_ui_header(ui.evolution.label, `Evolution: ${evolution.dna.length} DNA`)

  if (redraw_gen) {
    const max_interactive_draw = 10
    let count = 0
    while (!redraw_gen.next().done && count++ < max_interactive_draw) {}

    if (redraw_gen.next().done) {
      redraw_gen = undefined
    }
  }
}
