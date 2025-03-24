import React, { useContext, useEffect, useState, createRef } from "react";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss";
import { FirebaseContext } from "../../../Firebase";
import { verifyTeacherCourse } from "../../AuthUtils";
import { spinnerIcon } from "../../../Utils/SpinnerIcon";
import { onDownloadFiles, previewFileWrapper } from "../Utils";
import { FaDownload } from "react-icons/fa";
import Modal from 'react-modal'
import { cacheApiResponse, getCachedApiResponse } from "../../../Utils/cacheUtils";

interface ViewAndGradeAssignmentProps {
    gradedStatus: "graded" | "not_graded";
    deadline: string;
}

export function ViewAndGradeAssignment({ gradedStatus, deadline }: ViewAndGradeAssignmentProps) {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()["id"];
    const assignmentId = useParams()["assignment_id"];
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [loading, setLoading] = useState(true);
    const [veri, setVeri] = useState(true);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [grades, setGrades] = useState<{ [key: string]: { score: number; comment: string } }>({});
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [filePreviewName, setFilePreviewName] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, (isValid) => {
                if (!isValid) return;
            });

            const cacheKey = `submissions_${assignmentId}`;
            const cachedData = await getCachedApiResponse(cacheKey);

            if (cachedData) {
                setSubmissions(cachedData);
                const initialGrades = {};
                cachedData.forEach(submission => {
                    initialGrades[submission.user_id] = {
                        score: submission.score ?? "",
                        comment: submission.comment ?? ""
                    };
                });
                setGrades(initialGrades);
                setLoading(false);
                return;
            }

            // Fetch data if not cached
            const formData = new FormData();
            formData.append("assignment_id", assignmentId);

            try {
                let response = await fetch("/cms/assignments/submissions", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                });

                const data = await response.json();
                setSubmissions(data);

                // Initialize grades
                const initialGrades = {};
                data.forEach(submission => {
                    initialGrades[submission.user_id] = {
                        score: submission.score ?? "",
                        comment: submission.comment ?? ""
                    };
                });
                setGrades(initialGrades);

                // Cache the data
                await cacheApiResponse(cacheKey, data);
            } catch {
                setErrorMessage("Error loading assignment submissions. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user, assignmentId]);

    const handleUpdateGrades = async (userId, field, value) => {
        setGrades(prev => ({
            ...prev,
            [userId]: { ...prev[userId], [field]: value }
        }));
    }

    const handleSubmitGrades = async (mail_id) => {
        try {
            const userGrade = grades[mail_id];

            const score = userGrade?.score !== undefined ? userGrade.score.toString() : "0"; // Ensure it's a string
            const comment = userGrade?.comment ?? ""; // Default to an empty string if undefined

            const formData = new FormData();
            formData.append("assignment_id", assignmentId);
            formData.append("user_id", mail_id);
            formData.append("grade", score);
            formData.append("comment", comment);

            let response = await fetch("/cms/assignments/saveGrade", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData
            });

            if (response.ok) {
                alert("Grades submitted successfully!");
            } else {
                throw new Error("Failed to submit grades.");
            }
        } catch {
            alert("Error submitting grades. Please try again.");
        }
    };

    const extractDateTime = (filePath) => {
        const regex = /(\d{2})-(\d{2})-(\d{4})_(\d{2})_(\d{2})_(\d{2})/;
        const match = filePath.match(regex);

        if (match) {
            const [, month, day, year, hours, minutes, seconds] = match;
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        return "Date not found";
    };

    const isLateSubmission = (submittedOn: string, deadline: string) => {
        const submissionDate = new Date(submittedOn);
        const deadlineDate = new Date(deadline);

        return submissionDate > deadlineDate; // Returns true if submission is after deadline
    };

    Modal.setAppElement('.App')
    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker semi-transparent background
            backdropFilter: 'blur(8px)', // Adds a blur effect to the background
            zIndex: 1000 // Ensures the modal is above everything
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            borderRadius: '10px',
            padding: '20px',
            background: 'white', // Ensures the modal itself has a solid background
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
        },
    };
    
    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }
    return (
        <div className="container" style={{ marginTop: '3px', width: '90%' }}>
            <div className="title-name">{gradedStatus === 'graded' ? "Graded" : "Ungraded"} Submissions</div>
            {loading ? spinnerIcon() : submissions.length === 0 ? (
                <p>No submissions found.</p>
            ) : <div className="submission-list">
                {submissions.filter(submission =>
                    gradedStatus === 'graded' ? submission.score !== null
                        : gradedStatus === 'not_graded' ? submission.score === null
                            : true // If gradedStatus is null, show all submissions
                ).map((submission) => (
                    <div key={submission.user_id} className="studentBox">
                        <div className="studentLabel" style={{ backgroundColor: expandedUser === submission.user_id ? "aliceblue" : "white" }} onClick={() => setExpandedUser(expandedUser === submission.user_id ? null : submission.user_id)}>
                            <div style={{ width: '78vw' }}> {submission.user_id} </div>
                            <span>
                                {expandedUser === submission.user_id ? "▲" : "▼"}
                            </span>
                        </div>
                        {expandedUser === submission.user_id && (
                            <div className="submission-details">
                                {/* Submitted Files Section */}
                                <div className="files-section">
                                    {submission.submitted_files.map((file, idx) => (
                                        <div key={idx} className="file-container">
                                            <span className="file-name" onClick={() => { setFilePreviewName(file.name); previewFileWrapper(firebase, file.path, setFilePreview); }}>{file.name}</span>
                                            <Modal
                                                isOpen={filePreviewName?.toLowerCase() === file.name.toLowerCase()}
                                                onRequestClose={() => { setFilePreviewName(null); setFilePreview(null); }}
                                                style={customStyles}
                                            >
                                                <button
                                                    onClick={() => { setFilePreviewName(null); setFilePreview(null); }}
                                                    style={{
                                                        position: "absolute",
                                                        top: "10px",
                                                        right: "15px",
                                                        background: "transparent",
                                                        border: "none",
                                                        fontSize: "20px",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    ✖
                                                </button>

                                                {/* Convert file name to lowercase and check file type */}
                                                {/\.(jpg|jpeg|png)$/i.test(filePreviewName) ? (
                                                    <img
                                                        src={filePreview}
                                                        alt="Image Preview"
                                                        style={{ maxWidth: "100%", height: "auto", marginTop: "10px" }}
                                                        onError={(e) => (e.currentTarget.style.display = "none")}
                                                    />
                                                ) : /\.pdf$/i.test(filePreviewName) ? (
                                                    <iframe
                                                        src={`https://docs.google.com/gview?url=${encodeURIComponent(filePreview)}&embedded=true`}
                                                        style={{ width: "600px", height: "450px", border: "none", margin: '2%' }}
                                                        title="PDF Preview"
                                                    />

                                                ) : /\.(doc|docx)$/i.test(filePreviewName) ? (
                                                    <iframe
                                                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(filePreview)}`}
                                                        style={{ width: "600px", height: "450px", border: "none", margin: '2%' }}
                                                        title="DOC Preview"
                                                    />
                                                ) : (
                                                    <p>File preview not available</p>
                                                )}
                                            </Modal>


                                            <u className="download-link" onClick={() => onDownloadFiles([file], downloadRef, firebase)}>
                                                <FaDownload className="download-icon" />
                                            </u>
                                            <p className="submitted-date"><b>Submitted On:</b> {extractDateTime(file.path)}</p>
                                            {isLateSubmission(extractDateTime(file.path), deadline) && (
                                                <span style={{ color: "red", fontWeight: "bold" }}> (Late Submission)</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Grading Section */}
                                <div className="grading-section">
                                    <div className="input-group" style={{ width: '25%' }}>
                                        <label className="grading-label">Score: (Out of {submission.max_grade})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={submission.max_grade}
                                            className="score-input"
                                            value={grades[submission.user_id]?.score || ""}
                                            onChange={(e) => handleUpdateGrades(submission.user_id, "score", e.target.value)}
                                        />
                                    </div>

                                    <div className="input-group">
                                        <label className="grading-label">Comment:</label>
                                        <input
                                            type="text"
                                            className="comment-input"
                                            value={grades[submission.user_id]?.comment || ""}
                                            onChange={(e) => handleUpdateGrades(submission.user_id, "comment", e.target.value)}
                                        />
                                    </div>
                                    <button
                                        className="submit-button"
                                        onClick={() => { handleSubmitGrades(submission.user_id) }}
                                        style={{ marginTop: "20px" }}>
                                        Save Grade
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                )
                )}
            </div>}
            <a className="hide" ref={downloadRef} target="_blank">Hidden Download Link</a>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(ViewAndGradeAssignment as any);