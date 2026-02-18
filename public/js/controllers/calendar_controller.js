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
    const current = this.parseDate(this.currentMonthValue)
    if (this.viewModeValue === 'week') {
      current.setDate(current.getDate() - 7)
    } else {
      current.setMonth(current.getMonth() - 1)
    }
    this.currentMonthValue = this.formatDate(current)
    this.navigateToDate()
  }

  next() {
    const current = this.parseDate(this.currentMonthValue)
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
    const dest = url.toString()

    if (window.Turbo) {
      window.Turbo.visit(dest)
    } else {
      window.location.href = dest
    }
  }

  updateView() {
    this.updateToggleButtons()
  }

  // Drag and drop for task rescheduling

  dragStart(event) {
    const taskId = event.currentTarget.dataset.taskId
    event.dataTransfer.setData("text/plain", taskId)
    event.dataTransfer.effectAllowed = "move"
    event.currentTarget.classList.add("opacity-50")
  }

  dragEnd(event) {
    event.currentTarget.classList.remove("opacity-50")
  }

  dragOver(event) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }

  dragEnter(event) {
    event.preventDefault()
    const cell = event.currentTarget
    cell.classList.add("bg-primary/20", "ring-2", "ring-primary", "rounded-lg")
  }

  dragLeave(event) {
    const cell = event.currentTarget
    cell.classList.remove("bg-primary/20", "ring-2", "ring-primary", "rounded-lg")
  }

  drop(event) {
    event.preventDefault()
    const cell = event.currentTarget
    cell.classList.remove("bg-primary/20", "ring-2", "ring-primary", "rounded-lg")

    const taskId = event.dataTransfer.getData("text/plain")
    const targetDate = cell.dataset.date
    if (!taskId || !targetDate) return

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

    fetch(`/tasks/${taskId}/reschedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ date: targetDate })
    }).then(response => {
      if (response.ok) {
        this.selectedDateValue = targetDate
        this.navigateToDate()
      }
    })
  }

  // Parse "YYYY-MM-DD" as local date (not UTC)
  parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}
