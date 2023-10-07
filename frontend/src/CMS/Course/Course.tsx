import React from "react"
import { useState, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./Sidebar";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";
// import { useHistory } from "react-router-dom";

function Course() {
    const user = useContext(AuthUserContext) as any

    // const history=useHistory()

    const courseId = useParams()['id']
    const [name, setName] = useState('')
    const [language, setLanguage] = useState('')
    const [credits, setCredits] = useState('')
    const [available, setAvailable] = useState('loading')
    const [schedule, setSchedule] = useState('')

    const [newName, setNewName] = useState('')
    const [newLanguage, setNewLanguage] = useState('')
    const [newCredits, setNewCredits] = useState('')
    const [newAvailable, setNewAvailable] = useState('loading')
    const [newSchedule, setNewSchedule] = useState('')

    const [showUpdateModal, setShowUpdateModal] = useState(false)
    // const [showDeleteModal, setShowDeleteModal] = useState(false)

    const [veri, setVeri] = useState(true)

    function resetStates() {
        setNewName(name)
        setNewLanguage(language)
        setNewCredits(credits)
        setNewAvailable(available)
        setNewSchedule(schedule)
    }

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/cms/courses/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => {
                    setName(x.name)
                    setNewName(x.name)
                    setLanguage(x.language)
                    setNewLanguage(x.language)
                    setCredits(x.credits)
                    setNewCredits(x.credits)
                    setAvailable(x.available?'1':'0')
                    setNewAvailable(x.available?'1':'0')
                    setSchedule(x.schedule)
                    setNewSchedule(x.schedule)
                })
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    },[])
    
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

    async function onUpdate() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('id', courseId);
        formData.append('name', newName);
        formData.append('language', newLanguage);
        formData.append('credits', newCredits);
        formData.append('available', newAvailable);
        formData.append('schedule', newSchedule);

        try {
            await fetch('/cms/courses/update', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }

        setShowUpdateModal(false)
        resetStates()
        window.location.reload()
    }

    // async function onDelete() {
    //     const formData = new FormData();
    //     formData.append('user', user.email);
    //     formData.append('id', courseId);

    //     try {
    //         await fetch('/cms/courses/delete', {
    //             method: "POST",
    //             headers: {
    //                 Accept: "application/json"
    //             },
    //             body: formData
    //         })
    //     }
    //     catch (error) {
    //         console.log("Fetch failed, see if it is 403 in error console")
    //     }

    //     setShowDeleteModal(false)
    //     history.push('/content-management')
    // }
    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="main-view">
                    <div className="info-list">
                        <div><b>Course information: </b></div>
                        <div>
                            Course number: {courseId}
                        </div>
                        <div>
                            Course name: {name}
                        </div>
                        <div>
                            Language: {language}
                        </div>
                        <div>
                            Credits: {credits}
                        </div>
                        <div>
                            Available: {available==='loading'?'Loading...':(available==='1'?'Yes':'No')}
                        </div>
                        <div>
                            Schedule: {schedule}
                        </div>
                    </div>

                    <div className="float-right">
                        <button onClick={() => setShowUpdateModal(true)}>Update course</button>
                        {/* <button onClick={() => setShowDeleteModal(true)}>Delete course</button> */}
                    </div>

                    <div>
                        <div>
                            <Modal
                                isOpen={showUpdateModal}
                                onRequestClose={() => { setShowUpdateModal(false); resetStates() }}
                                style={customStyles}
                            >
                                Update a course
                                <form>
                                    <div>Course number: (id) {courseId}</div>
                                    <div>Course name: <input value={newName} onChange={(e) => setNewName(e.target.value)}></input></div>
                                    <div>Language: <input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)}></input></div>
                                    <div>Credits: <input value={newCredits} type='number' onChange={(e) => setNewCredits(e.target.value)}></input></div>
                                    <div>Available: <input type='checkbox' checked={available==='1'?true:false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position':'unset' }} onChange={(e) => setNewAvailable(e.target.checked?'1':'0')}></input></div>
                                    <div>Schedule: <input value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)}></input></div>
                                </form>
                                <div><button onClick={onUpdate}>Update</button></div>
                                <button onClick={() => { setShowUpdateModal(false); resetStates() }}>Cancel</button>
                            </Modal>
                        </div>
                        {/* <div>
                            <Modal
                                isOpen={showDeleteModal}
                                style={customStyles}
                            >
                                Delete the course?
                                <div><button onClick={onDelete}>Delete</button></div>
                                <button onClick={()=>setShowDeleteModal(false)}>Cancel</button>
                            </Modal>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Course as any) as any;