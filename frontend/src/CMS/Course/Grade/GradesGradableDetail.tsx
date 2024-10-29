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

function GradesGradableDetail() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const gradableId = useParams()['gradable_id']
    const studentId = useParams()['student_id']
    const [title, setTitle] = useState('')
    const [prevGrade, setPrevGrade] = useState(-1.0);
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [veri, setVeri] = useState(true)
    const [newGrade,setNewGrade] = useState(-1)
    const [errorMessage, setErrorMessage] = useState('')
    const history=useHistory()

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('gradable', gradableId);
            try {
                let response = await fetch('/cms/grades/gradable/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setMaxGrade(+response['max_grade'])

                formData.append('student',studentId)
                setTimeout(async () => {
                    response = await fetch('/cms/grades/gradable/student/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    })
                    response = await response.json()
                    setPrevGrade(response['grade'])
                }, 1000);
            }
            catch (error) {
                setErrorMessage("Error loading data.")
            }
        }
        fetchData()
    }, [])

    function onGrade(e) {
        e.preventDefault()
        if (newGrade>1000000 || newGrade<0)
            return
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('gradable', gradableId);
            formData.append('grade', newGrade.toString());
            try {
                await fetch('/cms/grades/gradable/student/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
            window.location.reload()
        }
        fetchData()
    }

    function onGradeAndNext(e) {
        e.preventDefault()
        if (newGrade>1000000 || newGrade<0)
            return
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('gradable', gradableId);
            formData.append('grade', newGrade.toString());
            try {
                await fetch('/cms/grades/gradable/student/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }

            formData = new FormData();
            formData.append('user', user.email);
            formData.append('student', studentId);
            formData.append('course',courseId)
            try {
                let response = await fetch('/cms/grades/gradable/student/next', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response=await response.json()
                if (response['student']) {
                    history.push(`/content-management/course/${courseId}/grades/gradable/${gradableId}/student/${response['student']}`)
                    window.location.reload()
                }
                else {
                    history.push(`/content-management/course/${courseId}/grades/gradable/${gradableId}`)
                }

            }
            catch (error) {
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
                        <div className="title">{title}</div>
                        <div><b>Student:</b> {studentId}</div>
                        <div><b>Grade:</b> {prevGrade === -1.0 ? '-' : prevGrade}/{maxGrade} </div>
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <form>
                            <div>
                                <input type="number" onChange={(e) => setNewGrade(+e.target.value)} style={{ 'width': 'auto', 'height': 'auto' }} required max={1000000} min={0} step={0.01}></input> &nbsp;
                                <button className='btn waves-light globalbtn' onClick={onGrade}>Save Grade</button> &nbsp;
                                <button className='btn waves-light globalbtn' onClick={onGradeAndNext}>Save Grade & Next</button>
                            </div>
                        </form>
                        <Link className="content-link" to={`/content-management/course/${courseId}/grades/gradable/${gradableId}`}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesGradableDetail as any) as any;