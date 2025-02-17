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
    angles: "a:0 b:90 c:180 d:270",
    d_n_a: "ab",
  },
  {
    name: "Tilted Pyramid",
    genes: "a:bfbfbfb b:cdc c:cdc d:dzh h:hg",
    angles: "a:0 b:90 c:180 d:270 e:0 f:90 g:180 h:270",
    d_n_a: "a",
  },
  {
    name: "Hex Wiggle",
    genes: "a:aab b:abc c:bcb",
    angles: "a:0 b:60 c:120 d:180 e:-60 f:-120",
    d_n_a: "a",
  },
  {
    name: "Snowflake",
    genes: "a:aab b:aabc c:bb",
    angles: "a:0 b:60 c:120",
    d_n_a: "a",
  },
  {
    name: "Twirly",
    genes: "a:aab b:aabc c:dd",
    angles: "a:0 b:60 c:120 d:120",
    d_n_a: "a",
  },
  {
    name: "Chaos",
    genes: "a:abc b:azc c:bzdba",
    angles: "a:0 b:60 c:120",
    d_n_a: "a",
  },
]

const ui_values = {
  genetic_code: known_genetic_codes,
  evolution: {
    generations: 10,
    pause: _pause,
    run: _run,
    restart: _restart,
    recenter: _recenter
  }
}

function _parse_gene_pair(text) {
  const from_to = text.split(':')
  if (from_to.length != 2)
    return undefined
  return from_to

}

function _parse_genes(value) {
  const genetic_code = {}

  const genes = value.split(' ')
  for (const gene of genes) {
    const from_to = _parse_gene_pair(gene)
    if (from_to != undefined)
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
    const from_to = _parse_gene_pair(angle_texts[i])
    if (from_to != undefined) {
      const angle = (360 + Number(from_to[1])) % 360
      angles[from_to[0]] = angle
    }
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
