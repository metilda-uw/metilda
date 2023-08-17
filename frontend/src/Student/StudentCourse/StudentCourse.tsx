import React from "react"
import { useState, useContext, useEffect } from "react";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"

function StudentCourse() {
    const user = useContext(AuthUserContext) as any

    const courseId = useParams()['id']
    const [name, setName] = useState('')
    const [language, setLanguage] = useState('')
    const [credits, setCredits] = useState('')
    const [schedule, setSchedule] = useState('')

    useEffect(() => {
        async function fetchData() {
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/student-view/courses/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => {
                    setName(x.name)
                    setLanguage(x.language)
                    setCredits(x.credits)
                    setSchedule(x.schedule)
                })
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [user.email, courseId])


    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">
                    <div className="info-list">
                        <div>
                            Course number: {courseId}
                        </div>
                        <div>
                            Course name: {name}
                        </div>
                        <div>
                            Language: {language}
                        </div>
                        <div>
                            Credits: {credits}
                        </div>
                        <div>
                            Schedule: {schedule}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentCourse as any) as any;