import Alea from 'alea'
import Sketch from 'sketch-js'
// import InfoBox from './lib/info-box'
// import colorPalettes from './lib/color-palettes.json'

const seed = Math.random()
const rand = new Alea(seed)

// const info = new InfoBox(document.querySelector('.info'))
// setTimeout(() => info.show(), 5000)

const ctx = Sketch.create({
  container: document.querySelector('.container')
})
