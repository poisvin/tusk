import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["message"]

  connect() {
    // Auto-dismiss after 5 seconds
    this.messageTargets.forEach(message => {
      setTimeout(() => {
        this.dismissMessage(message)
      }, 5000)
    })
  }

  dismiss(event) {
    const message = event.currentTarget.closest('[data-flash-target="message"]')
    this.dismissMessage(message)
  }

  dismissMessage(message) {
    if (message) {
      message.classList.add('animate-slide-out')
      setTimeout(() => {
        message.remove()
        // Remove container if empty
        if (this.messageTargets.length === 0) {
          this.element.remove()
        }
      }, 300)
    }
  }
}
