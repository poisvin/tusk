import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { id: Number, done: Boolean }

  toggle(event) {
    // Let the form submit handle the toggle
    // This controller is for any additional client-side logic
  }
}
