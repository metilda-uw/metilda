import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import "./ContentManagement.scss"
import { Link } from "react-router-dom";
import Header from "../Components/header/Header";
import { withAuthorization } from "../Session";
import { AuthUserContext } from "../Session";
import Modal from 'react-modal'
import { verifyTeacher } from "./AuthUtils";
import { spinnerIcon } from "../Utils/SpinnerIcon";

function ContentManagement() {
    const [courseListString, setCourseListString] = useState('')
    const courseList = useMemo(() => courseListString.split(';'), [courseListString])
    const user = (useContext(AuthUserContext) as any)
    const [showModal, setShowModal] = useState(false)
    
    const [newId, setNewId] = useState('')
    const [newName, setNewName] = useState('')
    const [newLanguage, setNewLanguage] = useState('')
    const [newCredits, setNewCredits] = useState('')
    const [newAvailable, setNewAvailable] = useState('1')
    const [newSchedule, setNewSchedule] = useState('')
    const [veri, setVeri] = useState(true)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            await verifyTeacher(user.email, setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            try {
                await fetch('/cms/courses', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                    .then(x => x.map(obj => obj[0] + ',' + obj[1]))
                    .then(x => x.join(';'))
                    .then(setCourseListString);
                    setError(null);
            }
            catch (error) {
                setError("Failed to load courses. Please try again.");
            }
            finally {
                setLoading(false);
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

    async function onSubmit(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('id', newId);
        formData.append('name', newName);
        formData.append('language', newLanguage);
        formData.append('credits', newCredits);
        formData.append('available', newAvailable);
        formData.append('schedule', newSchedule);

        try {
            await fetch('/cms/courses/create', {
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

        setShowModal(false)
        resetStates()
        window.location.reload()
    }

    function resetStates() {
        setNewId('')
        setNewName('')
        setNewLanguage('')
        setNewCredits('')
        setNewAvailable('1')
        setNewSchedule('')
    }

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }

    return (
        <div>
            <Header></Header>
            <div>
                <Modal
                    isOpen={showModal}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={() => { setShowModal(false); resetStates() }}
                    contentLabel="Example Modal"
                    style={customStyles}
                >
                    <div className="title">Create a course</div>
                    <form onSubmit={onSubmit}>
                        <div><b>Course number: (id)</b> <input type="number" onChange={(e) => setNewId(e.target.value)} required maxLength={10}></input></div>
                        <div><b>Course name:</b> <input onChange={(e) => setNewName(e.target.value)} required maxLength={30}></input></div>
                        <div><b>Language:</b> <input onChange={(e) => setNewLanguage(e.target.value)} required maxLength={20}></input></div>
                        <div><b>Credits:</b> <input type='number' onChange={(e) => setNewCredits(e.target.value)} required min={0} max={20}></input></div>
                        <div><b>Available:</b> <input type='checkbox' checked={newAvailable === '1' ? true : false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position': 'unset' }}
                            onChange={(e) => setNewAvailable(e.target.checked ? '1' : '0')}></input></div>
                        <div><b>Schedule:</b> <input onChange={(e) => setNewSchedule(e.target.value)} required min={0} max={50}></input></div>
                        <div><button type='submit' className='btn waves-light globalbtn' >Create</button></div>
                        <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                    </form>
                </Modal>
            </div>
            <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Create a course</button>
            <div className="course-list">
                <div className="title">My Courses</div>
                {loading ? (
                    <div>{spinnerIcon()} </div>
                ) : error ? (
                    <div className="error">{error}</div>
                ) : (
                    courseList.map(x =>
                        <div className="list-item" key={x}><Link className="content-link" to={'/content-management/course/' + x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                    )
                )}
            </div>
        </div>
    )
}
const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(ContentManagement as any) as any;