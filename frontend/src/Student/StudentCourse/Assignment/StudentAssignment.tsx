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
import { getFile, onDownloadFiles, removeFileWrapper } from "../../../CMS/Course/Utils";
import { FirebaseContext } from "../../../Firebase";
import { uploadFileWrapper } from "../../../CMS/Course/Utils";
import ReactFileReader from "react-file-reader";
import { verifyStudentCourse } from "../../../CMS/AuthUtils";
import { FileDrop } from 'react-file-drop'

export function StudentAssignment() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const [title,setTitle] = useState('')
    const [content,setContent] = useState('{}')
    const [deadline, setDeadline] = useState('')
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [files, setFiles] = useState([]);
    const [prevFiles, setPrevFiles] = useState([]);
    const [prevTime, setPrevTime] = useState('');
    const [prevGrade, setPrevGrade] = useState(-1.0);
    const firebase = useContext(FirebaseContext)
    const downloadRef = createRef<HTMLAnchorElement>();
    const [subContent, setSubContent] = useState(); //This is for submission input, above content is for fetched assignment detail
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')
    //uploadFiles is new file. files, fileName are files of assignment, prevFile is old submission
    const history = useHistory()
    const [veri, setVeri] = useState(true)

    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'assignment-submission',prevFiles.length?prevFiles[0].path:'','/student-view/assignment/submission/file',{'assignment':assignmentId});
        } catch (ex) {
          console.log(ex);
        }
    }
    const removeHandler = async () => {
        try {
          await removeFileWrapper(firebase, prevFiles[0].path,'/student-view/assignment/submission/file',{'assignment':assignmentId});
        } catch (ex) {
          console.log(ex);
        }
    }

    async function onSelectFile(selectedFiles) {
        const filePromise = new Promise(async (resolve, reject) => {
            if (selectedFiles.length === 1) {
                setUploadFiles(selectedFiles)
                const file = selectedFiles[0];
                setfileName(file.name);
            }
        });
        return filePromise;
    }

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
                if (response['description'] !== 'undefined')
                    setContent(response['description'])
                setDeadline(response['deadline'])
                setMaxGrade(+response['max_grade'])
                getFile(firebase, setFiles, `/student-view/assignment/file/read/${courseId}/assignment/${assignmentId}`)

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
                    setPrevGrade(response['grade'])
                    getFile(firebase, setPrevFiles, `/student-view/assignment/submission/file/read/${user.email}/${assignmentId}`)
                }
            }
            catch {}
        }
        if (user) {
            fetchData()
        }
    },[user])

    async function onSubmit() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('content', JSON.stringify(subContent))
        formData.append('assignment', assignmentId)
        formData.append('max_grade', maxGrade.toString())
        formData.append('time', new Date().toUTCString())
        if (prevTime) {
            try {
                await fetch('/student-view/assignment/submission/update', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            }
            catch (error) {}
        }
        else {
            try {
                await fetch('/student-view/assignment/submission/create', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
            }
            catch (error) {}
        }
        try {
            if (uploadFiles) {
                await uploadHandler(uploadFiles);
            }
            else if (prevFiles.length) {
                await removeHandler()
            }
        } catch (ex) {
            console.log(ex);
        }
        window.location.reload()
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
                        <div className="block">
                            <div className="title">{title}</div>
                            <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(content)) }}></div>
                            <div><b>Deadline:</b> {deadline ? new Date(deadline).toLocaleString():'Loading...' }</div>
                            <div><b>Max Grades:</b> {maxGrade}</div>
                            {files.length ? 
                                <div><b>Assignment file:</b> <u className="download-link" onClick={() => onDownloadFiles(files, downloadRef, firebase)}>{files.length ? files[0].name : null}</u></div>
                            : null}
                            <a className="hide" ref={downloadRef} target="_blank">
                                Hidden Download Link
                            </a>
                        </div>
                        <br></br>
                        {prevTime ?
                            <div className="block">
                                <div>
                                    <Link className="content-link list-item-title" to={`/student-view/course/${courseId}/assignment/${assignmentId}/submission`}>Previous Submission</Link>
                                    <div><b>Time:</b> {new Date(prevTime).toLocaleString()}</div>
                                    <div><b>Grade:</b> {prevGrade === -1.0 ? '-' : prevGrade}/{maxGrade} </div>
                                </div>
                            </div>
                            :
                            null
                        }
                        <br></br>
                        <div className="block">
                            <div><b>Make a new submission</b></div>
                            <Editor
                                onContentStateChange={setSubContent}
                                wrapperClassName="editor-wrapper"
                                editorClassName="editor-content"
                                toolbarClassName="editor-toolbar"
                                stripPastedStyles={true}
                            >
                            </Editor>
                            <div>
                                <b>Submission File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                <ReactFileReader
                                    fileTypes={["*"]}
                                    multipleFiles={false}
                                    handleFiles={onSelectFile}
                                >
                                    <button className='btn waves-light globalbtn' >Upload Submission File</button>
                                </ReactFileReader>
                                <FileDrop
                                    onDrop={onSelectFile}
                                >
                                    Drop file here
                                </FileDrop>
                                <div><button className='btn waves-light globalbtn' onClick={onSubmit}>Submit</button></div>
                            </div>
                        </div>
                        <Link className="content-link" to={'/student-view/course/'+courseId+'/assignments/'}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentAssignment as any) as any;