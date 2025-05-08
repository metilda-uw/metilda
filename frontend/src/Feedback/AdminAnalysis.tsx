/**
 * This page is used by admins to analyze the feedback that has been submitted
  * by users.
  */

import React, { useEffect, useState, useRef } from 'react'
import { NotificationManager } from 'react-notifications' // notifications for API success/fail
import axios from 'axios' // for requests to flask API
import Select from '@material-ui/core/Select'
import { MenuItem, FormControl, InputLabel, Box } from '@material-ui/core'
import { Bar, HorizontalBar } from 'react-chartjs-2'

export interface dropdownQuestion {
  qName: string
  qid: number
}

const AdminAnalysis: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(null)
  const [questionList, setQuestionList] = useState<dropdownQuestion[]>(null)
  const [answerLabels, setAnswerLabels] = useState<string[]>(null)
  const [answerData, setAnswerData] = useState<number[]>([])

  const handleQuestionSelect = (event) => {
    // see MUI v4 docs for explanation of how the select event value 
    // gets passed and is handled here:
    // https://v4.mui.com/api/select/
    setSelectedQuestion(event.target.value as number)
  }

  // dynamically create answer labels for distribution chart
  const fetchAnswerLabels = async () => {
    try {
      const options = await axios.get('/api/getOptions')
      if (options.data.result) {
        const resultArr = options.data.result
        let optStrings: string[] = []
        resultArr.forEach((arr) => {
          optStrings.push(arr[1].charAt(0).toUpperCase() + arr[1].slice(1)) // grab string from array + capitalize
        })
        setAnswerLabels(optStrings)
        NotificationManager.success('Answer Labels fetched successfully.');
      } else {
        NotificationManager.error('No labels found')
      }
    } catch (error) {
      NotificationManager.error('Failed to fetch label list')
    }
  }

  // gets all questions and stores them as dropdown questions
  const fetchQuestions = async () => {
    // whether it will be getQuestions or getAllQuestions is a design 
    // choice that hasn't been made yet.
    try {
      const questions = await axios.get('/api/getQuestions')
      if (questions.data.result) {
        const resultArr = questions.data.result
        let ddQuestions: dropdownQuestion[] = []
        resultArr.forEach((arr) => {
          ddQuestions.push({ qName: arr[1], qid: arr[0] }) // grab string from array
        })
        setQuestionList(ddQuestions)
        NotificationManager.success('Question list fetched successfully.');
      } else {
        NotificationManager.error('No questions found')
      }
    } catch (error) {
      NotificationManager.error("Failed to fetch question list")
    }
  }

  // Fetch the number of answers for each option
  const fetchAnswerCounts = async () => {
    try {
      const counts = await axios.get(`/api/getAnswerCounts/${selectedQuestion}`)
      if (counts.data.result) {
        const resultArr = counts.data.result
        let countArr: number[] = []
        resultArr.forEach((arr) => {
          countArr.push(arr[1])
        })
        setAnswerData(countArr)
        NotificationManager.success('Answer counts fetched successfully.');
      }
    } catch (error) {
      NotificationManager.error("Failed to fetch answer counts")
    }
  }

  // would be dynamically created depending on selectedQuestion in actual 
  // implementation
  let answerChartData = {
    labels: answerLabels,
    datasets: [{
      label: "Data for selected question",
      data: answerData,
      backgroundColor: 'rgba(242, 94, 104, 0.8)'
    }]
  }

  // Might change it so that title dynamically shows selected question.
  const answerChartOptions = {
    legend: {
      display: false
    },
    layout: {
      padding: {
        left: 250,
        right: 250,
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

  let avgChartData = {
    // ternary operator to prevent operation on null questionList when 
    // waiting for fetch
    labels: questionList ? questionList.map(question => question.qName) : [],
    datasets: [{
      label: "test data",
      data: [1, 2, 3, 4],
      backgroundColor: 'rgba(242, 94, 104, 0.8)'
    }]
  }

  const avgChartOptions = {
    layout: {
      padding: {
        left: 250,
        right: 250,
      }
    },
    scales: {
      xAxes: [{
        ticks: {
          beginAtZero: true
        }
      }],
      yAxes: [{
        barPercentage: 0.9,
      }]
    },
    maintainAspectRatio: false,
  }

  function QuestionBarGraph({ answerChartOptions, answerChartData }) {
    return <Bar options={answerChartOptions} data={answerChartData}></Bar>
  }

  function AvgResponseGraph({ setSelectedQuestion, avgChartOptions, avgChartData }) {
    // set selected question to bar that is clicked on
    const onClick = (element) => {
      if (element.length > 0) {
        let index = element[0]._index;
        setSelectedQuestion(questionList[index].qid)
      }
    }
    return (
      <div style={{ height: '700px' }}>
        <HorizontalBar options={avgChartOptions} data={avgChartData} onElementsClick={onClick}></HorizontalBar>
      </div>
    )
  }

  // useEffect for initial page setup
  useEffect(() => {
    fetchQuestions()
    fetchAnswerLabels()
  }, [])

  // useEffect for grabbing answer counts 
  // after a question is selected
  useEffect(() => {
    if (selectedQuestion !== null) {
      fetchAnswerCounts()
    }
  }, [selectedQuestion])

  if (questionList === null ||
    answerLabels === null ||
    answerData === null) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h2>Feedback Statistics</h2>
      <AvgResponseGraph setSelectedQuestion={setSelectedQuestion} avgChartData={avgChartData} avgChartOptions={avgChartOptions}></AvgResponseGraph>
      <Box sx={{
        justifyContent: 'center',
        display: 'flex'
      }}>
        <Box sx={{ width: 500 }}>
          <FormControl fullWidth>
            <InputLabel id="question-select-label">Please select a feedback question:</InputLabel>
            <Select
              label='hi'
              id='question-selection'
              onChange={handleQuestionSelect}
              value={selectedQuestion ? selectedQuestion : ''} // show selected question if not null
            >
              {questionList.map((qList) => (
                <MenuItem value={qList.qid} key={qList.qid}>{qList.qName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      <QuestionBarGraph answerChartData={answerChartData} answerChartOptions={answerChartOptions}></QuestionBarGraph>
    </>
  )
}

export default AdminAnalysis;
