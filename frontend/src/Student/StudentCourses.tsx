import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../Components/header/Header";
import { withAuthorization } from "../Session";
import { AuthUserContext } from "../Session";

function StudentCourses() {
    const [courseListString, setCourseListString] = useState('')
    const courseList=useMemo(()=>courseListString.split(';'),[courseListString])
    const user = (useContext(AuthUserContext) as any)

    const [enrollCourse,setEnrollCOurse]=useState('')

    useEffect(() => {
        async function fetchData() {
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
    }, [user.email,courseList])

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

    return (
        <div>
            <Header></Header>
            <div>
                <div>Enroll a course:</div>
                <div><input onChange={(e) => setEnrollCOurse(e.target.value)}></input></div>
                <div><button onClick={onEnroll}>Enroll</button></div>
                <div className="course-list">
                    <div>My courses:</div>
                    {courseList.map(x => 
                        <div key={x}><Link key={x} to={'student-view/course/'+x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                    )}
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentCourses as any) as any;