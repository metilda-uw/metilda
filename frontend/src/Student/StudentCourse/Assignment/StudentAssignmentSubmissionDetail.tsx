import React, { createRef } from "react"
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../StudentSidebar";
import { Editor } from 'react-draft-wysiwyg'
import { useParams } from "react-router-dom";
import draftToHtml from 'draftjs-to-html';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../../../CMS/Course/GeneralStyles.scss"
import { getFile, onDownloadFiles } from "../../../CMS/Course/Utils";
import { FirebaseContext } from "../../../Firebase";
import { uploadFileWrapper } from "../../../CMS/Course/Utils";
import ReactFileReader from "react-file-reader";
import { verifyStudentCourse } from "../../../CMS/AuthUtils";


export function AssignmentSubmissionDetail() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('{}')
    const [deadline, setDeadline] = useState('')
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [prevFiles, setPrevFiles] = useState([]);
    const [prevTime, setPrevTime] = useState('');
    const [prevGrade, setPrevGrade] = useState(-1.0);
    const firebase = useContext(FirebaseContext)
    const downloadRef = createRef<HTMLAnchorElement>();
    const history = useHistory()
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            try {
                // Assignment info
                let response = await fetch('/student-view/assignments/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setDeadline(response['deadline'])
                setMaxGrade(+response['max_grade'])
                
                // Old submission info
                response = await fetch('/student-view/assignment/submission/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                if (response) {
                    setPrevTime(response['time'])
                    if (response['content'] !== 'undefined')
                    setContent(response['content'])
                    setPrevGrade(response['grade'])
                    getFile(firebase, setPrevFiles, `/student-view/assignment/submission/file/read/${user.email}/${assignmentId}`)
                }
                
            }
            catch {}
        }
        if (user) {
            fetchData()
        }
    },[])

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="main-view centered">
                    <div className="info-list">
                        {prevTime ?
                        <div>
                            <div className="title">{title}</div>
                            <div><b>Submission Detail</b></div>
                            <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(content)) }}></div>
                            <div>Time: {new Date(prevTime).toLocaleString()}</div>
                            <div>Grade: {prevGrade === -1.0 ? '-' : prevGrade}/{maxGrade} </div>
                            <div>Deadline: {deadline ? new Date(deadline).toLocaleString(): 'Loading...' }</div>
                            {prevFiles.length ? 
                                <div>Submission file: <u className="download-link" onClick={() => onDownloadFiles(prevFiles, downloadRef, firebase)}>{prevFiles.length ? prevFiles[0].name : null}</u></div>
                            : null}
                            <a className="hide" ref={downloadRef} target="_blank">
                                Hidden Download Link
                            </a>
                            <Link to={`/student-view/course/${courseId}/assignment/detail/${assignmentId}`}>Back</Link>
                        </div>
                        :
                        null
                        }
                        
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(AssignmentSubmissionDetail as any) as any;