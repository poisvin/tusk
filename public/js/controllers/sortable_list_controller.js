import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item"]
  static values = { url: String }

  connect() {
    this.draggedItem = null
  }

  // Called on each item via data-action="dragstart->sortable-list#dragStart"
  dragStart(event) {
    this.draggedItem = event.currentTarget
    event.dataTransfer.setData("text/plain", event.currentTarget.dataset.taskId)
    event.dataTransfer.effectAllowed = "move"
    requestAnimationFrame(() => {
      this.draggedItem.classList.add("opacity-50")
    })
  }

  dragEnd(event) {
    event.currentTarget.classList.remove("opacity-50")
    this.clearIndicators()
    this.draggedItem = null
  }

  dragOver(event) {
    if (!this.draggedItem) return
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"

    const target = event.currentTarget
    if (target === this.draggedItem) return

    this.clearIndicators()

    const rect = target.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2
    if (event.clientY < midpoint) {
      target.classList.add("border-t-2", "border-t-primary")
    } else {
      target.classList.add("border-b-2", "border-b-primary")
    }
  }

  dragEnter(event) {
    if (!this.draggedItem) return
    event.preventDefault()
  }

  dragLeave(event) {
    if (!this.draggedItem) return
    event.currentTarget.classList.remove("border-t-2", "border-t-primary", "border-b-2", "border-b-primary")
  }

  drop(event) {
    event.preventDefault()
    if (!this.draggedItem) return

    const target = event.currentTarget
    if (target === this.draggedItem) return

    const rect = target.getBoundingClientRect()
    const midpoint = rect.top + rect.height / 2

    if (event.clientY < midpoint) {
      target.parentNode.insertBefore(this.draggedItem, target)
    } else {
      target.parentNode.insertBefore(this.draggedItem, target.nextSibling)
    }

    this.clearIndicators()
    this.draggedItem.classList.remove("opacity-50")
    this.saveOrder()
    this.draggedItem = null
  }

  clearIndicators() {
    this.itemTargets.forEach(item => {
      item.classList.remove("border-t-2", "border-t-primary", "border-b-2", "border-b-primary")
    })
  }

  saveOrder() {
    const taskIds = this.itemTargets.map(item => item.dataset.taskId)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content

    fetch(this.urlValue, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken
      },
      body: JSON.stringify({ task_ids: taskIds })
    })
  }
}
