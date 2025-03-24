import React, { createRef, useState, useContext, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import draftToHtml from 'draftjs-to-html';
import "../GeneralStyles.scss";
import { getFile, onDownloadFiles } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import { verifyTeacherCourse } from "../../AuthUtils";
import { spinnerIcon } from "../../../Utils/SpinnerIcon";
import { ViewAndGradeAssignment } from "./ViewAndGradeAssignment";
import { NotSubmittedList } from "./NotSubmittedList";
import { cacheApiResponse, getCachedApiResponse } from "../../../Utils/cacheUtils";

export function Assignment() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()['id'];
    const assignmentId = useParams()['assignment_id'];
    const [errorMessage, setErrorMessage] = useState('');
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true);
    const [viewingGrade, setViewingGrade] = useState(false);
    const [gradedStatus, setGradedStatus] = useState<'graded' | 'not_graded' | null>(null);
    const [showNotSubmitted, setShowNotSubmitted] = useState(false);
    const [postingScores, setPostingScores] = useState(false);
    const [posted, setPosted] = useState(true);

    const [assignmentData, setAssignmentData] = useState({
        title: '',
        description: '{}',
        deadline: '',
        available: '1',
        weight: 0.0,
        maxGrade: 0.0,
        posted: false,
        files: [],
        graded_count: 0,
        needs_grading_count: 0,
        not_submitted_count: 0
    });

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            const cacheKey = `assignment_${courseId}_${assignmentId}`;
            const data = await getCachedApiResponse(cacheKey);
            console.log("out"+ JSON.stringify(data))
            if (data) {
                console.log("in")
                setAssignmentData(data);
                setLoading(false);
                setPosted(data.posted)
                setErrorMessage(null);
                return;
            }

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment_id', assignmentId);
            formData.append('course_id', courseId);
            try {
                let response = await fetch('/cms/assignments/read/with_count', {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                });
                const data = await response.json();
                const formattedData = {
                    title: data.name,
                    description: data.description,
                    deadline: data.deadline,
                    available: data.available ? "1" : "0",
                    weight: +data.weight,
                    maxGrade: +data.max_grade,
                    posted: data.posted,
                    files: [],
                    graded_count: data.graded_count,
                    needs_grading_count: data.needs_grading_count,
                    not_submitted_count: data.not_submitted_count
                };

                // Cache the data
                await cacheApiResponse(cacheKey, formattedData);
                setAssignmentData(formattedData);
                setPosted(data.posted)
                getFile(firebase, (files) => setAssignmentData(prev => ({ ...prev, files })), `/cms/assignment/file/read/${courseId}/assignment/${assignmentId}`);
                setErrorMessage(null);
            } catch {
                setErrorMessage('Error loading assignment details. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
        if (user) {
            fetchData();
        }
    }, [user]);

    const handlePostScores = async () => {
        setPostingScores(true);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('assignment_id', assignmentId);

            const response = await fetch(`/cms/assignment/post_scores`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to post scores.");
            }

            alert("Scores successfully posted!");
            setPosted(true)
        } catch (error: any) {
            setPostingScores(false);
        } finally {
            setPostingScores(false);
        }
    };

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div>
            <Header />
            <div className="main-layout">
                <Sidebar courseId={courseId} />
                <div className="height-column"></div>
                <div className="main-view">

                    {loading ? (
                        spinnerIcon()
                    ) : viewingGrade && gradedStatus ? (
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", width: '90vw' }}>
                                <button className="back-button" onClick={() => { setViewingGrade(false); setGradedStatus(null); }}>
                                    Back
                                </button>

                                {posted == false && (
                                    <button className="back-button" onClick={handlePostScores} disabled={postingScores}>
                                        {postingScores ? "Posting..." : "Post Scores"}
                                    </button>
                                )}
                            </div>

                            <ViewAndGradeAssignment gradedStatus={gradedStatus} deadline={assignmentData.deadline}/>
                        </div>
                    )
                        : showNotSubmitted ?
                            (
                                <div style={{ textAlign: "left" }}>
                                    <button className="back-button" style={{ margin: "15px 0 0 12px" }} onClick={() => { setShowNotSubmitted(false); }}>
                                        Back
                                    </button>
                                    <NotSubmittedList />
                                </div>
                            )
                            : (
                                <div style={{ width: '100%' }}>
                                    <div className="button-container">
                                        <div></div>
                                        <Link className="create-assignment-button" to={`/content-management/course/${courseId}/assignment/${assignmentId}/update`}>Update assignment</Link>
                                        {
                                            posted == false && <button className="create-assignment-button" style={{border: "2px solid #007bff"}} onClick={handlePostScores} disabled={postingScores}>{postingScores ? "Posting..." : "Post Scores"}</button>
                                        }

                                    </div>
                                    <div className="assignment-container">
                                        <div className="individual-assignment-title">{assignmentData.title}</div>
                                        <div className="assignment-details">
                                            <div><b>Deadline:</b> {assignmentData.deadline ? new Date(assignmentData.deadline).toLocaleString() : 'Loading...'}</div>
                                            <div><b>Available:</b> {assignmentData.available === '1' ? 'Yes' : 'No'}</div>
                                            <div><b>Weight:</b> {assignmentData.weight || 'N/A'}</div>
                                            <div><b>Max Grades:</b> {assignmentData.maxGrade}</div>
                                            {assignmentData.files.length ? (
                                                <div>
                                                    <b>Assignment file:</b>
                                                    <u className="download-link" onClick={() => onDownloadFiles(assignmentData.files, downloadRef, firebase)}>
                                                        {assignmentData.files[0].name}
                                                    </u>
                                                </div>
                                            ) : null}
                                            <a className="hide" ref={downloadRef} target="_blank">Hidden Download Link</a>
                                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                                        </div>
                                        <div className="status-section">
                                            <div className="status-box graded" style={{ cursor: "pointer" }} onClick={() => { setGradedStatus('graded'); setViewingGrade(true); }}>Graded: {assignmentData.graded_count}</div>
                                            <div className="status-box needs-grading" style={{ cursor: "pointer" }} onClick={() => { setGradedStatus('not_graded'); setViewingGrade(true); }}>Needs Grading: {assignmentData.needs_grading_count}</div>
                                            <div className="status-box not-submitted" style={{ cursor: "pointer" }} onClick={() => { setShowNotSubmitted(true); }}>Not Submitted: {assignmentData.not_submitted_count}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Assignment as any) as any;