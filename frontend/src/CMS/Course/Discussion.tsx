import React from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import "./Discussion/Discussion.scss"
import { verifyTeacherCourse } from "../AuthUtils";

function Discussion() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']

    const [topicListString, setTopicListString] = useState('')
    
    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [veri, setVeri] = useState(true)

    function resetStates() {
        setNewName('')
        setNewDescription('')
    }

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/cms/topics', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.created_at)).getTime()-(new Date(a.created_at)).getTime()}))
                .then(JSON.stringify)
                .then(setTopicListString)
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

    async function onSubmit(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', newName);
        formData.append('course', courseId);
        formData.append('description', newDescription)
        formData.append('available', '1')
        const newDate=new Date()
        formData.append('created_at', newDate.getUTCFullYear() + '-' + (Number(newDate.getUTCMonth())+1) + '-' + newDate.getUTCDate() + ' '
            + newDate.getUTCHours() + ':' + newDate.getUTCMinutes()+':'+newDate.getUTCSeconds())

        try {
            await fetch('/cms/topics/create', {
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
    
    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Topics:</div>
                        {topicListString?JSON.parse(topicListString).map(x => (
                            <div key={x.topic} className="list-item">
                                <div key={x.topic}><Link className="content-link list-item-title" to={'/content-management/course/' + courseId + '/discussion/topic/' + x.topic}>{x.name}</Link></div>
                                <div key={x.description}>{x.description}</div>
                                <div key={x.created_at} className="created-at"><b>Created at:</b> {new Date(x.created_at).toLocaleString()}</div>
                            </div>
                        )):null}
                    </div>

                    <div className="float-right">
                        <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Create a topic</button>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Create a topic</div>
                            <form onSubmit={onSubmit}>
                                <div><b>Topic name:</b> <input onChange={(e) => setNewName(e.target.value)} required maxLength={30}></input></div>
                                <div><b>Description:</b> <input onChange={(e) => setNewDescription(e.target.value)} maxLength={200}></input></div>
                                <div><button type="submit" className='btn waves-light globalbtn'>Create</button></div>
                                <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                            </form>

                        </Modal>
                    </div>

                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Discussion as any) as any;