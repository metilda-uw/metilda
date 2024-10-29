import React, { createRef } from "react"; 
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss";
import { verifyTeacherCourse } from "../../AuthUtils";
import { FirebaseContext } from "../../../Firebase";
import { getFile, onDownloadFiles } from "../Utils";
import draftToHtml from 'draftjs-to-html';

function GradesAssignmentSubmissionDetail() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()['id'];
    const assignmentId = useParams()['assignment_id'];
    const submissionId = useParams()['submission_id'];
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('{}');
    const [deadline, setDeadline] = useState('');
    const [maxGrade, setMaxGrade] = useState(0.0);
    const [prevFiles, setPrevFiles] = useState([]);
    const [prevTime, setPrevTime] = useState('');
    const [prevGrade, setPrevGrade] = useState(-1.0);
    const [prevComment, setPrevComment] = useState('');
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [veri, setVeri] = useState(true);
    const [newGrade, setNewGrade] = useState(-1);
    const [newComment, setNewComment] = useState('');
    const history = useHistory();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri)
                return;

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            setTimeout(async () => {
                try {
                    let response = await fetch('/cms/assignments/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    });
                    response = await response.json();
                    setTitle(response['name']);
                    setDeadline(response['deadline']);
                    setMaxGrade(+response['max_grade']);

                    formData = new FormData();
                    formData.append('user', user.email);
                    formData.append('submission', submissionId);
                    response = await fetch('/cms/grades/assignment/submission/read', {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    });
                    response = await response.json();
                    if (response) {
                        setPrevTime(response['time']);
                        if (response['content'] !== 'undefined')
                            setContent(response['content']);
                        setPrevGrade(response['grade']);
                        setPrevComment(response['comment']);
                        getFile(firebase, setPrevFiles, `/student-view/assignment/submission/file/read/${response['user']}/${assignmentId}`);
                    }
                } catch (error) {
                    setErrorMessage("Error loading data. Please try again.");
                }
            }, 1000);
        }
        fetchData();
    }, []);

    function onGrade(e) {
        e.preventDefault();
        if (newGrade > 1000000 || newGrade < 0 || newComment.length > 5000)
            return;
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('submission', submissionId);
            formData.append('grade', newGrade.toString());
            formData.append('comment', newComment);
            try {
                await fetch('/cms/grades/assignment/submission/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
            } catch (error) {
                console.log(error);
            }
            window.location.reload();
        }
        fetchData();
    }

    function onGradeAndNext(e) {
        e.preventDefault();
        if (newGrade > 1000000 || newGrade < 0 || newComment.length > 5000)
            return;
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('submission', submissionId);
            formData.append('grade', newGrade.toString());
            formData.append('comment', newComment);
            try {
                await fetch('/cms/grades/assignment/submission/grade', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
            } catch (error) {
                console.log("Fetch failed, see if it is 403 in error console");
            }

            formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            formData.append('submission', submissionId);
            try {
                let response = await fetch('/cms/grades/assignment/submission/next', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
                response = await response.json();
                if (response['submission']) {
                    history.push(`/content-management/course/${courseId}/grades/assignment/${assignmentId}/submission/${response['submission']}`);
                    window.location.reload();
                } else {
                    history.push(`/content-management/course/${courseId}/grades/assignment/${assignmentId}`);
                }

            } catch (error) {
                console.log("Fetch failed, see if it is 403 in error console");
            }
        }
        fetchData();
    }

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view centered">
                    <div className="info-list">
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        {prevTime ?
                            <div>
                                <div className="title">{title}</div>
                                <div><b>Submission Detail</b></div>
                                <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(content)) }}></div>
                                <div><b>Time:</b> {new Date(prevTime).toLocaleString()}</div>
                                <div><b>Grade:</b> {prevGrade === -1.0 ? '-' : prevGrade}/{maxGrade} </div>
                                {prevComment ? <div><div><b>Grader Comment:</b></div> <div>{prevComment.split('\n').map((line) => <div>{line}</div>)}</div></div> : null}
                                <div><b>Deadline:</b> {deadline ? new Date(deadline).toLocaleString() : 'Loading...'}</div>
                                {prevFiles.length ?
                                    <div><b>Submission file:</b> <u className="download-link" onClick={() => onDownloadFiles(prevFiles, downloadRef, firebase)}>{prevFiles.length ? prevFiles[0].name : null}</u></div>
                                    : null}
                                <a className="hide" ref={downloadRef} target="_blank">
                                    Hidden Download Link
                                </a>
                                <form>
                                    <div>
                                        <input type="number" onChange={(e) => setNewGrade(+e.target.value)} style={{ 'width': 'auto', 'height': 'auto' }} required max={1000000} min={0} step={0.01}></input> &nbsp;
                                        <button className='btn waves-light globalbtn' onClick={onGrade}>Save Grade</button> &nbsp;
                                        <button className='btn waves-light globalbtn' onClick={onGradeAndNext}>Save Grade & Next</button>
                                    </div>
                                    <div>
                                        <div><b>Grade Comment:</b></div>
                                        <textarea rows={7} style={{ 'width': '500px', 'height': 'auto' }} onChange={(e) => setNewComment(e.target.value)} maxLength={5000}></textarea>
                                    </div>
                                </form>
                                <Link className="content-link" to={`/content-management/course/${courseId}/grades/assignment/${assignmentId}`}>Back</Link>
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
export default withAuthorization(authCondition)(GradesAssignmentSubmissionDetail as any) as any;
