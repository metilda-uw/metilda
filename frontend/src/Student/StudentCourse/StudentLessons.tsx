import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";

function StudentLessons() {
    const courseId=useParams()['id']
    const [lessonListString, setLessonListString] = useState('')
    const lessonList=useMemo(()=>lessonListString.split(';'),[lessonListString])
    const user = (useContext(AuthUserContext) as any)
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('course', courseId);
            try {
                await fetch('/student-view/lessons', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0]+','+obj[1]+','+obj[2]+','+obj[3]))
                .then(x => x.join(';'))
                .then(setLessonListString);
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
            <div><Header></Header></div>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className='title'>Lessons:</div>
                        {lessonListString ?
                            <div className="lessons">
                                {
                                    lessonList.map((lesson) => {
                                        if (lesson.split(',')[3] === 'true') {
                                            return (
                                                <div className="list-item" key={lesson.split(',')[0]}>
                                                    <Link to={'/student-view/course/' + courseId + '/lessons/' + lesson.split(',')[0]} className="content-link list-item-title">{lesson.split(',')[1]}</Link>
                                                </div>
                                            );
                                        }
                                        else{
                                            return null
                                        }
                                    })
                                }
                            </div>
                        :null}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentLessons as any) as any;