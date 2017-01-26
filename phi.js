class Phi {
	
	constructor(container) {

    this.container = container
    this.canvas = this.container.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.phiBuffer = document.createElement('canvas')
    this.phiBufferCtx = this.phiBuffer.getContext('2d')
    
    this.picBuffer = document.createElement('canvas')
    this.picBufferCtx = this.picBuffer.getContext('2d')
    
    // Image du phi
    this.phi = new Image
    this.phi.src = 'phi.svg'
    
    // Photo par défaut
    this.picture = new Image
    this.picture.src = 'faites-glisser.svg'
    this.picture.addEventListener('load', () => {
      this.updateCanvasSize()
    })
    
    // Gestion du drag n drop
    this.container.addEventListener('dragover', this.handleDragOver.bind(this))
    this.container.addEventListener('drop', this.handleDrop.bind(this))
    
    // Calcul de la taille du canvas
    this.updateCanvasSize()
	}

  get width() {
    return this._width
  }

  set width(width) {
    this._width = this.canvas.width = this.phiBuffer.width = this.picBuffer.width = width
  }

  get height() {
    return this._height
  }

  set height(height) {
    this._height = this.canvas.height = this.phiBuffer.height = this.picBuffer.height = height
  }

  get phiColor () {
    return this.container.querySelector('input[type="color"][name="phi"]').value
  }
  
  get backgroundColor () {
    return this.container.querySelector('input[type="color"][name="background"]').value
  }
  
  /**
   * Dessiner l'image
   */
  draw(timestamp) {
    
    // Calculs nécessaires pour l'affichage
    // de la photo en mode "remplissage"
    const dx = 0
    const dy = 0
    const dw = this.width
    const dh = this.height
    const ratio = dw / dh
    
    let sx = 0, sy = 0
    let sw = this.picture.width
    let sh = this.picture.height
    
    if (this.picture.width < this.picture.height) {
      sh = sw * (dh / dw)
      sy = this.picture.height / 2 - sh / 2
    }
    else {
      sw = sh * (dw / dh)
      sx = this.picture.width / 2 - sw / 2
    }
    
    // Coloration du phi
    this.phiBufferCtx.save()
    this.phiBufferCtx.clearRect(0, 0, this.width, this.height)
    this.phiBufferCtx.drawImage(this.phi, 0, 0, this.width, this.height)
    this.phiBufferCtx.globalCompositeOperation = 'source-in'
    this.phiBufferCtx.fillStyle = this.phiColor
    this.phiBufferCtx.fillRect(0, 0, this.width, this.height)
    this.phiBufferCtx.restore()

    // Photo
    this.picBufferCtx.save()
    this.picBufferCtx.clearRect(0, 0, this.width, this.height)
    this.picBufferCtx.drawImage(this.picture, sx, sy, sw, sh, dx, dy, dw, dh)

    // Réduire le contraste
    this.picBufferCtx.globalAlpha = 0.3
    this.picBufferCtx.globalCompositeOperation = 'luminosity'
    this.picBufferCtx.fillStyle = 'gray'
    this.picBufferCtx.fillRect(0, 0, this.width, this.height)

    // Colorer la photo
    this.picBufferCtx.globalAlpha = 1.0
    this.picBufferCtx.globalCompositeOperation = 'color'
    this.picBufferCtx.fillStyle = this.backgroundColor
    this.picBufferCtx.fillRect(0, 0, this.width, this.height)
    this.picBufferCtx.restore()

    // Afficher le tout
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.picBuffer, 0, 0, this.width, this.height)
    this.ctx.globalAlpha = 0.9
    this.ctx.drawImage(this.phiBuffer, 0, 0, this.width, this.height)
    this.ctx.restore()
    
    requestAnimationFrame(this.draw.bind(this))
  }
  
  /**
   * Gérer le hover du drag n drop
   */
  handleDragOver(event) {
    event.stopPropagation()
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }
  
  /**
   * Redimensionne le canvas à la taille de la photo
   */
  updateCanvasSize() {
    let size = 640

    if (this.picture && this.picture.width && this.picture.height) {
      size = Math.min(Math.max(+this.picture.width, +this.picture.height), 1280)
    }

    this.width = this.canvas.width = size
    this.height = this.canvas.height = size
  }
  
  /**
   * Gérer le drop
   */
   handleDrop(event) {
    event.stopPropagation()
    event.preventDefault()

    const files = event.dataTransfer.files
    
    for (let i = 0, f; f = files[i]; i++) {
      
      if (!f.type.match('image.*')) {
        continue
      }

      const reader = new FileReader()
      
      reader.addEventListener('load', (event) => {
        this.picture = new Image
        this.picture.src = event.target.result
        this.updateCanvasSize()
      })
      
      reader.readAsDataURL(f)
      break
    }
  }
}