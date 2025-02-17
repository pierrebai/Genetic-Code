class Evolution extends MultiStepsAlgo {
  constructor() {
    super()
    this.max_generations = ui_values.evolution.generations
    this.dna = initial_dna
    this.genetic_code = genetic_code
    this.angles = angles
  }

  *run() {
    super.run()
    generations = 0
    while (++generations < this.max_generations) {
      let new_dna = ''
      if (this.dna != undefined) {
        let count = 0
        for (const gene of this.dna) {
          if (++count % 1000 == 0) {
            yield `generation #${generations} evolving ${Math.round(count * 100 / this.dna.length)}%`
            if (this.stopped)
              return
          }
          if (gene  in this.genetic_code) 
            new_dna += this.genetic_code[gene]
          else
            new_dna += gene
        }
      }
      this.dna = new_dna
      yield `generation #${generations})`
      if (this.stopped)
        return
      request_redraw()
    }

    this.finished()
  }

  *draw() {
    background(0)
    stroke(200)
    noFill()

    let x = initial_x
    let y = initial_y
    let heading = 0
    let count = 0
    
    beginShape(LINES)

    for (const gene of this.dna) {
      if (++count % 1000 == 0) {
        endShape()
        yield `drawing ${Math.round(count * 100 / this.dna.length)}%`
        if (this.stopped)
          return
        beginShape(LINES)
      }
      if (gene in this.angles)
        heading = (heading + this.angles[gene]) % 360
      const rad_heading = heading * Math.PI / 180
      const new_x = x + Math.cos(rad_heading) * movement
      const new_y = y + Math.sin(rad_heading) * movement
      vertex(x, y)
      vertex(new_x, new_y)
      x = new_x
      y = new_y
    }
    endShape()
  }

  finished() {
    super.finished()
    request_redraw()
  }
}
