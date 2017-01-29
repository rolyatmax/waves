const { requestAnimationFrame } = window

function random (low, high) {
  if (Array.isArray(low)) {
    return low[random(low.length)]
  }
  if (high === undefined) {
    high = low
    low = 0
  }
  return Math.random() * (high - low) + low | 0
}

function startAnimation (renderFn, duration) {
  let startTime
  return new Promise(function (resolve) {
    function _render (t) {
      startTime = startTime || t
      const step = (t - startTime) / duration
      renderFn(step)
      if (step < 1) {
        requestAnimationFrame(_render)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(_render)
  })
}

export default class InfoBox {
  constructor (el) {
    this.el = el
    const title = el.querySelector('h1')
    const titleText = title.textContent.trim()
    this.letters = this.buildLetterEls(titleText)
    title.textContent = ''
    this.letters.forEach(title.appendChild.bind(title))
  }

  buildLetterEls (text) {
    const letters = []
    while (text.length) {
      let span = document.createElement('span')
      span.textContent = text[0]
      text = text.slice(1)
      letters.push(span)
    }
    return letters
  }

  fadeInBg () {
    const {height, width} = this.el.getBoundingClientRect()
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d')
    c.height = height
    c.width = width
    c.style.height = `${height}px`
    c.style.width = `${width}px`
    const divStyle = window.getComputedStyle(this.el)
    c.style.bottom = divStyle.bottom
    c.style.left = divStyle.left
    c.style.position = 'absolute'
    c.style.zIndex = this.el.style.zIndex || 0
    this.el.style.zIndex = this.el.style.zIndex ? this.el.style.zIndex + 1 : 1
    this.el.parentElement.appendChild(c)

    const hue = random(360) | 0

    return startAnimation(step => {
      step = Math.pow(step, 3)
      const radius = step * width | 0
      const lightness = step * 50 + 30 | 0
      ctx.arc(width / 2, height / 2, radius, 0, 2 * Math.PI)
      ctx.fillStyle = `hsl(${hue}, ${5}%, ${lightness}%)`
      ctx.fill()
    }, 350)
  }

  fadeInText () {
    this.letters.forEach((span, i) => {
      const delay = (this.letters.length - i) * 15
      span.style.transition = `all 400ms cubic-bezier(.15,.62,.38,.94) ${delay}ms`
    })
    this.el.classList.add('show')
  }

  show () {
    this.fadeInBg().then(this.fadeInText.bind(this))
  }
}
