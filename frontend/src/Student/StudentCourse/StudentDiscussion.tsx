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

function StudentDiscussion() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']

    const [topicListString, setTopicListString] = useState('')
    const [veri, setVeri] = useState(true)

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
                .then(x=>x.sort((a,b)=>{return (new Date(b.created_at)).getTime()-(new Date(a.created_at)).getTime()}))
                .then(JSON.stringify)
                .then(setTopicListString)
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
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
                <div className="main-view">
                    <div className="info-list">
                        <div>Topics:</div>
                        {topicListString?JSON.parse(topicListString).map(x => (
                            <div key={x.topic} className="topic">
                                <div key={x.topic}><Link to={'/student-view/course/' + courseId + '/discussion/topic/' + x.topic}>{x.name}</Link></div>
                                <div key={x.description} className="description">{x.description}</div>
                                <div key={x.created_at} className="created-at">Created at: {new Date(x.created_at).toLocaleString()}</div>
                            </div>
                        )):null}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentDiscussion as any) as any;