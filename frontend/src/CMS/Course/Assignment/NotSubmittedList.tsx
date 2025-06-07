import React, { useContext, useEffect, useState } from "react";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss";
import { verifyTeacherCourse } from "../../AuthUtils";
import { spinnerIcon } from "../../../Utils/SpinnerIcon";

export function NotSubmittedList() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()["id"];
    const assignmentId = useParams()["assignment_id"];
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [veri, setVeri] = useState(true);
    const [notSubmittedStudents, setNotSubmittedStudents] = useState<string[]>([]);

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, (isValid) => {
                if (!isValid) return;
            });

            // Fetch data if not cached
            const formData = new FormData();
            formData.append("assignment_id", assignmentId);
            formData.append("course_id", courseId);

            try {
                let response = await fetch("/cms/assignments/not_submitted_students", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                });

                const data = await response.json();
                setNotSubmittedStudents(data.not_submitted_students);
            } catch {
                setErrorMessage("Error loading students who haven't submitted. Please try again later.");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchData();
        }
    }, [user, assignmentId]);

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div className="container" style={{ margin: "2%", width: "100%" }}>
            <div className="title-name" style={{textAlign: "center"}}>Not Submitted Students</div>
            {loading ? (
                spinnerIcon()
            ) : errorMessage ? (
                <div className="error-message">{errorMessage}</div>
            ) : (
                <ul className="not-submitted-list">
                    {notSubmittedStudents.length > 0 ? (
                        notSubmittedStudents.map((email, index) => (
                            <div key={index} className="studentBox" style={{ width: '70%' }}>
                                <div className="studentLabel" style={{cursor: "auto"}}>
                                    <div style={{ width: '78vw' }}> {email} </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No students are missing submissions.</div>
                    )}
                </ul>
            )}
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(NotSubmittedList as any);