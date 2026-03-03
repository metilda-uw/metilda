export const answerChartOptions = {
  responsive: true,
  legend: {
    display: false
  },
  layout: {
    padding: {
      top: 25
    },
  },
  scales: {
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: "Number of responses",
        fontSize: 20
      },
      ticks: {
        beginAtZero: true
      }
    }],
    xAxes: [{
      scaleLabel: {
        display: true,
        labelString: "Option chosen by user",
        fontSize: 20
      },
      ticks: {
        fontSize: 15
      }
    }]
  }
}

export const avgChartOptions = {
  responsive: true,
  legend: {
    display: false
  },
  layout: {
    padding: {
      right: 25,
      top: 25
    }
  },
  scales: {
    xAxes: [
      {
        id: 'total-axis',
        scaleLabel: {
          display: true,
          labelString: "Total number of responses",
          fontSize: 20
        },
        ticks: {
          beginAtZero: true,
        }
      },
      {
        id: 'avg-axis',
        position: 'top',
        type: 'linear',
        scaleLabel: {
          display: true,
          labelString: "Average rating out of 5",
          fontSize: 20
        },
        ticks: {
          beginAtZero: true,
        }
      }
    ],
    yAxes: [{
      barPercentage: 0.9,
    }]
  },
}
