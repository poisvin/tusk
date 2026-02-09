import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["recurrence", "weeklyDays"]

  toggleWeeklyDays() {
    const isWeekly = this.recurrenceTarget.value === 'weekly'

    if (this.hasWeeklyDaysTarget) {
      if (isWeekly) {
        this.weeklyDaysTarget.classList.remove('hidden')
      } else {
        this.weeklyDaysTarget.classList.add('hidden')
      }
    }
  }
}
