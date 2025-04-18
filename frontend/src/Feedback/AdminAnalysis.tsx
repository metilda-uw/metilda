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
  const [selectedQuestion, setSelectedQuestion] = useState<number>()
  const [questionList, setQuestionList] = useState<dropdownQuestion[]>(null)
  const [answerLabels, setAnswerLabels] = useState<string[]>(null)
  const [answerData, setAnswerData] = useState<number[]>([])

  const handleQuestionSelect = (event) => {
    // see MUI v4 docs for explanation of how the select event value 
    // gets passed and is handled here:
    // https://v4.mui.com/api/select/
    setSelectedQuestion(event.target.value as number)
  }

  // dynamically create answer labels
  const fetchAnswerLabels = async () => {
    const options = await axios.get('/api/getOptions')
    console.log(options)
    if (options.data.result) {
      const resultArr = options.data.result
      let optStrings: string[] = []
      resultArr.forEach((arr) => {
        optStrings.push(arr[1]) // grab string from array
      })
      setAnswerLabels(optStrings)
    } else {
      NotificationManager.error('No comments found')
    }
  }

  // gets all questions and stores them as dropdown questions.
  const fetchQuestions = async () => {
    // whether it will be getQuestions or getAllQuestions is a design 
    // choice that hasn't been made yet.
    const questions = await axios.get('/api/getQuestions')
    console.log(questions)
    if (questions.data.result) {
      const resultArr = questions.data.result
      let ddQuestions: dropdownQuestion[] = []
      resultArr.forEach((arr) => {
        ddQuestions.push({ qName: arr[1], qid: arr[0] }) // grab string from array
      })
      setQuestionList(ddQuestions)
    } else {
      NotificationManager.error('No questions found')
    }
  }

  const fetchAnswerCounts = async () => {
    // need to implement API endpoint
  }

  // would be dynamically created depending on selectedQuestion in actual 
  // implementation
  let chartData = {
    labels: answerLabels,
    datasets: [{
      label: "Data for selected question",
      data: [1, 2, 3, 4, 5, 6]
      // data: answerData
    }]
  }

  // Might change it so that title dynamically shows selected question.
  let answerChartOptions = {
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

  interface dropdownQuestion {
    qName: string
    qid: number
  }

  useEffect(() => {
    fetchQuestions()
    fetchAnswerLabels()
  }, [])

  if (questionList === null ||
    answerLabels === null ||
    answerData === null) {
    console.log("something is null! loading...")
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
