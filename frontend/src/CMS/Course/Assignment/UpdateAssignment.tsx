import React, { createRef } from "react"
import { useState, useContext, useEffect} from "react";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../GeneralStyles.scss"
import { useHistory } from "react-router-dom";
import { getFile, uploadFileWrapper, onDownloadFiles } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import ReactFileReader from "react-file-reader";
import { verifyTeacherCourse } from "../../AuthUtils";

export function UpdateAssignment() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const firebase = useContext(FirebaseContext)

    const history = useHistory()
    
    const [content, setContent] = useState();
    const [title, setTitle] = useState('')
    const [available, setAvailable] = useState('1')
    const [maxGrade,setMaxGrade] = useState(0.0)
    const [deadline, setDeadline] = useState('')
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')
    const [files, setFiles] = useState([]);
    const downloadRef = createRef<HTMLAnchorElement>();
    //uploadFiles is new file. files, fileName are existing files
    const [veri, setVeri] = useState(true)

    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'assignment',files.length?files[0].path:'','/cms/assignment/file',{'assignment':assignmentId});
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
                setContent(JSON.parse(response['description']))
                let ddlString = ''
                let ddlDate = new Date(response['deadline'])
                let ddlDay = ddlDate.getDate()
                let ddlMonth = ddlDate.getMonth()+1
                let ddlHour = ddlDate.getHours()
                let ddlMin = ddlDate.getMinutes()
                ddlString = ddlDate.getFullYear() + '-'
                if(ddlMonth < 10)
                    ddlString = ddlString + '0' + ddlMonth + '-'
                else
                    ddlString = ddlString + ddlMonth + '-'
                
                if (ddlDay < 10)
                    ddlString = ddlString + '0' + ddlDay + 'T'
                else
                    ddlString = ddlString + ddlDay + 'T'

                if (ddlHour < 10)
                    ddlString = ddlString + '0' + ddlHour + ':'
                else
                    ddlString = ddlString + ddlHour + ':'

                if (ddlMin < 10)
                    ddlString = ddlString + '0' + ddlMin
                else
                    ddlString = ddlString + ddlMin
                setDeadline(ddlString)
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

    async function onSubmit() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', title);
        formData.append('description', JSON.stringify(content))
        formData.append('assignment', assignmentId)
        formData.append('available', available)
        formData.append('deadline', new Date(deadline).toUTCString())
        formData.append('max_grade', maxGrade.toString())

        try {
            await fetch('/cms/assignments/update', {
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
        try {
            if (uploadFiles) {
                await uploadHandler(uploadFiles);
            }
        } catch (ex) {
            console.log(ex);
        }
        history.push('/content-management/course/' + courseId + '/assignment/')
    }

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="main-view">
                    {deadline ?
                    <div>
                        <div>Title: <input value={title} className="new-title" onChange={(e)=>setTitle(e.target.value)}></input></div>
                        <Editor
                            initialContentState={content}
                            onContentStateChange={setContent}
                            wrapperClassName="editor-wrapper"
                            editorClassName="editor-content"
                            toolbarClassName="editor-toolbar"
                        >
                        </Editor>
                        <div>Deadline: <input value={deadline} style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => { setDeadline(e.target.value) }}></input></div>
                        <div>Available: <input type='checkbox' checked={available==='1'?true:false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position':'unset' }} onChange={(e) => setAvailable(e.target.checked?'1':'0')}></input></div>
                        {files.length ?
                            <div>Assignment file: <u className="download-link" onClick={() => onDownloadFiles(files, downloadRef, firebase)}>{files.length ? files[0].name : null}</u></div>
                        : null}
                        <a className="hide" ref={downloadRef} target="_blank">
                            Hidden Download Link
                        </a>
                        <div>
                            New Assignment File: {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                            <ReactFileReader
                                fileTypes={["*"]}
                                multipleFiles={false}
                                handleFiles={onSelectFile}
                            >
                                <button>Replace Assignment File</button>
                            </ReactFileReader>
                        </div>
                        <div>Max Grades: <input type="number" value={maxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e)=>setMaxGrade(+e.target.value)}></input></div>
                        <div><button onClick={onSubmit}>Update</button></div>
                    </div>
                    :null}
                </div>
            </div>
        </div>
    )
}




const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(UpdateAssignment as any) as any;