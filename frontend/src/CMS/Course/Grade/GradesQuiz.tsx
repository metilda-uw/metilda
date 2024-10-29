import React, { createRef } from "react" 
import { useState, useContext, useEffect} from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss"
import { verifyTeacherCourse } from "../../AuthUtils";
import Modal from 'react-modal'

function GradesQuiz() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const quizId = useParams()['quiz_id']
    const [title,setTitle] = useState('')
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [veri, setVeri] = useState(true)
    const [studentList, setStudentList] = useState([])
    const [average, setAverage] = useState(0.0)
    const [std, setStd] = useState(0.0)
    const [questionList,setQuestionList]=useState([])
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('quiz', quizId);
            try {
                setTimeout(async () => {
                    let response = await fetch('/cms/grades/quiz/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    })
                    response = await response.json()
                    setTitle(response['name'])
                    setMaxGrade(+response['max_grade'])
                    setStudentList(response['grades'].sort((a, b) => {
                        if (a.student > b.student)
                            return 1
                        else 
                            return -1
                    }))

                    let responseJSON=response['grades']
                    let graded=Object.keys(responseJSON).length
                    let sum = 0
                    for (let record of responseJSON) {
                        if (record.grade!==-1.0)
                            sum += record.grade
                        else
                            graded-=1
                    }
                    if(graded)
                        setAverage(sum / graded)
                    else
                        setAverage(0)

                    let avg = sum / graded
                    sum = 0.0
                    for (let record of responseJSON) {
                        if (record.grade!==-1.0)
                            sum += (record.grade - avg) ** 2
                    }
                    if(graded)
                        setStd((sum / graded) ** 0.5)
                    else
                        setStd(0)


                    setQuestionList(response['questions'])
                }, 1000)
            }
            catch (error) {
                setErrorMessage("Error loading data.")
            }
        }
        fetchData()
    }, [])

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view centered">
                    <div className="info-list">
                        <div className="title">{title}</div>
                        <div><b>Max grade:</b> {maxGrade}</div>

                        <div className="title">Students:</div>
                        {studentList?studentList.map(x => (
                            <div key={x.student} className="list-item">
                                <div key={x.student + '2'}>{x.student} &nbsp; <b>Grade:</b> {x.grade===-1?'-':x.grade}/{maxGrade}</div>
                            </div>
                        )) : null}
                        <div className="title">Statistics:</div>
                        <div><b>Average:</b> {average.toFixed(2)} &nbsp; <b>Standard deviation:</b> {std.toFixed(2)}</div>

                        {errorMessage && <div className="error-message">{errorMessage}</div>}

                        <div className="title">Speech Questions to Grade</div>
                        {questionList ? questionList.map((x, index) =>
                            x.type === 'speech' ? (
                                <div key={x.question} className="list-item">
                                    <Link className="content-link list-item-title" to={'/content-management/course/' + courseId + '/grades/quiz/' + quizId + '/question/' + x.question}>Question {index + 1}</Link>
                                </div>
                            ) : null
                        ) : null}
                        <Link className="content-link" to={`/content-management/course/${courseId}/grades`}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesQuiz as any) as any;