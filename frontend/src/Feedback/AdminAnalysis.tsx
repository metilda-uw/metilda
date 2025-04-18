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
  const [answerLabels, setAnswerLabels] = useState<string[]>([])

  const handleQuestionSelect = (event) => {
    // see MUI v4 docs for explanation of how the select event value 
    // gets passed and is handled here:
    // https://v4.mui.com/api/select/
    setSelectedQuestion(event.target.value as string)
  }

  // will use API to dynamically gather these in full implementation.
  // const answerLabels = [
  //   'Strongly disagree',
  //   'Somewhat disagree',
  //   'Neither agree nor disagree',
  //   'Somewhat agree',
  //   'Strongly agree',
  //   'Not applicable'
  // ]

  const fetchAnswerLabels = async () => {
    const options = await axios.get('/api/getOptions')
    console.log(options)
    //const processed = JSON.parse(options.data.result)
    // processed.map((processed) => {
    //   processed. as string; // get the name of the option
    // })
    if (options.data.result) {
      const resultArr = options.data.result
      let optStrings: string[] = []
      resultArr.forEach((arr) => {
        optStrings.push(arr[1]) // grab string from array
      })
      //console.log(processed)
      setAnswerLabels(optStrings)
    } else {
      NotificationManager.error('No comments found')
    }
  }

  // would be dynamically created depending on selectedQuestion in actual 
  // implementation
  let chartData = {
    labels: answerLabels,
    datasets: [{
      label: "Test data",
      data: [1, 2, 3, 4, 5, 6]
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

  const fetchFeedbackAnswers = async () => {
    // can't implement this yet,
    // focus on defining and establishing
    // frontend design/static elements first
    const answers = 'Not implemented yet!'
    // whether it will be getQuestions or getAllQuestions is a design 
    // choice that hasn't been made yet.
    //const questions = await axios.get('/api/getQuestions')
    console.log(answers)
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
    fetchAnswerLabels()
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
