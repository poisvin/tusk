import { Controller } from "@hotwired/stimulus"

// Sets a cookie to indicate viewport type for server-side layout detection
export default class extends Controller {
  static BREAKPOINT = 1280 // Desktop breakpoint

  connect() {
    const currentViewport = this.getViewport()
    const cookieViewport = this.getCookie('viewport')

    // Set cookie and reload if viewport doesn't match (first visit or layout mismatch)
    if (currentViewport !== cookieViewport) {
      this.setViewportCookie()
      window.location.reload()
      return
    }

    window.addEventListener('resize', this.handleResize.bind(this))
  }

  disconnect() {
    window.removeEventListener('resize', this.handleResize.bind(this))
  }

  handleResize() {
    const currentViewport = this.getViewport()
    const cookieViewport = this.getCookie('viewport')

    if (currentViewport !== cookieViewport) {
      this.setViewportCookie()
      // Reload to get the correct layout
      window.location.reload()
    }
  }

  setViewportCookie() {
    const viewport = this.getViewport()
    document.cookie = `viewport=${viewport};path=/;max-age=31536000`
  }

  getViewport() {
    return window.innerWidth >= this.constructor.BREAKPOINT ? 'desktop' : 'mobile'
  }

  getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return null
  }
}
