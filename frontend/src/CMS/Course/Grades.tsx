import React from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";
import Modal from 'react-modal'
import { Visualization } from './Visualization';

function Grades() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [assignmentListString, setAssignmentListString] = useState('')
    const [quizList, setQuizList] = useState('')
    const [otherListString, setOtherListString] = useState('')
    const [veri, setVeri] = useState(true)

    const [showModal, setShowModal] = useState(false)

    const [name, setName] = useState('')
    const [maxGrade, setMaxGrade] = useState('')
    const [weight, setWeight] = useState(0.0)
    const [openItems, setOpenItems] = useState({ assignment: {}, quiz: {}, other: {} });

    // Loading states
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingOthers, setLoadingOthers] = useState(true);

    // Error states
    const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
    const [errorQuizzes, setErrorQuizzes] = useState<string | null>(null);
    const [errorOthers, setErrorOthers] = useState<string | null>(null);

    const toggleDropdown = (category, id) => {
        setOpenItems((prev) => ({
            ...prev,
            assignment: {},
            quiz: {},
            other: {},
            [category]: {
                [id]: !prev[category][id]
            }
        }));
    };

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            // Fetch assignments
            try {
                const formData = new FormData();
                formData.append("user", user.email);
                formData.append("course", courseId);
                const response = await fetch("/cms/assignment_clusters", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData,
                });
                const data = await response.json();
                setAssignmentListString(JSON.stringify(data));
                setErrorAssignments(null);
            } catch {
                setErrorAssignments("Error loading assignments.");
            } finally {
                setLoadingAssignments(false);
            }

            // Fetch quizzes
            try {
                const formData = new FormData();
                formData.append("user", user.email);
                formData.append("course", courseId);
                const response = await fetch("/cms/quiz_clusters", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData,
                });
                const data = await response.json();
                setQuizList(JSON.stringify(data));
                setErrorQuizzes(null);
            } catch {
                setErrorQuizzes("Error loading quizzes.");
            } finally {
                setLoadingQuizzes(false);
            }

            // Fetch other items
            try {
                const formData = new FormData();
                formData.append("user", user.email);
                formData.append("course", courseId);
                const response = await fetch("/cms/other_clusters", {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData,
                });
                const data = await response.json();
                setOtherListString(JSON.stringify(data));
                setErrorOthers(null);
            } catch {
                setErrorOthers("Error loading other items.");
            } finally {
                setLoadingOthers(false);
            }
        }

        fetchData();
    }, [user, courseId, veri]);

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

    async function onCreate(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', name);
        formData.append('max_grade', maxGrade);
        formData.append('weight', weight.toString())
        const newDate = new Date()
        formData.append('created_at', newDate.getUTCFullYear() + '-' + (Number(newDate.getUTCMonth()) + 1) + '-' + newDate.getUTCDate() + ' '
            + newDate.getUTCHours() + ':' + newDate.getUTCMinutes() + ':' + newDate.getUTCSeconds())
        formData.append('course', courseId);
        try {
            await fetch('/cms/grades/gradable/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        } catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }

        setShowModal(false)
        resetStates()
        window.location.reload()
    }

    function resetStates() {
        setName('')
        setMaxGrade('')
    }

    // if (!veri) {
    //     return <div>Authentication Error, please do not use URL for direct access.</div>
    // }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view" style={{ display: 'inline-grid', height: 'fit-content', margin: "5%" }}>
                    <>
                        <div className="section assignments-section" style={{width: "auto"}}>
                            <h3 className="section-title">Assignments</h3>
                            {loadingAssignments ? (
                                <div className="gradeSpinner"></div>
                            ) : errorAssignments ? (
                                <p className="error-message">{errorAssignments}</p>
                            ) : assignmentListString ? (
                                JSON.parse(assignmentListString).map((x) => (
                                    <div key={x.id} className="list-item" style={{ width: '100%', float: 'left' }}>
                                        <div
                                            className={`section-heading ${openItems["assignment"][x.id] ? 'open' : ''}`}
                                            onClick={() => toggleDropdown("assignment", x.id)}
                                            role="button"
                                            aria-expanded={!!openItems["assignment"][x.id]}
                                            tabIndex={0}
                                            style={{ width: openItems["assignment"][x.id] ? '30%' : '100%' }}
                                        >
                                            <span>{x.name}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="toggle-icon"
                                            >
                                                {openItems["assignment"][x.id] ? (
                                                    <path d="M7 14l5-5 5 5H7z" />
                                                ) : (
                                                    <path d="M7 10l5 5 5-5H7z" />
                                                )}
                                            </svg>
                                        </div>
                                        {openItems["assignment"][x.id] && (
                                            <div className="expanded-content" style={{ 'width': '70%' }}>
                                                <Visualization category={x} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No assignments available.</p>
                            )}
                        </div>

                        {/* Quizzes Section */}
                        <div className="section quizzes-section" style={{width: "auto"}}>
                            <h3 className="section-title">Quizzes</h3>
                            {loadingQuizzes ? (
                                <div className="gradeSpinner"></div>
                            ) : errorQuizzes ? (
                                <p className="error-message">{errorQuizzes}</p>
                            ) : quizList ? (
                                JSON.parse(quizList).map((x) => (
                                    <div key={x.id} className="list-item" style={{ width: '100%', float: 'left' }}>
                                        <div
                                            className={`section-heading ${openItems["quiz"][x.id] ? 'open' : ''}`}
                                            onClick={() => toggleDropdown("quiz", x.id)}
                                            role="button"
                                            aria-expanded={!!openItems["quiz"][x.id]}
                                            tabIndex={0}
                                            style={{ width: openItems["quiz"][x.id] ? '30%' : '100%' }}
                                        >
                                            <span>{x.name}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="toggle-icon"
                                            >
                                                {openItems["quiz"][x.id] ? (
                                                    <path d="M7 14l5-5 5 5H7z" />
                                                ) : (
                                                    <path d="M7 10l5 5 5-5H7z" />
                                                )}
                                            </svg>
                                        </div>
                                        {openItems["quiz"][x.id] && (
                                            <div className="expanded-content" style={{ 'width': '70%' }}>
                                                <Visualization category={x} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No quizzes available.</p>
                            )}
                        </div>

                        {/* Other Items Section */}
                        <div className="section others-section" style={{width: "auto"}}>
                            <h3 className="section-title">Other Items</h3>
                            {loadingOthers ? (
                                <div className="gradeSpinner"></div>
                            ) : errorOthers ? (
                                <p className="error-message">{errorOthers}</p>
                            ) : otherListString ? (
                                JSON.parse(otherListString).map((x) => (
                                    <div key={x.id} className="list-item" style={{ width: '100%', float: 'left' }}>
                                        <div
                                            className={`section-heading ${openItems["other"][x.id] ? 'open' : ''}`}
                                            onClick={() => toggleDropdown("other", x.id)}
                                            role="button"
                                            aria-expanded={!!openItems["other"][x.id]}
                                            tabIndex={0}
                                            style={{ width: openItems["other"][x.id] ? '30%' : '100%' }}
                                        >
                                            <span>{x.name}</span>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="currentColor"
                                                className="toggle-icon"
                                            >
                                                {openItems["other"][x.id] ? (
                                                    <path d="M7 14l5-5 5 5H7z" />
                                                ) : (
                                                    <path d="M7 10l5 5 5-5H7z" />
                                                )}
                                            </svg>
                                        </div>
                                        {openItems["other"][x.id] && (
                                            <div className="expanded-content" style={{ 'width': '70%' }}>
                                                <Visualization category={x} />
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>No other items available.</p>
                            )}
                        </div>


                    </>
                </div>
                <Modal
                    isOpen={showModal}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={() => { setShowModal(false); resetStates() }}
                    contentLabel="Example Modal"
                    style={customStyles}
                >
                    <div className="title">Create a gradable item</div>
                    <form onSubmit={onCreate}>
                        <div><b>Item name:</b> <input onChange={(e) => setName(e.target.value)} required maxLength={30}></input></div>
                        <div><b>Max Grade:</b> <input type='number' onChange={(e) => setMaxGrade(e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                        <div><b>Weight:</b> <input type="number" style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                        <div><button type='submit' className='btn waves-light globalbtn'>Create</button></div>
                        <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                    </form>
                </Modal>

                <div className="float-right">
                    <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Create a gradable item</button>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Grades as any) as any;