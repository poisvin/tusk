import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["field"]
  static values = { field: String }

  select(event) {
    const value = event.currentTarget.dataset.value
    this.fieldTarget.value = value

    // Update button styles
    this.element.querySelectorAll('button').forEach(btn => {
      const isSelected = btn.dataset.value === value

      // Reset classes
      btn.classList.remove('bg-primary/20', 'border-primary', 'text-primary', 'bg-slate-800', 'border-slate-600')
      btn.classList.add('bg-slate-800/50', 'border-slate-700', 'text-slate-400')

      if (isSelected) {
        btn.classList.remove('bg-slate-800/50', 'border-slate-700', 'text-slate-400')
        btn.classList.add('bg-primary/20', 'border-primary', 'text-primary')
      }
    })
  }
}
