import React, { useState, useContext, useEffect } from "react";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss";
import { verifyStudentCourse } from "../../CMS/AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function StudentCourse() {
    const user = useContext(AuthUserContext) as any;

    const courseId = useParams()['id'];
    const [name, setName] = useState('');
    const [language, setLanguage] = useState('');
    const [credits, setCredits] = useState('');
    const [schedule, setSchedule] = useState('');
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true); // Track loading state
    const [error, setError] = useState(''); // Track error messages

    useEffect(() => {
        async function fetchData() {
            try {
                await verifyStudentCourse(user.email, courseId, setVeri);
                if (!veri) {
                    setError("Authentication Error: You are not authorized to access this course.");
                    setLoading(false);
                    return;
                }

                const formData = new FormData();
                formData.append('user', user.email);
                formData.append('course', courseId);

                const response = await fetch('/student-view/courses/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch course data. Please try again later.");
                }

                const courseData = await response.json();
                setName(courseData.name);
                setLanguage(courseData.language);
                setCredits(courseData.credits);
                setSchedule(courseData.schedule);
                setError(null);
            } catch (err: any) {
                setError("Failed loading courses.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user.email, courseId, veri]);

    if (!veri) {
        return <div>Authentication Error: Please do not use URLs for direct access.</div>;
    }

    return (
        <div>
            <Header />
            <div className="main-layout">
                <Sidebar courseId={courseId} />
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Course Information:</div>
                        {loading ? (
                            <div className="spinner-container">
                                {spinnerIcon()}
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <>
                                <div>
                                    <b>Course number:</b> {courseId}
                                </div>
                                <div>
                                    <b>Course name:</b> {name}
                                </div>
                                <div>
                                    <b>Language:</b> {language}
                                </div>
                                <div>
                                    <b>Credits:</b> {credits}
                                </div>
                                <div>
                                    <b>Schedule:</b> {schedule}
                                </div>
                            </>
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentCourse as any) as any;