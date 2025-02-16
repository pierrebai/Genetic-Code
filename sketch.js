let ui

function setup() {
  createCanvas(600, 600)
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
  dna = ui_values.genetic_code[0].d_n_a
  generations = 0
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
    angles: "0 60 120 180 -60 -120",
  },
]

const ui_values = {
  genetic_code: known_genetic_codes,
  movement: 8,
  max_generations: 8,
  pause: _pause,
  run: _run,
  restart: _restart,
}

function _parse_genes(value) {
  const genetic_code = {}

  const genes = value.split(' ')
  for (const gene of genes) {
    const from_to = gene.split(':')
    if (from_to.length == 2)
      genetic_code[from_to[0]] = from_to[1]
  }

  console.log('genetic-code:', genetic_code)
  return genetic_code
}

function _parse_angles(value) {
  const angles = {}

  const angle_texts = value.split(' ')

  const genes = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < angle_texts.length; ++i) {
    const angle = (360 + angle_texts[i]) % 360
    angles[genes[i]] = angle
  }

  console.log('angles:', angles)
  return angles
}

let is_paused = false
let genetic_code = _parse_genes(ui_values.genetic_code[0].genes)
let angles = _parse_angles(ui_values.genetic_code[0].angles)
let dna = ui_values.genetic_code[0].d_n_a

let generations = 0

const ui_callbacks = {
  genetic_code: {
    name: function(value) { console.log('new name', value)},
    genes: function(value) { genetic_code = _parse_genes(value); _restart() },
    d_n_a: function(value) { dna = value; _restart() },
    angles: function(value) { angles = _parse_angles(value); _restart() },
  },
  movement: function(value) { ui_values.movement = value; _restart() },
  max_generations: function(value) { ui_values.max_generations = value; _restart() },
}

function _evolve() {
  let new_dna = ''
  if (dna != undefined) {
    for (const gene of dna) {
      if (gene  in genetic_code) 
        new_dna += genetic_code[gene]
      else
        new_dna += gene
    }
  }
  dna = new_dna
}

function _draw_genes() {
  let x = width / 2
  let y = height / 2
  let heading = 0
  for (const gene of dna) {
    if (gene in angles) {
      heading = (heading + angles[gene]) % 360
      rad_heading = heading * Math.PI / 180
      const new_x = x + Math.cos(rad_heading) * ui_values.movement
      const new_y = y + Math.sin(rad_heading) * ui_values.movement
      line(x, y, new_x, new_y)
      x = new_x
      y = new_y
    }
  }
}

function draw() {
  if (is_paused)
    return

  background(0)
  stroke(240)
  if (generations++ < ui_values.max_generations)
    _evolve()
  _draw_genes()
}
