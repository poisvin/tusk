import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["field", "button"]

  select(event) {
    const color = event.currentTarget.dataset.color
    this.fieldTarget.value = color

    // Update button styles
    this.buttonTargets.forEach(btn => {
      if (btn.dataset.color === color) {
        btn.classList.add('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-background-dark')
      } else {
        btn.classList.remove('ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-background-dark')
      }
    })
  }
}
