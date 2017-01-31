import Alea from 'alea'
import Sketch from 'sketch-js'
import newArray from 'new-array'
import sortBy from 'lodash/sortBy'
import bspline from 'b-spline'
import tinycolor from 'tinycolor2'
import InfoBox from './lib/info-box'
import { GUI } from 'dat-gui'
import colorPalettes from './lib/color-palettes.json'

const seed = Math.random()
const rand = new Alea(seed)

const info = new InfoBox(document.querySelector('.info'))
setTimeout(() => info.show(), 5000)

const settings = {
  lineCount: 15,
  pointCount: 50,
  padding: 40,
  dotSize: 1,
  colors: rand() * colorPalettes.length | 0,
  dotAlpha: 0.1,
  lineAlpha: 0.7,
  magnitude: 120,
  splineDegree: 0.25,
  speed: 8,
  darkTheme: false
}

const container = document.querySelector('.container')

const waves = Sketch.create({
  container: container,

  setup () {
    const backgroundColor = settings.darkTheme ? '#333' : '#fbfbfb'
    container.style.backgroundColor = backgroundColor
    const blending = settings.darkTheme ? 'lighten' : 'darken'
    this.globalCompositeOperation = blending
    const y = this.height / 2
    this.lines = newArray(settings.lineCount).map((line, i) => ({
      color: i,
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
    const colors = colorPalettes[settings.colors]
    this.lines.forEach(line => {
      const controlPoints = line.points.map(p => p.position)
      const color = colors[line.color % colors.length]
      const circleColor = tinycolor(color).setAlpha(settings.dotAlpha).toRgbString()
      drawCircles(this, controlPoints, circleColor)
      const degree = Math.max(1, settings.splineDegree * settings.pointCount | 0)
      const points = calculateSplinePoints(controlPoints, degree)
      const lineColor = tinycolor(color).setAlpha(settings.lineAlpha).toRgbString()
      drawLine(this, points, lineColor)
    })
  }
})

const restart = waves.setup.bind(waves)
const newColor = () => {
  settings.colors = rand() * colorPalettes.length | 0
}
const gui = new GUI()
gui.add(settings, 'lineCount', 1, 100).step(1).onFinishChange(restart)
gui.add(settings, 'pointCount', 2, 100).step(1).onFinishChange(restart)
gui.add(settings, 'dotSize', 1, 100).step(1)
gui.add(settings, 'dotAlpha', 0, 1).step(0.05)
gui.add(settings, 'lineAlpha', 0, 1).step(0.05)
gui.add(settings, 'magnitude', 1, 500).step(5)
gui.add(settings, 'splineDegree', 0.0, 0.95).step(0.05)
gui.add(settings, 'speed', 1, 40).step(1)
gui.add(settings, 'darkTheme').onFinishChange(restart)
gui.add({ newColor }, 'newColor') // todo: linearly interpolate to new colors

function calculateSplinePoints (controls, degree) {
  const points = []
  const granularity = 100
  let i = 0
  while (i < granularity) {
    const progress = i / granularity
    points.push(bspline(progress, degree, controls))
    i += 1
  }
  return points
}

function drawLine (ctx, points, color) {
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  points.slice(1).forEach(point => {
    ctx.lineTo(point[0], point[1])
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
