import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["status"]

  connect() {
    this.updateStatus()
  }

  get permission() {
    if (!("Notification" in window)) {
      return "unsupported"
    }
    return Notification.permission
  }

  updateStatus() {
    const permission = this.permission

    if (permission === "unsupported") {
      this.statusTarget.innerHTML = this.unsupportedHTML()
    } else if (permission === "granted") {
      this.statusTarget.innerHTML = this.enabledHTML()
    } else if (permission === "denied") {
      this.statusTarget.innerHTML = this.deniedHTML()
    } else {
      this.statusTarget.innerHTML = this.defaultHTML()
    }
  }

  async enable() {
    if (!("Notification" in window)) return

    const permission = await Notification.requestPermission()

    if (permission === "granted") {
      new Notification("Notifications Enabled", {
        body: "You will now receive task reminders"
      })
    }

    this.updateStatus()
  }

  unsupportedHTML() {
    return `
      <div class="bg-slate-800/50 rounded-lg p-4 text-slate-400">
        <span class="material-symbols-outlined mr-2 align-middle">warning</span>
        Notifications are not supported in this browser
      </div>
    `
  }

  enabledHTML() {
    return `
      <div class="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-green-500">notifications_active</span>
          <div>
            <p class="text-white font-medium">Notifications Enabled</p>
            <p class="text-slate-400 text-sm">You'll receive reminders for tasks</p>
          </div>
        </div>
        <span class="material-symbols-outlined text-green-500">check_circle</span>
      </div>
    `
  }

  deniedHTML() {
    return `
      <div class="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-red-500">notifications_off</span>
          <div>
            <p class="text-white font-medium">Notifications Blocked</p>
            <p class="text-slate-400 text-sm">Please enable notifications in your browser settings</p>
          </div>
        </div>
      </div>
    `
  }

  defaultHTML() {
    return `
      <button
        type="button"
        data-action="notifications#enable"
        class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
      >
        <span class="material-symbols-outlined">notifications</span>
        Enable Notifications
      </button>
    `
  }
}
