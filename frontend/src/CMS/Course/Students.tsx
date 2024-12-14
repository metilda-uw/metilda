import React from "react" 
import { useState, useContext, useEffect, useMemo } from "react";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";

function Students() {
    const courseId = useParams()['id']
    const [studentListString, setStudentListString] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const studentList = useMemo(() => studentListString.split(';'), [studentListString])
    const user = (useContext(AuthUserContext) as any)
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri)
            if (!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await fetch('/cms/courses/student-list', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0] + ',' + obj[1]))
                .then(x => x.join(';'))
                .then(setStudentListString);
                setErrorMessage('');
            }
            catch (error) {
                setErrorMessage('Error loading students. Please try again later.');
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
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Enrolled Students:</div>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {studentList.map(x => 
                            <div className="list-item" key={x}><b>Student name:</b> {x.split(',')[1]} <b>Email:</b> {x.split(',')[0]}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Students as any) as any;