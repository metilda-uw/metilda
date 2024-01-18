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

function GradesQuizQuestion() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const quizId = useParams()['quiz_id']
    const questionId = useParams()['question_id']
    const [veri, setVeri] = useState(true)
    const [submissionList, setSubmissionList] = useState([])
    // const [average, setAverage] = useState(0.0)
    // const [std, setStd] = useState(0.0)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('question', questionId);
            try {
                let response = await fetch('/cms/grades/quiz/question/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let responseJSON = await response.json()
                responseJSON['submissions'].sort((a,b)=>{return (new Date(b.time)).getTime()-(new Date(a.time)).getTime()})
                setSubmissionList(responseJSON['submissions'])

                // let responseJSON=response['grades']
                // let graded=Object.keys(responseJSON).length
                // let sum = 0
                // for (let record of responseJSON) {
                //     if (record.grade!==-1.0)
                //         sum += record.grade
                //     else
                //         graded-=1
                // }
                // if(graded)
                //     setAverage(sum / graded)
                // else
                //     setAverage(0)
                
                // let avg = sum / graded
                // sum = 0.0
                // for (let record of responseJSON) {
                //     if (record.grade!==-1.0)
                //         sum += (record.grade - avg) ** 2
                // }
                // if(graded)
                //     setStd((sum / graded) ** 0.5)
                // else
                //     setStd(0)
            }
            catch (error) {
                console.log(error)
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
                        <div className="title">Submissions:</div>
                        {submissionList?submissionList.map(x => (
                            <div key={x.student} className="list-item">
                                <Link className="content-link list-item-title" to={`/content-management/course/${courseId}/grades/quiz/${quizId}/question/${questionId}/student/${x.student}`}>{x.student}</Link>
                                &nbsp; <b>Grade:</b> {x.grade===-1?'-':x.grade}/{x.max_grade}
                            </div>
                        )) : null}
                        <Link className="content-link" to={`/content-management/course/${courseId}/grades/quiz/${quizId}`}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesQuizQuestion as any) as any;