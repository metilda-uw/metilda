import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import draftToHtml from 'draftjs-to-html';
import Sidebar from "../StudentSidebar";
import { useParams } from "react-router-dom";
import "../../../CMS/Course/GeneralStyles.scss"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { verifyStudentCourse } from "../../../CMS/AuthUtils";
import { FirebaseContext } from "../../../Firebase";
import { getFile, getFileSrcDict, uploadFileBlobWrapper } from "../../../CMS/Course/Utils";
import AudioReactRecorder, { RecordState } from 'audio-react-recorder'

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
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [maxTrials, setMaxTrials] = useState(1)
    const [trial, setTrial] = useState(-1)
    const [prevAnswer,setPrevAnswer] = useState('')
    const [uploading, setUploading] = useState(false)
    const [oldPath,setOldPath] = useState('')
    const [recordState, setRecordState] = useState(null)
    // const [answered,setAnswered] = useState(true)
    
    const history = useHistory()

    const [veri, setVeri] = useState(true)

    const [fileSrcDict, setFileSrcDict] = useState({})

    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileBlobWrapper(para_files, firebase, courseId, 'quiz-question-answer','','/student-view/quiz/question/answer/file',{'question':questionId,'user':user.email});
        } catch (ex) {
          console.log(ex);
        }
    }
    const updateHandler = async (para_files: any) => {
        try {
          await uploadFileBlobWrapper(para_files, firebase, courseId, 'quiz-question-answer',oldPath,'/student-view/quiz/question/answer/file',{'question':questionId,'user':user.email});
        } catch (ex) {
          console.log(ex);
        }
    }

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('question', questionId);
            try {
                let response=await fetch('/student-view/quiz/questions/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let responseJSON = await response.json()
                setContent(JSON.parse(responseJSON['content']))
                setChoiceA(responseJSON['choices'].split(',')[0])
                setChoiceB(responseJSON['choices'].split(',')[1])
                setChoiceC(responseJSON['choices'].split(',')[2])
                setChoiceD(responseJSON['choices'].split(',')[3])
                setMaxGrade(responseJSON['max_grade'])
                setPrevAnswer(responseJSON['prev_answer'])
                setTrial(responseJSON['trial']+1)
                setMaxTrials(responseJSON['max_trials'])
                let temp2 = {}
                if (responseJSON['type'] !== 'text') {
                    await getFileSrcDict(firebase,temp2,questionId,`/cms/quiz/question/file/read/${courseId}/quiz-question/${questionId}`)
                }
                setFileSrcDict(temp2)
                setType(responseJSON['type'])
                if (responseJSON['type'] === 'speech') {
                    try {
                        response = await fetch(
                            `/student-view/quiz/question/answer/file/read/${courseId}/quiz-question-answer/${questionId}/${user.email}`,
                            {
                                method: "GET",
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                },
                            }
                        );
                        responseJSON = await response.json();
                        setOldPath(responseJSON[2])
                    } catch (ex) {
                        console.log(ex);
                    }
                }


            }
            catch (error) {
                console.log(error)
            }
        }
        fetchData()
    }, [])
    
    async function onChoose(answer) {
        setUploading(true)
        setPrevAnswer(answer)
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);
        formData.append('question', questionId);
        formData.append('max_grade', maxGrade.toString());
        formData.append('answer', answer);
        formData.append('time', new Date().toUTCString());
        try {
            await fetch('/student-view/quiz/question/answer', {
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
        setUploading(false)
    }


    async function onNext() {
        let formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);
        formData.append('question', questionId);
        try {
            let response = await fetch('/student-view/quiz/question/next', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            response=await response.json()
            if (response['question']) {
                history.push(`/student-view/course/${courseId}/quiz/${quizId}/question/${response['question']}/${+index+1}`)
                window.location.reload()
            }
            else {
                history.push(`/student-view/course/${courseId}/quiz/${quizId}`)
            }
                
        }
        catch (error) {
            console.log(error)
        }    
    }

    async function onStop(record) {
        setUploading(true)
        setRecordState(RecordState.STOP)
        try {
            if (trial===1)
                await uploadHandler(record.blob);
            else {
                await updateHandler(record.blob);
            }
        } catch (ex) {
            console.log(ex);
        }

        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('quiz', quizId);
        formData.append('question', questionId);
        formData.append('max_grade', maxGrade.toString());
        formData.append('answer', 'speech');
        formData.append('time', new Date().toUTCString());
        formData.append('trial',trial.toString())
        try {
            await fetch('/student-view/quiz/question/answer', {
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
        setUploading(false)
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
                                <div>
                                    <input id={'radio-A'} style={{ 'position': 'unset', 'opacity': 'unset', 'pointerEvents': 'unset' }} name='solution' type='radio' checked={prevAnswer === 'A'} onChange={() => { onChoose('A') }}></input>
                                    <label htmlFor="radio-A"><b>A:</b> {choiceA}</label>
                                </div>
                                <div>
                                    <input id={'radio-B'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset'}} name='solution' type='radio' checked={prevAnswer==='B'} onChange={() => { onChoose('B') }}></input>
                                    <label htmlFor="radio-B"><b>B:</b> {choiceB}</label>
                                </div>
                                <div>
                                    <input id={'radio-C'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset'}} name='solution' type='radio' checked={prevAnswer==='C'} onChange={() => { onChoose('C') }}></input>
                                    <label htmlFor="radio-C"><b>C:</b> {choiceC}</label>
                                </div>
                                <div>
                                    <input id={'radio-D'} style={{'position':'unset','opacity':'unset','pointerEvents':'unset', 'margin': 'inherit' }} name='solution' type='radio' checked={prevAnswer==='D'} onChange={() => { onChoose('D') }}></input>
                                    <label htmlFor="radio-D"><b>D:</b> {choiceD}</label>
                                </div>
                            </div>
                        : null}
                        {type === 'speech' ?
                            <div>
                                <div>
                                    <b>Record Status:</b>
                                    <AudioReactRecorder state={recordState} onStop={onStop} canvasWidth={100} canvasHeight={60}/>
                                    <button className='btn waves-light globalbtn' onClick={()=>setRecordState(RecordState.START)} disabled={trial===-1?true:trial>maxTrials}>Start Recording</button>
                                    <button className='btn waves-light globalbtn' onClick={()=>setRecordState(RecordState.STOP)} disabled={trial===-1?true:trial>maxTrials}>Stop Recording</button>
                                </div>
                                <div><b>Trial:</b> {trial > maxTrials?'Depleted':trial+'/'+maxTrials}</div>
                            </div>
                        : null}
                        <div><b>Max Grade:</b> {maxGrade}</div>
                        {uploading ? <div><b>Saving...</b></div> : <div><b>Saved</b></div>}
                        <div><button className='btn waves-light globalbtn' onClick={onNext} disabled={uploading}>Next</button></div>
                        <Link className="content-link" to={'/student-view/course/'+courseId+'/quiz/'+quizId}>Back to quiz page</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(QuizQuestion as any) as any;