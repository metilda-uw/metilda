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
import Modal from 'react-modal'
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";


function Announcement() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()['id'];
    const [assignments, setAssignments] = useState<any[]>([]);
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false)
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());


    const fetchAnnouncements = async () => {
        const cacheKey = `announcement1_${courseId}`;
        const formData = new FormData();
        formData.append('user_id', 't_cx@gmail.com');  // user_id as part of FormData
        formData.append('course_id', courseId); // course_id as part of FormData

        try {
            const response = await fetch('/cms/announcements/getAll', {
                method: "POST",  // Use POST to send FormData
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });
            const body = await response.json();

            if (!response.ok) {
                setError(body?.error || "Failed to fetch announcements.");
            } else {
                setAnnouncements(body?.announcements || []);
            }
        } catch (err) {
            setError("An error occurred while fetching announcements.");
            console.error("Error fetching announcements:", err);
        } finally {
            setLoading(false); // End loading state once the fetch completes
        }
    };

    useEffect(() => {
        setLoading(true); // Start loading before making the request
        fetchAnnouncements();
    }, [user?.email, courseId]);

    async function createAnnouncement() {
        const rawContent = convertToRaw(editorState.getCurrentContent()); // Convert to raw JSON
        const htmlContent = draftToHtml(rawContent);

        const formData = new FormData();
        formData.append('user', 't_cx@gmail.com');
        formData.append('course_id', courseId);
        formData.append('title', title);
        formData.append('content', htmlContent);
        formData.append('created_at', new Date().toISOString());

        try {
            const response = await fetch('/cms/announcements/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
            const body = await response.json();
            if (!body.toString().includes("error")) {
                setError(null);
                window.alert("Announcement created successfully!");
                setShowModal(false);

                fetchAnnouncements();

                const formDataForMailing = new FormData();
                formDataForMailing.append('announcement_id', body?.announcement_id);
                await fetch('/cms/announcements/send_notifications', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formDataForMailing,
                });

            } else {
                const errorData = await response.json();
                window.alert(`Error: ${errorData?.error || "Something went wrong"}`);
                setError(errorData?.error || "Something went wrong");
            }
        }
        catch (err) {
            window.alert("Error creating announcement");
        }
    }
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
            width: '70%',
            height: '80%',
            borderRadius: '10px',
            padding: '20px',
            background: 'white',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)'
        },
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
                    <div className="info-list">
                        <div className="assignments-header">
                            <h2 className="title-name">Announcements</h2>
                            <div className="create-assignment-button" onClick={() => setShowModal(true)}>
                                + Create an Announcement
                            </div>
                        </div>

                        {loading ? (
                            <div className="loading-container">{spinnerIcon()}</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            <div>
                                {announcements.length > 0 ? (
                                    announcements.map((announcement) => (
                                        <div key={announcement.id} className="list-item" style={{ cursor: "pointer" }} onClick={() => setExpandedRow(expandedRow === announcement.id ? null : announcement.id)}>
                                            <div className="announcement-header">
                                                <div className="announcement-subject">{announcement.title}</div>
                                                <span>
                                                    {expandedRow === announcement.id ? "▲" : "▼"}
                                                </span>
                                            </div>
                                            <div className="announcement-header">
                                                <div className="announcement-content"
                                                    style={{ width: '75%' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: expandedRow === announcement.id
                                                            ? announcement.message
                                                            : announcement.message.length > 180
                                                                ? `${announcement.message.substring(0, 180)}...`
                                                                : announcement.message
                                                    }}
                                                />

                                                <span className="announcement-date">{new Date(announcement.created_at).toLocaleString()}</span>
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div>No announcements found.</div>
                                )}
                            </div>
                        )}
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="announcement-title-name">Create an Announcement</div>
                            <div style={{ display: 'flex', paddingBottom: '3%' }}><div style={{ paddingRight: '2%' }}>Subject:</div> <input onChange={(e) => setTitle(e.target.value)} required maxLength={30} style={{ height: '1.5rem' }}></input></div>
                            {/* <div><b>Content:</b> <input onChange={(e) => setContent(e.target.value)} maxLength={200}></input></div>
                             */}
                            <Editor
                                editorState={editorState}
                                onEditorStateChange={setEditorState}
                                wrapperClassName="editor-wrapper"
                                editorClassName="editor-content"
                                toolbarClassName="editor-toolbar"
                                placeholder="Type your announcement here.."
                                stripPastedStyles={true}
                            >
                            </Editor>
                            <div style={{ display: 'inline-flex', paddingTop: '4%' }}>
                                <div className='create-assignment-button' style={{ marginRight: '12px', width: 'fit-content' }} onClick={createAnnouncement}>Send</div>
                                <div className='create-assignment-button' style={{ width: 'fit-content' }} onClick={() => { setShowModal(false); }}>Cancel</div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Announcement as any) as any;