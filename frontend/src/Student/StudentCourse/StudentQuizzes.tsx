import React from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";

function StudentQuizzes() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [quizList, setQuizList] = useState([])

    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/student-view/quiz', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.deadline)).getTime()-(new Date(a.deadline)).getTime()}))
                .then(setQuizList)
            }
            catch (e) {
                console.log(e)
            }
        }
        fetchData()
    },[])
    
    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Quiz:</div>
                        {quizList.length?quizList.map(x => (
                            <div key={x.quiz} className="list-item">
                                <div><Link className="content-link list-item-title" to={'/student-view/course/' + courseId + '/quiz/' + x.quiz}>{x.name}</Link></div>
                                <div><b>Start:</b> {new Date(x.start).toLocaleString()} &nbsp;&nbsp; <b>Deadline:</b> {new Date(x.deadline).toLocaleString()}</div>
                            </div>
                        )) : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentQuizzes as any) as any;