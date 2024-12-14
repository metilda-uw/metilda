import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function StudentAssignments() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [assignmentListString, setAssignmentListString] = useState('')
    const [veri, setVeri] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email, courseId, setVeri)
            if (!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/student-view/assignments', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                    .then(x => x.json())
                    .then(x => x.sort((b, a) => { return (new Date(b.deadline)).getTime() - (new Date(a.deadline)).getTime() }))
                    .then(JSON.stringify)
                    .then(setAssignmentListString)
                    setError(null);
            }
            catch (error) {
                setError("Failed loading assignments");
             } finally {
                setLoading(false);
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
                        <div className="title">Assignments:</div>
                        {loading ? (
                            <div className="spinner-container">
                                {spinnerIcon()}
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            JSON.parse(assignmentListString).map((x: any) => (
                                <div key={x.assignment + '1'} className="list-item">
                                    <div key={x.assignment + '2'}>
                                        <Link
                                            className="content-link list-item-title"
                                            key={x.assignment + '3'}
                                            to={'/student-view/course/' + courseId + '/assignment/' + x.assignment}
                                        >
                                            {x.name}
                                        </Link>
                                    </div>
                                    <div key={x.assignment + '4'} className="deadline">
                                        <b>Deadline:</b> {new Date(x.deadline).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentAssignments as any) as any;