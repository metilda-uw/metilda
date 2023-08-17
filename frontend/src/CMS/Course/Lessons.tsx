import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import "./GeneralStyles.scss"
import Sidebar from "./Sidebar";

function Lessons() {
    const courseId=useParams()['id']
    const [lessonListString, setLessonListString] = useState('')
    const lessonList=useMemo(()=>lessonListString.split(';'),[lessonListString])
    const user = (useContext(AuthUserContext) as any)
    const [showModal, setShowModal] = useState(false)
    
    const [newName, setNewName] = useState('')

    useEffect(() => {
        async function fetchData() {
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/cms/lessons', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0]+','+obj[1]))
                .then(x => x.join(';'))
                .then(setLessonListString);
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [user.email,courseId,lessonList])

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
        formData.append('name', newName);
        formData.append('course', courseId);

        try {
            await fetch('/cms/lessons/create', {
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
        setNewName('')
    }

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">

                    <div className="info-list">
                        <div>My lessons:</div>
                        {lessonList.map(x => 
                            <div key={x}><Link key={x} to={'/content-management/course/'+courseId+'/lesson/'+x.split(',')[0]}>{x.split(',')[1]}</Link></div>
                        )}
                    </div>

                    <div className="float-right">
                        <button onClick={() => setShowModal(true)}>Create a lesson</button>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            Create a lesson
                            <form>
                                <div>Lesson name: <input onChange={(e) => setNewName(e.target.value)}></input></div>
                            </form>
                            <div><button onClick={onSubmit}>Create</button></div>
                            <button onClick={() => { setShowModal(false); resetStates() }}>Cancel</button>
                        </Modal>
                    </div>

                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Lessons as any) as any;