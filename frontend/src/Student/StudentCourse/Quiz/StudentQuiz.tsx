import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../StudentSidebar";
import { useParams } from "react-router-dom";
import "../../../CMS/Course/GeneralStyles.scss"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { verifyStudentCourse } from "../../../CMS/AuthUtils";

function StudentQuiz() {
    const courseId=useParams()['id']
    const [questionList, setQuestionList] = useState([])
    const user = (useContext(AuthUserContext) as any)
    const quizId = useParams()['quiz_id']

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [start, setStart] = useState('')
    const [deadline, setDeadline] = useState('')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight, setWeight] = useState(0.0)

    const [veri, setVeri] = useState(true)
    const [inTime,setInTime]=useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            formData.append('quiz', quizId);
            try {
                let response=await fetch('/student-view/quiz/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                if (Object.keys(response).length) {
                    setName(response['name'])
                    setDescription(response['description'])
                    setStart(response['start'])
                    setDeadline(response['deadline'])
                    setMaxGrade(response['max_grade'])
                    setWeight(response['weight'])
    
                    response=await fetch('/student-view/quiz/questions', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    })
                    let responseJSON = await response.json()
                    setQuestionList(responseJSON)
                }
                else {
                    setInTime(false)
                }
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchData()
    },[])

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    if (!inTime) {
        return <div>Quiz time error, please access the quiz at correct time.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Quiz Information</div>
                        <div><b>Quiz Name:</b> {name}</div>
                        <div><b>Description:</b> {description}</div>
                        <div><b>Quiz Start Time:</b> {start?new Date(start).toLocaleString():'Loading...'}</div>
                        <div><b>Quiz End time:</b> {deadline?new Date(deadline).toLocaleString():'Loading...'}</div>
                        <div><b>Max Grade:</b> {maxGrade}</div>
                        <div><b>Weight:</b> {weight*100}%</div>
                        <div className="title">Question List:</div>
                        {questionList.length ?
                            <div>
                                {questionList.map((question, index) => {
                                return (
                                    <div key={question.id} className="list-item" >
                                        <Link key={question.id} to={'/student-view/course/'+courseId+'/quiz/'+quizId+'/question/'+question.id+'/'+index} className="content-link list-item-title">Question { index+1 }</Link>
                                    </div>
                                );
                                })}
                            </div>
                        : null}
                        <Link className="content-link" to={'/student-view/course/'+courseId+'/quiz'}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentQuiz as any) as any;