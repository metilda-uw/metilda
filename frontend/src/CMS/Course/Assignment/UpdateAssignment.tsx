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
import { FileDrop } from 'react-file-drop'

export function UpdateAssignment() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const firebase = useContext(FirebaseContext)

    const history = useHistory()
    
    const [content, setContent] = useState();
    const [title, setTitle] = useState('')
    const [available, setAvailable] = useState('1')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight,setWeight] = useState(0.0)
    const [deadline, setDeadline] = useState('')
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')
    const [files, setFiles] = useState([]);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [veri, setVeri] = useState(true)
    const [loaded,setLoaded] = useState(false)
    const [errorMessage, setErrorMessage] = useState('');

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
            await verifyTeacherCourse(user.email, courseId, setVeri)
            if (!veri) return
            
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            try {
                setTimeout(async () => {
                    let response = await fetch('/cms/assignments/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    })
                    
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }

                    const data = await response.json();
                    setTitle(data['name']);
                    setContent(JSON.parse(data['description']));
                    let ddlString = '';
                    let ddlDate = new Date(data['deadline']);
                    let ddlDay = ddlDate.getDate();
                    let ddlMonth = ddlDate.getMonth() + 1;
                    let ddlHour = ddlDate.getHours();
                    let ddlMin = ddlDate.getMinutes();
                    ddlString = ddlDate.getFullYear() + '-';
                    if (ddlMonth < 10)
                        ddlString = ddlString + '0' + ddlMonth + '-';
                    else
                        ddlString = ddlString + ddlMonth + '-';

                    if (ddlDay < 10)
                        ddlString = ddlString + '0' + ddlDay + 'T';
                    else
                        ddlString = ddlString + ddlDay + 'T';

                    if (ddlHour < 10)
                        ddlString = ddlString + '0' + ddlHour + ':';
                    else
                        ddlString = ddlString + ddlHour + ':';

                    if (ddlMin < 10)
                        ddlString = ddlString + '0' + ddlMin;
                    else
                        ddlString = ddlString + ddlMin;
                    
                    setDeadline(ddlString);
                    setAvailable(data['available'] ? '1' : '0');
                    setMaxGrade(+data['max_grade']);
                    setWeight(+data['weight']);
                    getFile(firebase, setFiles, `/cms/assignment/file/read/${courseId}/assignment/${assignmentId}`);
                    setLoaded(true);
                }, 1000);
            } catch (error) {
                setErrorMessage("Error loading assignment data.");
            }
        }
        if (user) {
            fetchData();
        }
    }, [user])

    async function onSubmit(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', title);
        formData.append('description', JSON.stringify(content))
        formData.append('assignment', assignmentId)
        formData.append('available', available)
        formData.append('deadline', new Date(deadline).toUTCString())
        formData.append('max_grade', maxGrade.toString())
        formData.append('weight', weight.toString())

        try {
            await fetch('/cms/assignments/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });
        } catch (error) {
            setErrorMessage("Fetch failed, see if it is 403 in error console");
        }

        try {
            if (uploadFiles) {
                await uploadHandler(uploadFiles);
            }
        } catch (ex) {
            console.log(ex);
        }
        history.push('/content-management/course/' + courseId + '/assignments/')
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
                <div className="main-view">
                    <div className="info-list">
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {loaded ? 
                            <form onSubmit={onSubmit}>
                                <div><b>Title:</b> <input value={title} className="new-title" onChange={(e)=>setTitle(e.target.value)} required maxLength={30}></input></div>
                                <Editor
                                    initialContentState={content}
                                    onContentStateChange={setContent}
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor-content"
                                    toolbarClassName="editor-toolbar"
                                    stripPastedStyles={true}
                                >
                                </Editor>
                                <div><b>Deadline:</b> <input value={deadline} style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => { setDeadline(e.target.value) }} required></input></div>
                                <div><b>Available:</b> <input type='checkbox' defaultChecked={available==='1'?true:false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position':'unset' }} onChange={(e) => setAvailable(e.target.checked?'1':'0')}></input></div>
                                {files.length ?
                                    <div><b>Assignment file:</b> <u className="download-link" onClick={() => onDownloadFiles(files, downloadRef, firebase)}>{files.length ? files[0].name : null}</u></div>
                                : null}
                                <a className="hide" ref={downloadRef} target="_blank">
                                    Hidden Download Link
                                </a>
                                <div>
                                    <b>New Assignment File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                    <ReactFileReader
                                        fileTypes={["*"]}
                                        multipleFiles={false}
                                        handleFiles={onSelectFile}
                                    >
                                        <button type='button' className='btn waves-light globalbtn'>Replace Assignment File</button>
                                    </ReactFileReader>
                                    <FileDrop
                                        onDrop={onSelectFile}
                                    >
                                        Drop file here
                                    </FileDrop>
                                </div>
                                <div><b>Max Grades:</b> <input type="number" value={maxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <div><b>Weight:</b> <input type="number" value={weight} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e)=>setWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                                <div><button type="submit" className='btn waves-light globalbtn'>Update</button></div>
                            </form>
                        : null}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(UpdateAssignment as any) as any;