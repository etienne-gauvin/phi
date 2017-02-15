export default class Phi {
	
	constructor(container) {

    this.container = container
    this.canvas = this.$('canvas')
    this.ctx = this.canvas.getContext('2d')

    this.phiBuffer = document.createElement('canvas')
    this.phiBufferCtx = this.phiBuffer.getContext('2d')
    
    this.picBuffer = document.createElement('canvas')
    this.picBufferCtx = this.picBuffer.getContext('2d')

    // Éléments HTML
    this.$phiColor = this.$('input[type="color"][name="phi"]')
    this.$phiSize  = this.$('input[type="range"][name="phiSize"]')
    this.$phiAlpha = this.$('input[type="range"][name="phiAlpha"]')
    this.$phiAlign = this.$('select[name="phiAlign"]')
    this.$phiOperation = this.$('select[name="phiOperation"]')
    this.$backgroundColor = this.$('input[type="color"][name="background"]')
    this.$backgroundColorEnabled = this.$('input[type="checkbox"][name="backgroundColorEnabled"]')

    // Écouteurs
    const elements = {
      phi: [
        this.$phiColor,
        this.$phiSize,
        this.$phiAlign
      ],
      pic: [
        this.$backgroundColor,
        this.$backgroundColorEnabled
      ]
    }

    for (let element of elements.phi)
      element.addEventListener('change', () => this.phiChanged = true)
    
    for (let element of elements.pic)
      element.addEventListener('change', () => this.picChanged = true)
    
    // Image du phi
    this.phi = new Image
    this.phi.src = './images/phi.svg'
    
    // Photo par défaut
    this.picture = new Image
    this.picture.src = './images/faites-glisser.svg'
    this.picture.addEventListener('load', () => {
      this.updateCanvasSize()
    })
    
    // Gestion du drag n drop
    this.container.addEventListener('dragover', this.handleDragOver.bind(this))
    this.container.addEventListener('drop', this.handleDrop.bind(this))

    // Sauvegarde de l'image
    this.$('.save-canvas').addEventListener('click', (event) => {
      event.target.href = this.canvas.toDataURL()
      event.target.download = this.filename
    })
    
    // Affichage de l'image (méthode alternative)
    this.$('.alt-save-canvas').addEventListener('click', (event) => {
      window.open(this.canvas.toDataURL(), this.filename, 'menubar=no,toolbar=no,location=no')
    })
    
    // Sauvegarde de l'image
    this.$('input[name="picture-select"]').addEventListener('change', (event) => {
      this.getNewPicture(event.target.files)
    })
    
    // Calcul de la taille du canvas
    this.updateCanvasSize()
	}

  $(selector) {
    return this.container.querySelector(selector)
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
    return this.$phiColor.value
  }
  
  get phiAlpha () {
    return +this.$phiAlpha.value / 100
  }
  
  get phiSize () {
    return +this.$phiSize.value / 100
  }
  
  get phiAlign () {
    const select = this.$phiAlign
    return select.options[select.selectedIndex].value
  }
  
  get phiOperation () {
    const select = this.$phiOperation
    return select.options[select.selectedIndex].value
  }
  
  get backgroundColor () {
    return this.$backgroundColor.value
  }
  
  get backgroundColorEnabled () {
    return this.$backgroundColorEnabled.checked
  }
  
  /**
   * Dessiner l'image
   */
  draw(timestamp) {

    if (this.phiSize !== this.cachedPhiSize) {
      this.phiChanged = true
      this.cachedPhiSize = this.phiSize
    }
    
    if (this.phiChanged) {
      this.phiChanged = false

      // Taille et position du phi
      const size = this.phiSize
      const align = this.phiAlign
      let x = 0, y = 0

      if (align === 'center') {
        x = this.width  * (1 - size) / 2
        y = this.height * (1 - size) / 2
      }
      else {
        if (align.match(/^bottom-/))
          y = this.height * (1 - size)

        if (align.match(/-right$/))
          x = this.width * (1 - size)
      }
    
      // Coloration du phi
      this.phiBufferCtx.save()
      this.phiBufferCtx.clearRect(0, 0, this.width, this.height)
      this.phiBufferCtx.drawImage(this.phi, x, y, this.width * size, this.height * size)
      this.phiBufferCtx.globalCompositeOperation = 'source-in'
      this.phiBufferCtx.fillStyle = this.phiColor
      this.phiBufferCtx.fillRect(0, 0, this.width, this.height)
      this.phiBufferCtx.restore()
    }

    if (this.picChanged) {
      this.picChanged = false

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

      // Photo
      this.picBufferCtx.clearRect(0, 0, this.width, this.height)
      this.picBufferCtx.drawImage(this.picture, sx, sy, sw, sh, dx, dy, dw, dh)

      if (this.backgroundColorEnabled) {
        this.picBufferCtx.save()

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
        this.picBufferCtx.globalAlpha = 0.3
        this.picBufferCtx.globalCompositeOperation = 'luminosity'
        this.picBufferCtx.fillRect(0, 0, this.width, this.height)
        this.picBufferCtx.restore()
      }
    }

    // Afficher le tout
    this.ctx.save()
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.ctx.drawImage(this.picBuffer, 0, 0, this.width, this.height)
    this.ctx.globalAlpha = this.phiAlpha
    this.ctx.globalCompositeOperation = this.phiOperation
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

    this.picChanged = true
    this.phiChanged = true
  }
  
  /**
   * Gérer le drop
   */
   handleDrop(event) {
    event.stopPropagation()
    event.preventDefault()

    this.getNewPicture(event.dataTransfer.files)
  }
  
  /**
   * Récupère l'image depuis le drop ou la sélection de fichier
   */
   getNewPicture(files) {
    for (let file of files) {
      if (file.type.match('image.*')) {
        const reader = new FileReader()

        console.log(file)
        this.filename = file.name
        
        reader.addEventListener('load', (event) => {
          this.picture = new Image
          this.picture.src = event.target.result
          this.updateCanvasSize()
        })
        
        reader.readAsDataURL(file)
        break
      }
    }
  }
}