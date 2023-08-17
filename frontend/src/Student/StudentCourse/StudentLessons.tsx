import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"

function StudentLessons() {
    const courseId=useParams()['id']
    const [lessonListString, setLessonListString] = useState('')
    const lessonList=useMemo(()=>lessonListString.split(';'),[lessonListString])
    const user = (useContext(AuthUserContext) as any)

    useEffect(() => {
        async function fetchData() {
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
                .then(x => x.map(obj => obj[0]+','+obj[1]))
                .then(x => x.join(';'))
                .then(setLessonListString);
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [lessonList])

    return (
        <div>
            <div><Header></Header></div>
            <div className="main-layout">
                <Sidebar></Sidebar>
                <div className="main-view">
                    <div>My lessons:</div>
                    {lessonList.map(x => 
                        <div key={x}><Link key={x} to={'/student-view/course/'+courseId+'/lesson/'+x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                    )}
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentLessons as any) as any;