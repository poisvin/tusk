import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["checkbox", "selectAll", "actionBar", "count"]

  connect() {
    this.updateUI()
  }

  toggle(event) {
    event.stopPropagation()
    this.updateUI()
  }

  toggleAll() {
    const checked = this.selectAllTarget.checked
    this.checkboxTargets.forEach(cb => cb.checked = checked)
    this.showActions(checked ? this.checkboxTargets.length : 0)
  }

  updateUI() {
    const count = this.selectedIds().length
    const total = this.checkboxTargets.length

    this.showActions(count)

    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = count > 0 && count === total
      this.selectAllTarget.indeterminate = count > 0 && count < total
    }
  }

  showActions(count) {
    if (this.hasActionBarTarget) {
      this.actionBarTarget.style.display = count > 0 ? "flex" : "none"
    }
    if (this.hasCountTarget) {
      this.countTarget.textContent = `${count} selected`
    }
  }

  selectedIds() {
    return this.checkboxTargets
      .filter(cb => cb.checked)
      .map(cb => cb.value)
  }

  bulkComplete() {
    this.submitBulkAction("/tasks/bulk_complete")
  }

  bulkMoveNextDay() {
    this.submitBulkAction("/tasks/bulk_move_next_day")
  }

  submitBulkAction(url) {
    const ids = this.selectedIds()
    if (ids.length === 0) return

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
        "Accept": "text/html"
      },
      body: JSON.stringify({ task_ids: ids })
    }).then(response => {
      if (response.ok || response.redirected) {
        window.location.reload()
      }
    })
  }
}
