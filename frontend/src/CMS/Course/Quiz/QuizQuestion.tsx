import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Modal from 'react-modal'
import draftToHtml from 'draftjs-to-html';
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "../GeneralStyles.scss"
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { verifyTeacherCourse } from "../../AuthUtils";
import { FirebaseContext } from "../../../Firebase";
import { getFileSrcDict, removeFileWrapper, uploadFileWrapper } from "../Utils";
import { FileDrop } from 'react-file-drop'
import ReactFileReader from "react-file-reader";

function QuizQuestion() {
    const courseId=useParams()['id']
    const user = (useContext(AuthUserContext) as any)
    const quizId = useParams()['quiz_id']
    const questionId = useParams()['question_id']
    const index = useParams()['index']
    const firebase = useContext(FirebaseContext)

    const [content, setContent] = useState({})
    const [type, setType] = useState('')
    const [choiceA, setChoiceA] = useState('')
    const [choiceB, setChoiceB] = useState('')
    const [choiceC, setChoiceC] = useState('')
    const [choiceD, setChoiceD] = useState('')
    const [solution, setSolution] = useState('')
    const [maxTrials, setMaxTrials] = useState(1)
    const [maxGrade, setMaxGrade] = useState(0.0)

    const [status, setStatus] = useState('view')

    const [newContent, setNewContent] = useState({})
    const [newChoiceA, setNewChoiceA] = useState('')
    const [newChoiceB, setNewChoiceB] = useState('')
    const [newChoiceC, setNewChoiceC] = useState('')
    const [newChoiceD, setNewChoiceD] = useState('')
    const [newSolution, setNewSolution] = useState('')
    const [newMaxTrials, setNewMaxTrials] = useState(1)
    const [newMaxGrade, setNewMaxGrade] = useState(0.0)
    
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')

    const [veri, setVeri] = useState(true)

    const history = useHistory()

    const [fileSrcDict, setFileSrcDict] = useState({})

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('question', questionId);
            try {
                let response=await fetch('/cms/quiz/questions/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let responseJSON = await response.json()
                setContent(JSON.parse(responseJSON['content']))
                setNewContent(JSON.parse(responseJSON['content']))
                setChoiceA(responseJSON['choices'].split(',')[0])
                setNewChoiceA(responseJSON['choices'].split(',')[0])
                setChoiceB(responseJSON['choices'].split(',')[1])
                setNewChoiceB(responseJSON['choices'].split(',')[1])
                setChoiceC(responseJSON['choices'].split(',')[2])
                setNewChoiceC(responseJSON['choices'].split(',')[2])
                setChoiceD(responseJSON['choices'].split(',')[3])
                setNewChoiceD(responseJSON['choices'].split(',')[3])
                setSolution(responseJSON['solution'])
                setNewSolution(responseJSON['solution'])
                setMaxGrade(responseJSON['max_grade'])
                setNewMaxGrade(responseJSON['max_grade'])
                if (responseJSON['max_trials']) {
                    setMaxTrials(responseJSON['max_trials'])
                    setNewMaxTrials(responseJSON['max_trials'])
                }
                let temp2 = {}
                if (responseJSON['type'] !== 'text') {
                    await getFileSrcDict(firebase,temp2,questionId,`/cms/quiz/question/file/read/${courseId}/quiz-question/${questionId}`)
                }
                setFileSrcDict(temp2)
                setType(responseJSON['type'])
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchData()
    },[])

    const uploadHandler = async (para_files: any) => {
        console.log(fileSrcDict[questionId])
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'quiz-question','','/cms/quiz/question/file',{'question':questionId});
        } catch (ex) {
          console.log(ex);
        }
    }

    const removeHandler = async (path) => {
        try {
          await removeFileWrapper(firebase, path,'/cms/quiz/question/file');
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

    async function onUpdate(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('question', questionId);
        formData.append('content', JSON.stringify(newContent));
        formData.append('choices', [newChoiceA,newChoiceB,newChoiceC,newChoiceD].toString());
        formData.append('solution', newSolution);
        formData.append('max_grade', newMaxGrade.toString());
        formData.append('max_trials', newMaxTrials.toString());

        try {
            await fetch('/cms/quiz/questions/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log(error)
        }
        if (type === 'audio' || type==='speech') {
            let response = await fetch(
                `/cms/quiz/question/file/read/${courseId}/quiz-question/${questionId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );
            let body = await response.json();
            let file = body
            let path = file[2]
    
            
            try {
                if (uploadFiles) {
                    await removeHandler(path)
                    await uploadHandler(uploadFiles);
                }
            } catch (ex) {
                console.log(ex);
            }
        }
        window.location.reload()
    }

    async function onDelete() {
        if (type === 'audio' || type==='speech') {
            let response = await fetch(
                `/cms/quiz/question/file/read/${courseId}/quiz-question/${questionId}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                }
            );
            let body = await response.json();
            let file = body
            let path = file[2]
            await removeHandler(path)
        }

        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('question', questionId);
        try {
            await fetch('/cms/quiz/questions/delete', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log(error)
        }

        history.push('/content-management/course/'+courseId+'/quiz/'+quizId)
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
                        <div className="title">Question {+index+1}</div>
                        <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(content) }}></div>
                        {type === 'audio' || type==='speech' ?
                            <div>
                                <audio src={fileSrcDict[questionId]} controls></audio>
                            </div>
                        : null}
                        {type === 'text' || type==='audio' ?
                            <div>
                                <div><b>A:</b> {choiceA}</div>
                                <div><b>B:</b> {choiceB}</div>
                                <div><b>C:</b> {choiceC}</div>
                                <div><b>D:</b> {choiceD}</div>
                                <div><b>Solution:</b> {solution}</div>
                            </div>
                        : null}
                        {type === 'speech'?
                            <div><b>Max Trials:</b> {maxTrials}</div>
                        : null}
                        <div><b>Max Grade:</b> {maxGrade}</div>

                        
                        {status === 'update' ?
                            <form onSubmit={onUpdate}>
                                <Editor
                                    initialContentState={content}
                                    onContentStateChange={setNewContent}
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor-content"
                                    toolbarClassName="editor-toolbar"
                                    stripPastedStyles={true}
                                >
                                </Editor>


                                {type === 'audio' || type==='speech' ?
                                <div>
                                    <b>Audio File:</b> {fileName ? fileName : 'No file selected'} &nbsp;&nbsp;&nbsp;
                                    <ReactFileReader
                                        fileTypes={["audio/*"]}
                                        multipleFiles={false}
                                        handleFiles={onSelectFile}
                                    >
                                        <button type='button' className='btn waves-light globalbtn'>Upload Audio File</button>
                                    </ReactFileReader>
                                    <FileDrop
                                        onDrop={onSelectFile}
                                    >
                                        Drop file here
                                    </FileDrop>
                                </div>
                                :null}

                                {type === 'text' || type==='audio'?
                                <div>
                                    <div>
                                        <input id={'radio-A'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'auto' }} name='solution' type='radio' checked={newSolution === 'A'} onChange={() => setNewSolution('A')} required></input>
                                        <label htmlFor="radio-A"><b>A:</b></label>
                                        <input value={newChoiceA} onChange={(e) => setNewChoiceA(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-B'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'auto' }} name='solution' type='radio' checked={newSolution === 'B'} onChange={() => setNewSolution('B')}></input>
                                        <label htmlFor="radio-B"><b>B:</b></label>
                                        <input value={newChoiceB} onChange={(e) => setNewChoiceB(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-C'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'auto' }} name='solution' type='radio' checked={newSolution === 'C'} onChange={() => setNewSolution('C')}></input>
                                        <label htmlFor="radio-C"><b>C:</b></label>
                                        <input value={newChoiceC} onChange={(e) => setNewChoiceC(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-D'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'auto' }} name='solution' type='radio' checked={newSolution === 'D'} onChange={() => setNewSolution('D')}></input>
                                        <label htmlFor="radio-D"><b>D:</b></label>
                                        <input value={newChoiceD} onChange={(e) => setNewChoiceD(e.target.value)} required maxLength={500}></input>
                                    </div>
                                </div>
                                :null}
                                {type === 'speech'?
                                    <div><b>Max trials:</b> <input type="number" value={newMaxTrials} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setNewMaxTrials(+e.target.value)} required min={1} max={50}></input></div>
                                : null}
                                <div><b>Max Grade:</b> <input type="number" value={newMaxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setNewMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <button type='submit' className='btn waves-light globalbtn'>Update</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </form>
                        : null}
                        <Link className="content-link" to={'/content-management/course/'+courseId+'/quiz/'+quizId}>Back</Link>
                    </div>

                    <div className="float-right">
                        <div><button className='btn waves-light globalbtn' onClick={() => setStatus('update')} disabled={status==='update'}>Update question</button></div>
                        <div><button className='btn waves-light globalbtn' onClick={onDelete} disabled={status==='update'}>Delete question</button></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(QuizQuestion as any) as any;