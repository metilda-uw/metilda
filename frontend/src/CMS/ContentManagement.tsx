import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import "./ContentManagement.scss"
import { Link } from "react-router-dom";
import Header from "../Components/header/Header";
import { withAuthorization } from "../Session";
import { AuthUserContext } from "../Session";
import Modal from 'react-modal'

function ContentManagement() {
    const [courseListString, setCourseListString] = useState('')
    const courseList=useMemo(()=>courseListString.split(';'),[courseListString])
    const user = (useContext(AuthUserContext) as any)
    const [showModal, setShowModal] = useState(false)
    
    const [newId, setNewId] = useState('')
    const [newName, setNewName] = useState('')
    const [newLanguage, setNewLanguage] = useState('')
    const [newCredits, setNewCredits] = useState('')
    const [newAvailable, setNewAvailable] = useState('1')
    const [newSchedule, setNewSchedule] = useState('')

    useEffect(() => {
        async function fetchData() {
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
                .then(x => x.map(obj => obj[0]+','+obj[1]))
                .then(x => x.join(';'))
                .then(setCourseListString);
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [courseList])

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

    async function onSubmit() {
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
        setNewAvailable('on')
        setNewSchedule('')
    }

    return (
        <div>
            <Header></Header>
            <div>
                <Modal
                    isOpen={showModal}
                    // onAfterOpen={afterOpenModal}
                    onRequestClose={()=>{ setShowModal(false); resetStates() }}
                    contentLabel="Example Modal"
                    style={customStyles}
                >
                    Create a course
                    <form>
                        <div>Course number: (id) <input onChange={(e) => setNewId(e.target.value)}></input></div>
                        <div>Course name: <input onChange={(e) => setNewName(e.target.value)}></input></div>
                        <div>Language: <input onChange={(e) => setNewLanguage(e.target.value)}></input></div>
                        <div>Credits: <input type='number' onChange={(e) => setNewCredits(e.target.value)}></input></div>
                        <div>Available: <input type='checkbox' checked={!!newAvailable} style={{ 'opacity': 100, 'pointerEvents': 'auto' }}
                            onChange={(e) => setNewAvailable(e.target.checked ? '1' : '')}></input></div>
                        <div>Schedule: <input onChange={(e) => setNewSchedule(e.target.value)}></input></div>
                    </form>
                    <div><button onClick={onSubmit}>Create</button></div>
                    <button onClick={()=>{ setShowModal(false); resetStates() }}>Cancel</button>
                </Modal>
            </div>
                <button onClick={() => setShowModal(true)}>Create a course</button>
            <div className="course-list">
                <div>My courses:</div>
                    {courseList.map(x => 
                        <div key={x}><Link key={x} to={'/content-management/course/'+x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                    )}
            </div>

        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(ContentManagement as any) as any;