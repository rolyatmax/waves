import Alea from 'alea'
import Sketch from 'sketch-js'
import newArray from 'new-array'
import sortBy from 'lodash/sortBy'
import bspline from 'b-spline'
// import InfoBox from './lib/info-box'
import colorPalettes from './lib/color-palettes.json'

const seed = Math.random()
const rand = new Alea(seed)

// const info = new InfoBox(document.querySelector('.info'))
// setTimeout(() => info.show(), 5000)

const settings = {
  lineCount: 2,
  pointCount: 20,
  padding: 40,
  dotSize: 50,
  colors: colorPalettes[rand() * colorPalettes.length | 0],
  magnitude: 250,
  splineDegree: 10
}

Sketch.create({
  container: document.querySelector('.container'),

  setup () {
    const y = this.height / 2
    this.lines = newArray(settings.lineCount).map((line, i) => ({
      color: settings.colors[i % settings.colors.length],
      points: sortBy(newArray(settings.pointCount).map(() => ({
        position: [rand() * (this.width - settings.padding * 2) + settings.padding, y],
        speed: rand()
      })), (p) => p.position[0])
    }))
  },

  update () {
    const t = this.millis
    this.lines.forEach(line => {
      // only the middle points for now
      const points = line.points.slice(1, line.points.length - 1)
      points.forEach(point => {
        point.position[1] = Math.sin(t * point.speed / 100) * settings.magnitude + this.height / 2
      })
    })
  },

  draw () {
    this.lines.forEach(line => {
      const controlPoints = line.points.map(p => p.position)
      const points = calculateSplinePoints(controlPoints, settings.splineDegree)
      points.forEach(point => {
        drawCircle(this, point[0], point[1], settings.dotSize, line.color)
      })
    })
  }
})

function calculateSplinePoints (controls, degree) {
  const points = []
  let progress = 0
  while (progress < 1) {
    points.push(bspline(progress, degree, controls))
    progress += 0.01
  }
  return points
}

function drawCircle (ctx, x, y, r, color) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}
