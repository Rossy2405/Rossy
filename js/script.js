console.clear()

class Utils {
  static randomRange(min, max) {
    return Math.random() * (max - min) + min
  }

  static mapRange (value, inputMin, inputMax, outputMin, outputMax, clamp) {
    if (Math.abs(inputMin - inputMax) < Number.EPSILON) {
      return outputMin;
    } else {
      var outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
      if (clamp) {
        if (outputMax < outputMin) {
          if (outVal < outputMax) outVal = outputMax;
          else if (outVal > outputMin) outVal = outputMin;
        } else {
          if (outVal > outputMax) outVal = outputMax;
          else if (outVal < outputMin) outVal = outputMin;
        }
      }
      return outVal;
    }
  }
}

Utils.simplex = new SimplexNoise('seed') 

class App {
  constructor() {
    this.config = {
      bgColor: chroma({ h: 230, s: 0.5, l: 0.1}).hex()
    }
    
    this.canvas = document.getElementById('c')
    this.ctx = this.canvas.getContext('2d')
    
    this.shadowCanvas = document.createElement('canvas')
    this.shadowCtx = this.shadowCanvas.getContext('2d')
    
    this.angle = 0 
    this.timestamp = 0
    this.fpsHistory = []
    
    this.setUpVars()
    this.setUpListeners()
    this.setUpGui()
    this.update()
  }

  setUpGui() {
    const pane = new Tweakpane()
    const folder = pane.addFolder({
      expanded: false,
      title: 'Settings',
    })
    folder.addInput(this.config, 'bgColor')
  }
  
  setUpVars() {
    this.canvas.width = this.shadowCanvas.width = this.wWidth = window.innerWidth
    this.canvas.height = this.shadowCanvas.height = this.wHeight = window.innerHeight
    this.wCenterX = this.wWidth / 2
    this.wCenterY = this.wHeight / 2
    this.wHypot = Math.hypot(this.wWidth, this.wHeight)
    this.wMin = Math.min(this.wWidth, this.wHeight)
  }
  
  setUpListeners() {
    window.addEventListener('resize', this.setUpVars.bind(this))
  }
  
  draw(ctx) {
    ctx.save()
    ctx.fillStyle = this.config.bgColor
    ctx.fillRect(0, 0, this.wWidth, this.wHeight)
    ctx.restore()
    
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.translate(this.wCenterX, this.wCenterY)
    const innerRadius = this.wMin * 0.1
    const outerRadius = this.wHypot / 2
    const numberOfArms = Math.PI / 10
    const lineSegments = 150
    
    for (let theta = numberOfArms; theta <= Math.PI * 2; theta += numberOfArms) {
      const startX = Math.sin(theta + this.angle) * innerRadius
      const startY = Math.cos(theta + this.angle) * innerRadius
      
      for (let s = 0; s < lineSegments; s++) {
        const bendStep = s * 0.01
        const endX = Math.sin(theta + bendStep) * outerRadius
        const endY = Math.cos(theta + bendStep) * outerRadius
        const progress = s/lineSegments
        
        ctx.beginPath()
        ctx.moveTo(startX, startY)
        
        ctx.lineTo(
          startX + ((endX - startX) * progress), 
          startY + ((endY - startY) * progress)
        )
      
        ctx.strokeStyle = 'hsla(0, 100%, 100%, ' + (1 - progress) + ')'
        ctx.stroke()
      }
    }
    
    ctx.restore()
    
    ctx.beginPath()
    ctx.arc(this.wCenterX, this.wCenterY, innerRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'hsla(0, 100%, 100%, 0.9)'
    ctx.fill()
  }
  
  update(t) {
    const prevTimestamp = this.timestamp * 5000
    
    if (t) {
      this.angle -= 0.01
      this.timestamp = t / 5000
      this.draw(this.shadowCtx)
    }
    
    this.ctx.clearRect(0, 0, this.wWidth, this.wHeight)
    this.ctx.drawImage(this.shadowCanvas, 0, 0)
    
    // show fps
    const fps = Math.round(1 / (t - prevTimestamp) * 1000)
    this.fpsHistory.unshift(fps)
    this.fpsHistory.length = 5
    this.ctx.font = '16px sans-serif'
    this.ctx.fillText(this.fpsHistory.reduce((a,b) => a+b) / 5, 50, 50)
    
    window.requestAnimationFrame(this.update.bind(this))
  }
}

new App()
