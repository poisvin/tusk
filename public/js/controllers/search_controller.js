import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "input"]

  toggle(event) {
    event.preventDefault()
    this.containerTarget.classList.toggle('hidden')
    if (!this.containerTarget.classList.contains('hidden') && this.hasInputTarget) {
      this.inputTarget.focus()
    }
  }

  search() {
    // Debounce search
    clearTimeout(this.searchTimeout)
    this.searchTimeout = setTimeout(() => {
      this.inputTarget.form.requestSubmit()
    }, 300)
  }
}
