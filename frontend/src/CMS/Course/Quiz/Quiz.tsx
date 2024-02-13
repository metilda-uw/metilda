import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Modal from 'react-modal'
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "../GeneralStyles.scss"
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { verifyTeacherCourse } from "../../AuthUtils";
import { uploadFileWrapper } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import { FileDrop } from 'react-file-drop'
import ReactFileReader from "react-file-reader";

function Quiz() {
    const courseId=useParams()['id']
    const [questionList, setQuestionList] = useState([])
    const user = (useContext(AuthUserContext) as any)
    const quizId = useParams()['quiz_id']
    const firebase = useContext(FirebaseContext)

    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [start, setStart] = useState('')
    const [deadline, setDeadline] = useState('')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight, setWeight] = useState(0.0)

    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')
    const [newStart, setNewStart] = useState('')
    const [newDeadline, setNewDeadline] = useState('')
    const [newMaxGrade, setNewMaxGrade] = useState(0.0)
    const [newWeight, setNewWeight] = useState(0.0)

    const [status, setStatus] = useState('view')

    const [questionContent, setQuestionContent] = useState('')
    const [choiceA, setChoiceA] = useState('')
    const [choiceB, setChoiceB] = useState('')
    const [choiceC, setChoiceC] = useState('')
    const [choiceD, setChoiceD] = useState('')
    const [solution, setSolution] = useState('')
    const [questionMaxGrade, setQuestionMaxGrade] = useState(0.0)
    const [type, setType] = useState('text')
    const [maxTrials, setMaxTrials] = useState(1)
    const [uploadFiles, setUploadFiles] = useState();
    const [fileName, setfileName] = useState('')

    const [veri, setVeri] = useState(true)

    const history = useHistory()

    const [draggable,setDraggable]=useState(false)


    let questionId=''
    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileWrapper(para_files, f=>f, firebase, courseId, 'quiz-question','','/cms/quiz/question/file',{'question':questionId});
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
            formData.append('course', courseId);
            formData.append('quiz', quizId);
            try {
                let response=await fetch('/cms/quiz/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setName(response['name'])
                setNewName(response['name'])
                setDescription(response['description'])
                setNewDescription(response['description'])
                setStart(response['start'])
                setNewStart(response['start'])
                setDeadline(response['deadline'])
                setNewDeadline(response['deadline'])
                setMaxGrade(response['max_grade'])
                setNewMaxGrade(response['max_grade'])
                setWeight(response['weight'])
                setNewWeight(response['weight'])

                response=await fetch('/cms/quiz/questions', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let responseJSON = await response.json()
                setQuestionList(responseJSON)
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchData()
    },[])

    Modal.setAppElement('.App')

    const customStyles = {
        overlay: {
            position: 'fix',
            top: 56,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          transform: 'translate(-50%, -50%)',
        },
    };

    async function onUpdate(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);
        formData.append('name', newName);
        formData.append('description', newDescription);
        formData.append('start', new Date(newStart).toUTCString());
        formData.append('deadline', new Date(newDeadline).toUTCString());
        formData.append('max_grade', newMaxGrade.toString());
        formData.append('weight', newWeight.toString());

        try {
            await fetch('/cms/quiz/update', {
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

        setShowModal(false)
        resetStates()
        window.location.reload()
    }

    async function onDelete() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);

        try {
            await fetch('/cms/quiz/delete', {
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

        history.push('/content-management/course/'+courseId+'/quiz')
    }

    function resetStates() {
        setNewName(name)
        setNewDescription(description)
        setNewStart(start)
        setNewDeadline(deadline)
        setNewMaxGrade(0.0)
    }
    
    function handleOnDragEnd(result) {
        if (!result.destination) return;
    
        const items = Array.from(questionList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
    
        setQuestionList(items);
    }

    async function onCreateQuestion(e) {
        e.preventDefault()
        if ((type === 'audio' || type === 'speech') && !uploadFiles)
            return
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);
        formData.append('content', JSON.stringify(questionContent));
        formData.append('choices', [choiceA,choiceB,choiceC,choiceD].toString());
        formData.append('solution', solution);
        formData.append('type', type);
        formData.append('index', questionList.length.toString());
        formData.append('max_grade', questionMaxGrade.toString());
        formData.append('max_trials', maxTrials.toString());

        try {
            await fetch('/cms/quiz/questions/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            .then(x => x.json())
            .then(x => questionId=x.question)
        }
        catch (error) {
            console.log(error)
        }
        try {
            if (uploadFiles && type!=='text') {
                await uploadHandler(uploadFiles);
            }
        } catch (ex) {
            console.log(ex);
        }
        window.location.reload()
    }

    function toDateComponent(ddlDate) {
        let ddlString = ''
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

        return ddlString
    }

    async function onReorganize() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('questions', questionList.map((question, index) => {
            return (
                question.id+','+index
            );
        }).join(';')
        );

        try {
            await fetch('/cms/quiz/questions/reorganize', {
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
                        <div className="title">Quiz Information</div>
                        <div><b>Quiz Name:</b> {name}</div>
                        <div><b>Description:</b> {description}</div>
                        <div><b>Quiz Start Time:</b> {start?new Date(start).toLocaleString():'Loading...'}</div>
                        <div><b>Quiz End time:</b> {deadline?new Date(deadline).toLocaleString():'Loading...'}</div>
                        <div><b>Max Grade:</b> {maxGrade}</div>
                        <div><b>Weight:</b> {weight}</div>
                        <div className="title">Question List:</div>
                        {questionList.length ?
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <Droppable droppableId="lessons">
                                    {(provided) => (
                                        <div className="lessons" {...provided.droppableProps} ref={provided.innerRef}>
                                            {questionList.map((question, index) => {
                                            return (
                                                <Draggable isDragDisabled={!draggable} key={question.id} draggableId={question.id} index={index}>
                                                    {(provided) => (
                                                        <div className="unstyle list-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <Link to={'/content-management/course/'+courseId+'/quiz/'+quizId+'/question/'+question.id+'/'+index} className="content-link list-item-title">Question { index+1 }</Link>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        : null}
                        {status === 'create' ?
                            <form onSubmit={onCreateQuestion}>
                                <Editor
                                    onContentStateChange={setQuestionContent}
                                    wrapperClassName="editor-wrapper"
                                    editorClassName="editor-content"
                                    toolbarClassName="editor-toolbar"
                                    stripPastedStyles={true}
                                >
                                </Editor>

                                <div>
                                    <b>Question Type:</b>
                                    &nbsp;
                                    <input id={'type-text'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='type' type='radio' onClick={() => setType('text')} required></input>
                                    <label htmlFor="type-text">Text</label>
                                    &nbsp;
                                    <input id={'type-audio'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='type' type='radio' onClick={() => setType('audio')}></input>
                                    <label htmlFor="type-audio">Audio</label>
                                    &nbsp;
                                    <input id={'type-speech'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='type' type='radio' onClick={() => setType('speech')}></input>
                                    <label htmlFor="type-speech">Speech</label>
                                </div>

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
                                {type === 'text' || type==='audio' ?
                                <div>
                                    <div>
                                        <input id={'radio-A'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='solution' type='radio' onClick={() => setSolution('A')} required></input>
                                        <label htmlFor="radio-A"><b>A:</b></label>
                                        <input onChange={(e) => setChoiceA(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-B'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='solution' type='radio' onClick={() => setSolution('B')}></input>
                                        <label htmlFor="radio-B"><b>B:</b></label>
                                        <input onChange={(e) => setChoiceB(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-C'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'unset' }} name='solution' type='radio' onClick={() => setSolution('C')}></input>
                                        <label htmlFor="radio-C"><b>C:</b></label>
                                        <input onChange={(e) => setChoiceC(e.target.value)} required maxLength={500}></input>
                                    </div>
                                    <div>
                                        <input id={'radio-D'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset'}} name='solution' type='radio' onClick={() => setSolution('D')}></input>
                                        <label htmlFor="radio-D"><b>D:</b></label>
                                        <input onChange={(e) => setChoiceD(e.target.value)} required maxLength={500}></input>
                                    </div>
                                </div>
                                : null}
                                {type==='speech' ?
                                    <div><b>Max trials:</b> <input type="number" style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setMaxTrials(+e.target.value)} required min={1} max={50}></input></div>
                                :null}
                                <div><b>Max Grade:</b> <input type="number" style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setQuestionMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <button type='submit' className='btn waves-light globalbtn'>Create</button>
                                <button className='btn waves-light globalbtn' onClick={() => setStatus('view')}>Cancel/Finish</button>
                            </form>
                        : null}
                        <Link className="content-link" to={'/content-management/course/'+courseId+'/quiz'}>Back</Link>
                    </div>

                    <div className="float-right">
                        <div><button className='btn waves-light globalbtn' onClick={() => setShowModal(true)} disabled={draggable}>Update quiz information</button></div>
                        {/* <div><button className='btn waves-light globalbtn' onClick={onDelete} disabled={draggable}>Delete quiz</button></div> */}
                        <div><button className='btn waves-light globalbtn' onClick={()=>setStatus('create')} disabled={draggable}>Create a question</button></div>
                        <div>
                            {
                                draggable ?
                                <button className='btn waves-light globalbtn' onClick={() => { onReorganize();setDraggable(false) }}>Save question list</button>
                                :
                                <button className='btn waves-light globalbtn' onClick={() => setDraggable(true)}>Reorganize question list</button>
                            }
                            
                        </div>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Update quiz information</div>
                            <form onSubmit={onUpdate}>
                                <div><b>Quiz name:</b> <input value={newName} onChange={(e) => setNewName(e.target.value)} required maxLength={30}></input></div>
                                <div><b>Description:</b> <input value={newDescription} onChange={(e) => setNewDescription(e.target.value)} maxLength={200}></input></div>
                                <div><b>Start:</b> <input value={toDateComponent(new Date(newStart))} style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => setNewStart(e.target.value)} required></input></div>
                                <div><b>Deadline:</b> <input value={toDateComponent(new Date(newDeadline))} style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => setNewDeadline(e.target.value)} required></input></div>
                                <div><b>Max Grades:</b> <input type="number" value={newMaxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setNewMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <div><b>Weight:</b> <input type="number" value={newWeight} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setNewWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                                <div><button type='submit' className='btn waves-light globalbtn'>Update</button></div>
                                <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                            </form>
                        </Modal>
                    </div>

                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Quiz as any) as any;