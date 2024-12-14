import React, { createRef } from "react"
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss"
import { verifyTeacherCourse } from "../../AuthUtils";
import { getFileSrcDict } from "../Utils";
import { FirebaseContext } from "../../../Firebase";

function GradesQuizQuestionSubmission() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const quizId = useParams()['quiz_id']
    const questionId = useParams()['question_id']
    const studentId = useParams()['student_id']
    const [veri, setVeri] = useState(true)
    const [fileSrc, setFileSrc] = useState('')
    const [newGrade, setNewGrade] = useState(-1.0)
    const [prevGrade, setPrevGrade] = useState(-1.0);
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [errorMessage, setErrorMessage] = useState('')
    const history = useHistory()
    const firebase = useContext(FirebaseContext)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri)
            if (!veri)
                return

            try {
                setTimeout(async () => {
                    let formData = new FormData()
                    formData.append('user', user.email)
                    formData.append('question', questionId)
                    formData.append('student', studentId)
                    let response = await fetch('/cms/grades/quiz/question/answer/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    })
                    response = await response.json()
                    setPrevGrade(response['grade'])
                    setMaxGrade(response['max_grade'])

                    let temp = {}
                    await getFileSrcDict(firebase, temp, 'file', `/student-view/quiz/question/answer/file/read/${courseId}/quiz-question-answer/${questionId}/${studentId}`)
                    setFileSrc(temp['file'])
                }, 1000)
            } catch (error) {
                setErrorMessage("Error loading data.")
            }
        }
        fetchData()
    }, [])

    function onGrade(e) {
        e.preventDefault()
        if (newGrade > 1000000 || newGrade < 0)
            return
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('quiz', quizId);
            formData.append('question', questionId);
            formData.append('grade', newGrade.toString());
            try {
                await fetch('/cms/grades/quiz/question/answer/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            } catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
            window.location.reload()
        }
        fetchData()
    }

    function onGradeAndNext(e) {
        e.preventDefault()
        if (newGrade > 1000000 || newGrade < 0)
            return
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('quiz', quizId);
            formData.append('question', questionId);
            formData.append('grade', newGrade.toString());
            try {
                await fetch('/cms/grades/quiz/question/answer/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            } catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }

            formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('quiz', quizId);
            formData.append('question', questionId);
            try {
                let response = await fetch('/cms/grades/quiz/question/answer/next', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                if (response['student']) {
                    history.push(`/content-management/course/${courseId}/grades/quiz/${quizId}/question/${questionId}/student/${response['student']}`)
                    window.location.reload()
                } else {
                    history.push(`/content-management/course/${courseId}/grades/quiz/${quizId}/question/${questionId}`)
                }
            } catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }

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
                        <div className='title'>Student: {studentId}</div>
                        <div><b>Student answer:</b></div>
                        {fileSrc ?
                            <div>
                                <audio src={fileSrc} controls></audio>
                            </div>
                            : null}
                        <div><b>Grade:</b> {prevGrade === -1.0 ? '-' : prevGrade}/{maxGrade} </div>
                        <form>
                            <div>
                                <input type="number" onChange={(e) => setNewGrade(+e.target.value)} style={{ 'width': 'auto', 'height': 'auto' }} required max={1000000} min={0} step={0.01}></input> &nbsp;
                                <button className='btn waves-light globalbtn' onClick={onGrade}>Save Grade</button> &nbsp;
                                <button className='btn waves-light globalbtn' onClick={onGradeAndNext}>Save Grade & Next</button>
                            </div>
                        </form>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <Link className="content-link" to={`/content-management/course/${courseId}/grades/quiz/${quizId}/question/${questionId}`}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesQuizQuestionSubmission as any) as any;