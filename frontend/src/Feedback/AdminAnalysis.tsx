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
import { avgChartOptions, answerChartOptions } from './AdminAnalysisCharts'

export interface dropdownQuestion {
  qName: string
  qid: number
}

export interface answerAverage {
  qAvg: number
  qid: number
}

export interface answerTotal {
  qAnswerTotal: number
  qid: number
}

const AdminAnalysis: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<number>(null)
  const [questionList, setQuestionList] = useState<dropdownQuestion[]>(null)
  const [answerLabels, setAnswerLabels] = useState<string[]>(null)
  const [answerData, setAnswerData] = useState<number[]>([])
  const [answerTotals, setAnswerTotals] = useState<answerTotal[]>([])
  const [answerAverages, setAnswerAverages] = useState<answerAverage[]>([])
  const [distribution, setDistribution] = useState(null)

  const rating: Map<number, number> = new Map([[100, 1], [101, 2], [102, 3], [103, 4], [104, 5]])

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
    try {
      const questions = await axios.get('/api/getQuestionAnswerCounts')
      if (questions.data.result) {
        const resultArr = questions.data.result
        let ddQuestions: dropdownQuestion[] = []
        let counts: answerTotal[] = []
        resultArr.forEach((arr) => {
          ddQuestions.push({ qName: arr[1], qid: arr[0] }) // grab string from array
          counts.push({ qAnswerTotal: arr[2], qid: arr[0] }) // grab total answer count per question
        })
        setQuestionList(ddQuestions)
        setAnswerTotals(counts)
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
      const counts = await axios.get(`/api/getAnswerCounts`)
      if (counts.data.result) {
        setDistribution(counts.data.result)
        NotificationManager.success('Answer counts fetched successfully.');
      }
    } catch (error) {
      NotificationManager.error("Failed to fetch answer counts")
    }
  }

  const calculateAverages = () => {
    let prevAvgCalced = 0
    let vals = distribution.map(c => {
      // c is an individual array from distribution made up of qid,
      // oid, and count
      if (c[0] != prevAvgCalced) { // if qid is not prev calced
        let matching = distribution.filter(arr => arr[0] === c[0])
        let total = 0
        let count = 0
        // hard coded disregard of n/a answer
        matching.forEach(arr => {
          if (arr[1] !== 105) {
            total += (rating.get(arr[1]) * arr[2])
            count += arr[2]
          }
        })
        prevAvgCalced = c[0]
        if (count === 0) { return 0 }
        return { qAvg: (total / count).toFixed(2), qid: c[0] }
      } else {
        return { qAvg: 100000000, qid: c[0] }
      }
    })
    setAnswerAverages(vals.filter(val => { return val.qAvg !== 100000000 }))
  }

  let answerChartData = {
    labels: answerLabels,
    datasets: [{
      label: "Data for selected question",
      data: answerData,
      backgroundColor: 'rgba(242, 94, 104, 0.8)'
    }]
  }

  let avgChartData = {
    labels: questionList ? questionList.map(question => question.qName) : [],
    datasets: [
      {
        xAxisID: 'avg-axis',
        label: "Average response for Question",
        backgroundColor: 'rgba(42,183,169,0.8)',
        data: answerAverages.map(answer => answer.qAvg)
      },
      {
        xAxisID: 'total-axis',
        label: "Total Answer Count for Question",
        data: answerTotals.map(answer => answer.qAnswerTotal),
        backgroundColor: 'rgba(242, 94, 104, 0.8)'
      }
    ]
  }

  function QuestionBarGraph() {
    return (
      <Bar options={answerChartOptions} data={answerChartData}></Bar>
    )
  }

  function AvgResponseGraph() {
    // set selected question to bar that is clicked on
    const onClick = (element) => {
      if (element.length > 0) {
        let index = element[0]._index;
        setSelectedQuestion(questionList[index].qid)
      }
    }
    return (
      <div style={{ width: '50%' }}>
        <HorizontalBar options={avgChartOptions} data={avgChartData} onElementsClick={onClick}></HorizontalBar>
      </div>
    )
  }

  function QuestionStats() {
    if (selectedQuestion !== null) {
      const aresult = answerAverages.find((answ) => answ.qid === selectedQuestion)
      return (
        <Box sx={{
          justifyContent: 'center',
          display: 'flex',
        }}>
          <Box sx={{ paddingRight: '5vw' }}>
            <h2>Total responses: {answerTotals.find((answ) => answ.qid === selectedQuestion).qAnswerTotal}</h2>
          </Box>
          {aresult !== undefined ? (
            <h2>Average response: {aresult.qAvg}</h2>
          ) : (
            <h2>Average response: {"N/A"}</h2>
          )}
        </Box>
      )
    } else { return null }
  }

  const handleQuestionSelect = (event) => {
    // see MUI v4 docs for explanation of how the select event value 
    // gets passed and is handled here:
    // https://v4.mui.com/api/select/
    setSelectedQuestion(event.target.value as number)
  }

  // useEffect for initial page setup
  useEffect(() => {
    fetchQuestions()
    fetchAnswerLabels()
    fetchAnswerCounts()
  }, [])

  // useEffect for grabbing answer counts 
  // after a question is selected
  useEffect(() => {
    if (selectedQuestion !== null) {
      let selectedDist = distribution.filter(arr => arr[0] === selectedQuestion)
      setAnswerData(selectedDist.map(arr => arr[2])) // create array only of the relevant counts
    }
  }, [selectedQuestion])

  // caclulate all the averages once distributions are saved
  useEffect(() => {
    if (distribution !== null) {
      calculateAverages()
    }
  }, [distribution])

  if (questionList === null ||
    answerLabels === null ||
    answerData === null) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h2>Feedback Statistics</h2>
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
      {(window.innerWidth < window.innerHeight && answerTotals.length > 0) ? (
        <>
          <QuestionStats />
          <Box sx={{
            justifyContent: 'center',
            display: 'flex'
          }}>
            {QuestionBarGraph()}
          </Box>
        </>
      ) : (
        <div style={{ display: 'flex' }}>
          {AvgResponseGraph()}
          <div style={{ width: '50%' }}>
            {QuestionBarGraph()}
          </div>
        </div>
      )}
    </>
  )
}

export default AdminAnalysis;
