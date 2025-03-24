import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss";
import { verifyStudentCourse } from "../../CMS/AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function StudentNotification() {
    const courseId = useParams()["id"];
    const [notificationsList, setNotificationsList] = useState<any[]>([]);
    const user = useContext(AuthUserContext) as any;
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [setRead, markSetRead] = useState(false);

    async function fetchData() {
        await verifyStudentCourse(user.email, courseId, setVeri);
        if (!veri) return;
        const formData = new FormData();
        formData.append('student_mail_id', 'amulyahn6@gmail.com');
        formData.append("course_id", courseId);

        try {
            const response = await fetch("/student-view/notifications/getAll", {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });

            const data = await response.json();

            if (data.messages) {
                setNotificationsList(data.messages); // Store as JSON
            } else {
                setError("No notifications found.");
            }

        } catch (error) {
            setError("Error loading notifications");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function markRead(notificationId: any) {
        try {
            const formData = new FormData();
            formData.append("id", notificationId);

            const response = await fetch("/student-view/notifications/markAsRead", {
                method: "POST",
                body: formData,
            });
            const body = await response.json();
            if (body.toString().includes("error")) {
                console.error("Request failed", error);
            }
            else {
                fetchData();
                markSetRead(true)
            }
        } catch (error) {
            console.error("Request failed", error);
        }
    }

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
                        <div className="title-name">Notifications</div>
                        {loading ? (
                            <div className="spinner-container">{spinnerIcon()}</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : notificationsList.length > 0 ? (
                            <div>
                                {notificationsList.map((notification) => (
                                    <div className="list-item" key={notification.announcement_id}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                            setExpandedRow(expandedRow === notification.id ? null : notification.id);
                                            notification.is_read ? null : markRead(notification.id)
                                        }}>
                                        <div>
                                            <div className="announcement-header">
                                                <div className="announcement-subject">
                                                    {notification.title}
                                                </div>

                                                <span>
                                                    {expandedRow === notification.id ? "▲" : "▼"}
                                                </span>
                                            </div>

                                            <div className="announcement-header">
                                                <div className="announcement-content"
                                                    style={{ width: '75%', paddingTop: '1%', fontWeight: notification.is_read ? '400' : 'bold' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: expandedRow === notification.id
                                                            ? notification.message
                                                            : notification.message.length > 180
                                                                ? notification.message.substring(0, 180) + "..."
                                                                : notification.message
                                                    }}
                                                />


                                                <span className="announcement-date">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentNotification as any);