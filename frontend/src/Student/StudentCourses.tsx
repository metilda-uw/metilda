import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/header/Header";
import { withAuthorization } from "../Session";
import { AuthUserContext } from "../Session";
import { verifyStudent } from "../CMS/AuthUtils";

function StudentCourses() {
    const [courseListString, setCourseListString] = useState('')
    const courseList=useMemo(()=>courseListString.split(';'),[courseListString])
    const user = (useContext(AuthUserContext) as any)

    const [enrollCourse, setEnrollCOurse] = useState('')
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudent(user.email,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            try {
                await fetch('/student-view/courses', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0]+','+obj[1]))
                .then(x => x.join(';'))
                .then(setCourseListString);
            }
            catch (e) {}
        }
        fetchData()
    },[])

    async function onEnroll() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('course', enrollCourse);
        await fetch('/student-view/courses/enroll', {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        })

        window.location.reload()
    }

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div>
                <div><b>Enroll a course by course ID:</b> <input style={{ 'width': 'auto', 'height':'auto'}} onChange={(e) => setEnrollCOurse(e.target.value)}></input></div>
                <div><button className='btn waves-light globalbtn' onClick={onEnroll}>Enroll</button></div>
                <div className="course-list">
                    <div className="title">My Courses:</div>
                    {courseList.map(x => 
                        <div className="list-item" key={x}><Link className="content-link" to={'student-view/course/'+x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                    )}
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentCourses as any) as any;