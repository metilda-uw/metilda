import React, { createRef } from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import draftToHtml from 'draftjs-to-html';
import "../GeneralStyles.scss"
import { getFile, onDownloadFiles } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import { classNames } from "react-select/src/utils";
import { verifyTeacherCourse } from "../../AuthUtils";


export function AssignmentDetail() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('{}')
    const [deadline,setDeadline] = useState('')
    const [available, setAvailable] = useState('1')
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [files, setFiles] = useState([]);
    const firebase = useContext(FirebaseContext)
    const downloadRef = createRef<HTMLAnchorElement>();
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            try {
                let response = await fetch('/cms/assignments/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setContent(response['description'])
                setDeadline(response['deadline'])
                setAvailable(response['available'] ? '1' : '0')
                setMaxGrade(+response['max_grade'])
                getFile(firebase,setFiles,`/cms/assignment/file/read/${courseId}/assignment/${assignmentId}`)
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
                        <div className='title'>{title}</div>
                        <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(content)) }}></div>
                        <div>Deadline: {deadline ? new Date(deadline).toLocaleString():'Loading...' }</div>
                        <div>Available: {available === '1' ? 'Yes' : 'No'}</div>
                        {files.length ? 
                            <div>Assignment file: <u className="download-link" onClick={() => onDownloadFiles(files, downloadRef, firebase)}>{files.length ? files[0].name : null}</u></div>
                        : null}
                        <a className="hide" ref={downloadRef} target="_blank">
                            Hidden Download Link
                        </a>
                        <div>Max Grades: {maxGrade}</div>
                        <Link to={'/content-management/course/'+courseId+'/assignment/'}>Back</Link>
                    </div>
                    <div className="float-right">
                        <Link to={'/content-management/course/'+courseId+'/assignment/'+assignmentId+'/update'}>Update assignment</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(AssignmentDetail as any) as any;