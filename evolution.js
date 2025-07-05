class Evolution extends MultiStepsAlgo {
  constructor() {
    super()
    this.max_generations = ui_values.evolution.generations
    this.dna = initial_dna ? initial_dna : ''
    this.genetic_code = genetic_code
    this.angles = angles
    this.distances = distances

    this.x = 0
    this.y = 0
    this.heading = 0

    this.final_genes = []
  }

  *run() {
    super.run()

    // Note: we need to reverse the DNA so that the first gene is at
    //       the back and gets popped first.
    const evolving_genes_stack = Array.from(this.dna).reverse()
    const generations_stack = Array(this.dna.length)
    generations_stack.fill(this.max_generations)

    const draw_queue = []
    let count = 0
    while (evolving_genes_stack.length > 0) {
      if (++count % 1000 == 0) {
        yield `evolving ${count}`
        if (this.stopped)
          return
      }
      const gene = evolving_genes_stack.pop()
      const generations = generations_stack.pop()
      const lc_gene = gene.toLowerCase()
    
      if (lc_gene in this.genetic_code) {
        const new_genes = Array.from(this.genetic_code[lc_gene])
        if (generations > 1) {
          // Note: we need to reverse the new genes so that the first gene
          //       is at the back and gets popped first.
          evolving_genes_stack.splice(evolving_genes_stack.length, 0, ...new_genes.reverse())
          const prev_length = generations_stack.length
          generations_stack.length = prev_length + new_genes.length
          generations_stack.fill(generations - 1, prev_length, prev_length + new_genes.length)
        }
        else {
          draw_queue.splice(draw_queue.length, 0, ...new_genes)
        }
      }
      else {
        // A gene not in the genetic code stays itself, so there is not
        // point of keeping looping over generations, it will stay itself.
        draw_queue.push(gene)
      }

      if (!is_filled) {
        if (draw_queue.length >= 1000) {
          this._flush_draw_queue(draw_queue)
          if (this.stopped)
            return
        }
      }
    }

    this._flush_draw_queue(draw_queue)
    this.finished()
  }

  _flush_draw_queue(draw_queue) {
    [this.heading, this.x, this.y] = this._draw(draw_queue, this.heading, this.x, this.y)
    this.final_genes.splice(this.final_genes.length, 0, ...draw_queue)
    draw_queue.length = 0
  }

  _draw(draw_queue, heading, x, y) {
    if (is_filled) {
      noStroke()
      fill('white')
      beginShape()
    }
    else {
      stroke('white')
      noFill()
      strokeWeight(get_movement_line_weight())
      beginShape(LINES)
    }

    let count = 0

    for (const gene of draw_queue) {
      const lc_gene = gene.toLowerCase()
      if (lc_gene in this.angles)
        heading = (heading + this.angles[lc_gene]) % 360
      if (lc_gene == gene) {
        const distance = lc_gene in this.distances ? this.distances[lc_gene] : 1
        const rad_heading = heading * Math.PI / 180
        const new_x = x + Math.cos(rad_heading) * 8 * distance
        const new_y = y + Math.sin(rad_heading) * 8 * distance
        vertex(x, y)
        vertex(new_x, new_y)
        x = new_x
        y = new_y
        if (!is_filled) {
          if (++count % 1000 == 0) {
            endShape()
            beginShape(LINES)
          }
        }
      }
    }
    endShape()

    return [heading, x, y]
  }

  finished() {
    super.finished()
    this.draw()
  }

  *draw() {
    let x = 0
    let y = 0
    let heading = 0

    if (is_filled) {
      this._draw(this.final_genes, heading, x, y)
    }
    else {
      for (let i = 0; i < this.final_genes.length; i += 1000) {
        [heading, x, y] = this._draw(this.final_genes.slice(i, i + 1000), heading, x, y)
        yield
      }
    }
  }
}
