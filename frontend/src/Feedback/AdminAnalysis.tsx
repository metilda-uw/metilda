/**
 * This page is used by admins to analyze the feedback that has been submitted
  * by users.
  */

import React, { useEffect, useState } from 'react'
import { NotificationManager } from 'react-notifications' // notifications for API success/fail
import axios from 'axios' // for requests to flask API
import Select from '@material-ui/core/Select'
import { MenuItem } from '@material-ui/core'
import { Chart as ChartJS, Title, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'

const AdminAnalysis: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('')
  const [questionList, setQuestionList] = useState<dropdownQuestion[]>(null)

  const handleQuestionSelect = (event) => {
    // see MUI v4 docs for explanation of how the select event value 
    // gets passed and is handled here:
    // https://v4.mui.com/api/select/
    setSelectedQuestion(event.target.value as string)
  }

  const answerLabels = [
    'Strongly disagree',
    'Somewhat disagree',
    'Neither agree nor disagree',
    'Somewhat agree',
    'Strongly agree',
    'Not applicable'
  ]

  // would be dynamically created depending on selectedQuestion in actual 
  // implementation
  const chartData = {
    labels: answerLabels,
    datasets: [{
      label: "Test data",
      data: [1, 2, 3, 4, 5, 6]
    }]
  }

  // Might change it so that title dynamically shows selected question.
  const answerChartOptions = {
    title: {
      display: true,
      text: 'Question Responses.'
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    }
  }

  //const generateQuestionBarGraph = async () => {
  const generateQuestionBarGraph = () => {
    return <Bar options={answerChartOptions} data={chartData}></Bar>
  }

  const fetchFeedbackAnswers = async () => {
    // can't implement this yet,
    // focus on defining and establishing
    // frontend design/static elements first
  }

  interface dropdownQuestion {
    qName: string
    qid: number
  }

  // will get JSON using an API call which will then be converted 
  // to an array of dropdownQuestions in the full implementation,
  // temporarily just using this limited test data.
  const fetchFeedbackQuestions = async () => {
    const testQuestionList: { qName: string, qid: number }[] = [
      { qName: "q1", qid: 1 },
      { qName: "q2", qid: 2 },
      { qName: "q3", qid: 3 }
    ]
    const testJSON: string = JSON.stringify(testQuestionList)
    const qList: dropdownQuestion[] = JSON.parse(testJSON) as dropdownQuestion[]
    if (qList !== null) {
      console.log('qList:')
      console.log(qList)
    }
    setQuestionList(qList)
  }

  useEffect(() => {
    fetchFeedbackQuestions()
  }, [])

  if (questionList === null) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h1>Available Questions:</h1>
      <Select
        label='hi'
        id='question-selection'
        onChange={handleQuestionSelect}
      >
        {questionList.map((qList) => (
          <MenuItem value={qList.qid} key={qList.qid}>{qList.qName}</MenuItem>
        ))}
      </Select>
      {generateQuestionBarGraph()}
    </>
  )
}

export default AdminAnalysis;
