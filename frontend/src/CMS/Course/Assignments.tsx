import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss";
import { verifyTeacherCourse } from "../AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function Assignments() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()['id'];
    const [assignments, setAssignments] = useState<any[]>([]);
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const cacheKey = `assignments_${courseId}`;
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);

            try {
                const response = await fetch('/cms/assignments', {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                });
                const data = await response.json();
                data.sort((b, a) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
                setAssignments(data);
                setError(null);
            } catch (error) {
                console.log("Fetch failed, check for 403 errors in the console.");
                setError("Error loading data. Please try again.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

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
                    <div className="info-list">
                        <div className="assignments-header">
                            <h2 className="title-name">Assignments</h2>
                            <Link className="create-assignment-button" to={`/content-management/course/${courseId}/assignments/create`}>
                                + Create an Assignment
                            </Link>
                        </div>

                        {loading ? (
                            <div className="loading-container">{spinnerIcon()}</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <div className="assignment-list">
                                {assignments.length > 0 ? (
                                    assignments.map((assignment) => (
                                        <div className="list-item">
                                            <Link key={assignment.assignment} className="content-link list-item-title" to={`/content-management/course/${courseId}/assignment/${assignment.assignment}`}>
                                                {assignment.name}
                                            </Link>
                                            <div className={`deadline ${new Date(assignment.deadline) < new Date() ? "past-deadline" : "upcoming-deadline"}`}>
                                                    <b>Deadline:</b> {new Date(assignment.deadline).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-assignments">No assignments available.</p>
                                )}
                            </div>
                        )}
                    </div>



                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Assignments as any) as any;