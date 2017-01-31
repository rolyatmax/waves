import Alea from 'alea'
import Sketch from 'sketch-js'
import newArray from 'new-array'
import sortBy from 'lodash/sortBy'
import bspline from 'b-spline'
import tinycolor from 'tinycolor2'
// import InfoBox from './lib/info-box'
import colorPalettes from './lib/color-palettes.json'

const seed = Math.random()
const rand = new Alea(seed)

// const info = new InfoBox(document.querySelector('.info'))
// setTimeout(() => info.show(), 5000)

const settings = {
  lineCount: 10,
  pointCount: 50,
  padding: 40,
  dotSize: 1,
  colors: colorPalettes[rand() * colorPalettes.length | 0],
  dotAlpha: 0.5,
  lineAlpha: 0.8,
  magnitude: 500,
  splineDegree: 25,
  speed: 1
}

const container = document.querySelector('.container')
container.style.backgroundColor = '#333'

Sketch.create({
  container: container,

  setup () {
    this.globalCompositeOperation = 'lighten'
    const y = this.height / 2
    this.lines = newArray(settings.lineCount).map((line, i) => ({
      color: settings.colors[i % settings.colors.length],
      points: sortBy(newArray(settings.pointCount).map(() => ({
        position: [rand() * (this.width - settings.padding * 2) + settings.padding, y],
        speed: rand() * 2 - 1
      })), (p) => p.position[0])
    }))
  },

  update () {
    const t = this.millis
    const distToCenterX = this.width / 2 - settings.padding
    this.lines.forEach(line => {
      // only the middle points for now
      const points = line.points.slice(1, line.points.length - 1)
      points.forEach(point => {
        let weight = 1 - (Math.abs(point.position[0] - distToCenterX) / distToCenterX)
        weight = Math.pow(weight, 2.5)
        const magnitude = settings.magnitude * weight
        const speed = point.speed / 2000 * settings.speed
        point.position[1] = Math.sin(t * speed) * magnitude + this.height / 2
      })
    })
  },

  draw () {
    this.lines.forEach(line => {
      const controlPoints = line.points.map(p => p.position)
      const circleColor = tinycolor(line.color).setAlpha(settings.dotAlpha).toRgbString()
      drawCircles(this, controlPoints, circleColor)
      const points = calculateSplinePoints(controlPoints, settings.splineDegree)
      const lineColor = tinycolor(line.color).setAlpha(settings.lineAlpha).toRgbString()
      drawLine(this, points, lineColor)
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

function drawLine (ctx, points, color) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  points.slice(1).forEach(point => {
    ctx.lineTo(point[0], point[1])
    // drawCircle(ctx, point[0], point[1], settings.dotSize, color)
  })
  ctx.stroke()
}

function drawCircles (ctx, points, color) {
  points.forEach(point => {
    drawCircle(ctx, point[0], point[1], settings.dotSize, color)
  })
}

function drawCircle (ctx, x, y, r, color) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}
