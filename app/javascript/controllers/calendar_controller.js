import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["weekBtn", "monthBtn", "viewMode", "monthLabel", "grid", "scheduleTitle", "scheduleCount", "taskList"]
  static values = {
    currentMonth: String,
    selectedDate: String,
    viewMode: String
  }

  connect() {
    this.updateView()
  }

  setWeekView() {
    this.viewModeValue = 'week'
    this.updateToggleButtons()
    this.navigateToDate()
  }

  setMonthView() {
    this.viewModeValue = 'month'
    this.updateToggleButtons()
    this.navigateToDate()
  }

  updateToggleButtons() {
    if (this.viewModeValue === 'week') {
      this.weekBtnTarget.classList.add('bg-background-dark', 'shadow', 'text-white')
      this.weekBtnTarget.classList.remove('text-[#92a4c9]')
      this.monthBtnTarget.classList.remove('bg-background-dark', 'shadow', 'text-white')
      this.monthBtnTarget.classList.add('text-[#92a4c9]')
    } else {
      this.monthBtnTarget.classList.add('bg-background-dark', 'shadow', 'text-white')
      this.monthBtnTarget.classList.remove('text-[#92a4c9]')
      this.weekBtnTarget.classList.remove('bg-background-dark', 'shadow', 'text-white')
      this.weekBtnTarget.classList.add('text-[#92a4c9]')
    }
  }

  previous() {
    const current = new Date(this.currentMonthValue)
    if (this.viewModeValue === 'week') {
      current.setDate(current.getDate() - 7)
    } else {
      current.setMonth(current.getMonth() - 1)
    }
    this.currentMonthValue = this.formatDate(current)
    this.navigateToDate()
  }

  next() {
    const current = new Date(this.currentMonthValue)
    if (this.viewModeValue === 'week') {
      current.setDate(current.getDate() + 7)
    } else {
      current.setMonth(current.getMonth() + 1)
    }
    this.currentMonthValue = this.formatDate(current)
    this.navigateToDate()
  }

  goToToday() {
    const today = new Date()
    this.currentMonthValue = this.formatDate(today)
    this.selectedDateValue = this.formatDate(today)
    this.navigateToDate()
  }

  selectDate(event) {
    const date = event.currentTarget.dataset.date
    this.selectedDateValue = date
    this.navigateToDate()
  }

  navigateToDate() {
    const url = new URL(window.location)
    url.searchParams.set('date', this.selectedDateValue)
    url.searchParams.set('month', this.currentMonthValue)
    url.searchParams.set('view', this.viewModeValue)
    Turbo.visit(url.toString())
  }

  updateView() {
    this.updateToggleButtons()
  }

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}
