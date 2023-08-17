import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"

function Students() {
    const courseId=useParams()['id']
    const [studentListString, setStudentListString] = useState('')
    const studentList=useMemo(()=>studentListString.split(';'),[studentListString])
    const user = (useContext(AuthUserContext) as any)

    useEffect(() => {
        async function fetchData() {
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/cms/courses/student-list', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0]+','+obj[1]))
                .then(x => x.join(';'))
                .then(setStudentListString);
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
                        <div><b>Enrolled Students:</b></div>
                        {studentList.map(x => 
                            <div key={x}><b>Student name:</b> {x.split(',')[1]} <b>Email:</b> {x.split(',')[0]}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Students as any) as any;