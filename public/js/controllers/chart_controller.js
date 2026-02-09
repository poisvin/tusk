import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    data: Array,
    type: { type: String, default: "line" }
  }

  connect() {
    this.loadChart()
  }

  async loadChart() {
    // Dynamically import Chart.js
    const { Chart, registerables } = await import('https://cdn.jsdelivr.net/npm/chart.js@4.4.1/+esm')
    Chart.register(...registerables)

    const ctx = this.element.getContext('2d')
    const data = this.dataValue

    const labels = data.map(d => d.label)
    const created = data.map(d => d.created)
    const completed = data.map(d => d.completed)

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tasks Created',
            data: created,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          },
          {
            label: 'Tasks Completed',
            data: completed,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: '#1e293b',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            padding: 12,
            displayColors: true
          }
        },
        scales: {
          x: {
            grid: {
              color: '#334155',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              maxTicksLimit: 10
            }
          },
          y: {
            grid: {
              color: '#334155',
              drawBorder: false
            },
            ticks: {
              color: '#64748b',
              stepSize: 1
            },
            beginAtZero: true
          }
        }
      }
    })
  }
}
