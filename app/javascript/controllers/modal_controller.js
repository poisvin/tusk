import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["content"]

  connect() {
    // Listen for turbo frame load to show modal
    this.element.addEventListener('turbo:frame-load', this.handleFrameLoad.bind(this))
  }

  handleFrameLoad(event) {
    if (event.target.id === 'modal-content' && this.contentTarget.children.length > 0) {
      this.open()
    }
  }

  open() {
    this.element.classList.remove('hidden')
    this.element.classList.add('flex')
    document.body.classList.add('overflow-hidden')
  }

  close() {
    this.element.classList.add('hidden')
    this.element.classList.remove('flex')
    document.body.classList.remove('overflow-hidden')
    // Clear the frame content
    this.contentTarget.innerHTML = ''
  }

  handleSubmit(event) {
    // Close modal after successful form submission
    if (event.detail.success) {
      this.close()
    }
  }

  // Allow opening modal from outside via custom event
  openModal() {
    this.open()
  }
}
