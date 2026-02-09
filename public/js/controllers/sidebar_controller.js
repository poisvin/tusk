import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["logoText", "logoContainer", "navItem", "navLabel", "toggleButton", "toggleIcon"]

  connect() {
    this.collapsed = localStorage.getItem('sidebar-collapsed') === 'true'
    this.render()
  }

  toggle() {
    this.collapsed = !this.collapsed
    localStorage.setItem('sidebar-collapsed', this.collapsed)
    this.render()
  }

  render() {
    if (this.collapsed) {
      this.element.classList.remove('w-52')
      this.element.classList.add('w-16')

      // Hide text elements
      if (this.hasLogoTextTarget) {
        this.logoTextTarget.classList.add('hidden')
      }
      if (this.hasLogoContainerTarget) {
        this.logoContainerTarget.classList.remove('gap-3')
        this.logoContainerTarget.classList.add('justify-center')
      }

      this.navItemTargets.forEach(item => {
        item.classList.add('justify-center')
      })

      this.navLabelTargets.forEach(label => {
        label.classList.add('hidden')
      })

      if (this.hasToggleIconTarget) {
        this.toggleIconTarget.textContent = 'chevron_right'
      }

      if (this.hasToggleButtonTarget) {
        this.toggleButtonTarget.classList.add('justify-center')
      }
    } else {
      this.element.classList.remove('w-16')
      this.element.classList.add('w-52')

      // Show text elements
      if (this.hasLogoTextTarget) {
        this.logoTextTarget.classList.remove('hidden')
      }
      if (this.hasLogoContainerTarget) {
        this.logoContainerTarget.classList.add('gap-3')
        this.logoContainerTarget.classList.remove('justify-center')
      }

      this.navItemTargets.forEach(item => {
        item.classList.remove('justify-center')
      })

      this.navLabelTargets.forEach(label => {
        label.classList.remove('hidden')
      })

      if (this.hasToggleIconTarget) {
        this.toggleIconTarget.textContent = 'chevron_left'
      }

      if (this.hasToggleButtonTarget) {
        this.toggleButtonTarget.classList.remove('justify-center')
      }
    }
  }
}
