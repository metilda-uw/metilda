import React from "react"
import { useState, useContext, } from "react";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../GeneralStyles.scss"
import { useHistory } from "react-router-dom";
import { FirebaseContext } from "../../../Firebase";
import { uploadFileWrapper } from "../Utils";
import ReactFileReader from "react-file-reader";
import { FileDrop } from 'react-file-drop'

export function CreateAssignment() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const firebase = useContext(FirebaseContext)

    const history = useHistory()
    
    const [contentState, setContentState] = useState();
    const [newTitle, setNewTitle] = useState('')
    const [newAvailable, setNewAvailable] = useState('1')
    const [newDeadline, setNewDeadline] = useState('')
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight, setWeight] = useState(0.0)
    let assignmentId=''

    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'assignment','','/cms/assignment/file',{'assignment':assignmentId});
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

    async function onSubmit(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', newTitle);
        formData.append('description', JSON.stringify(contentState))
        formData.append('course', courseId)
        formData.append('available', newAvailable)
        formData.append('deadline', new Date(newDeadline).toUTCString())
        formData.append('max_grade', maxGrade.toString())
        formData.append('weight', weight.toString())


        try {
            await fetch('/cms/assignments/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            .then(x => x.json())
            .then(x => assignmentId=x.assignment)
        }
        catch (error) {
            console.log(error)
        }
        try {
            if (uploadFiles) {
                await uploadHandler(uploadFiles);
            }
        } catch (ex) {
            console.log(ex);
        }
        history.push('/content-management/course/'+courseId+'/assignments')
    }
    
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <form onSubmit={onSubmit}>
                            <div><b>Title:</b> <input style={{'height':'auto','width':'auto'}} className="new-title" onChange={(e)=>setNewTitle(e.target.value)} required maxLength={30}></input></div>
                            <Editor
                                onContentStateChange={setContentState}
                                wrapperClassName="editor-wrapper"
                                editorClassName="editor-content"
                                toolbarClassName="editor-toolbar"
                                stripPastedStyles={true}
                            >
                            </Editor>
                            <div><b>Deadline:</b> <input style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => setNewDeadline(e.target.value)} required></input></div>
                            <div><b>Available:</b> <input type='checkbox' checked={newAvailable === '1' ? true : false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position':'unset' }} onChange={(e) => setNewAvailable(e.target.checked ? '1' : '0')}></input></div>
                            <div>
                                <b>Assignment File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                <ReactFileReader
                                    fileTypes={["*"]}
                                    multipleFiles={false}
                                    handleFiles={onSelectFile}
                                >
                                    <button type='button' className='btn waves-light globalbtn'>Upload Assignment File</button>
                                </ReactFileReader>
                                <FileDrop
                                    onDrop={onSelectFile}
                                >
                                    Drop file here
                                </FileDrop>
                            </div>
                            <div><b>Max Grades:</b> <input type="number" value={maxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                            <div><b>Weight:</b> <input type="number" value={weight} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e)=>setWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                            <div><button type="submit" className='btn waves-light globalbtn'>Create</button></div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(CreateAssignment as any) as any;