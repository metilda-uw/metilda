import React from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import "../../CMS/Course/Discussion/Discussion.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function StudentDiscussion() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']

    const [topicListString, setTopicListString] = useState('')
    const [veri, setVeri] = useState(true)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/student-view/topics', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.created_at)).getTime()-(new Date(a.created_at)).getTime()}))
                .then(JSON.stringify)
                .then(setTopicListString)
                setError(null);
            }
            catch (error) {
                setError("Error loading discussions")
            }
            finally {
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
                        <div className="title">Topics:</div>
                        {loading ? (
                            <div className="spinner-container">
                                {spinnerIcon()}
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ): topicListString ? (
                            JSON.parse(topicListString).map((x: any) => (
                                <div key={x.topic} className="list-item">
                                    <div key={x.topic}>
                                        <Link
                                            className="content-link list-item-title"
                                            to={
                                                '/student-view/course/' +
                                                courseId +
                                                '/discussion/topic/' +
                                                x.topic
                                            }
                                        >
                                            {x.name}
                                        </Link>
                                    </div>
                                    <div key={x.description} className="description">
                                        {x.description}
                                    </div>
                                    <div key={x.created_at} className="created-at">
                                        <b>Created at:</b> {new Date(x.created_at).toLocaleString()}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div>No topics available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentDiscussion as any) as any;