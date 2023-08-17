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

function Discussion() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']

    const [topicListString, setTopicListString] = useState('')
    
    const [newName, setNewName] = useState('')
    const [newDescription, setNewDescription] = useState('')
    // const [newAvailable, setNewAvailable] = useState('loading')

    const [showModal, setShowModal] = useState(false)

    function resetStates() {
        setNewName('')
        setNewDescription('')
        // setNewAvailable('loading')
    }

    useEffect(() => {
        async function fetchData() {
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
                .then(x=>x.sort((a,b)=>{return (new Date(b.created_at)).getTime()-(new Date(a.created_at)).getTime()}))
                .then(JSON.stringify)
                .then(setTopicListString)
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [user.email, courseId,topicListString])
    
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

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">
                    <div className="info-list">
                        <div>Topics:</div>
                        {topicListString?JSON.parse(topicListString).map(x => (
                            <div key={x.topic} className="topic">
                                <div key={x.topic}><Link to={'/content-management/course/' + courseId + '/discussion/topic/' + x.topic}>{x.name}</Link></div>
                                <div key={x.description} className="description">{x.description}</div>
                                {/* <div key={x.available}>Available: {x.available?'Yes':'No'}</div> */}
                                <div key={x.created_at} className="created-at">Created at: {new Date(x.created_at).toLocaleString()}</div>
                            </div>
                        )):null}
                    </div>

                    <div className="float-right">
                        <button onClick={() => setShowModal(true)}>Create a topic</button>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            Create a topic
                            <form>
                                <div>Topic name: <input onChange={(e) => setNewName(e.target.value)}></input></div>
                                <div>Description: <input onChange={(e) => setNewDescription(e.target.value)}></input></div>
                                {/* <div>Available: <input type='checkbox' checked={!!newAvailable} style={{ 'opacity': 100, 'pointerEvents': 'auto' }}
                                    onChange={(e) => setNewAvailable(e.target.checked ? '1' : '')}></input></div> */}
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
export default withAuthorization(authCondition)(Discussion as any) as any;