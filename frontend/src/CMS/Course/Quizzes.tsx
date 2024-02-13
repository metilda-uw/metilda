import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";

function Quizzes() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [quizList, setQuizList] = useState([])
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [start, setStart] = useState('')
    const [deadline, setDeadline] = useState('')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight, setWeight] = useState(0.0)
    const [showModal, setShowModal] = useState(false)
    const [veri, setVeri] = useState(true)


    function resetStates() {
        setName('')
        setDescription('')
        setStart('')
        setDeadline('')
        setMaxGrade(0.0)
        setWeight(0.0)
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
                await fetch('/cms/quiz', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.deadline)).getTime()-(new Date(a.deadline)).getTime()}))
                .then(setQuizList)
            }
            catch (e) {
                console.log(e)
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
        formData.append('name', name);
        formData.append('course', courseId);
        formData.append('description', description)
        formData.append('start', new Date(start).toUTCString())
        formData.append('deadline', new Date(deadline).toUTCString())
        formData.append('max_grade', maxGrade.toString())
        formData.append('weight', weight.toString())


        try {
            await fetch('/cms/quiz/create', {
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
                        <div className="title">Quiz:</div>
                        {quizList.length?quizList.map(x => (
                            <div key={x.quiz} className="list-item">
                                <div><Link className="content-link list-item-title" to={'/content-management/course/' + courseId + '/quiz/' + x.quiz}>{x.name}</Link></div>
                                <div className="deadline"><b>Deadline:</b> {new Date(x.deadline).toLocaleString()}</div>
                            </div>
                        )) : null}
                    </div>

                    <div className="float-right">
                        <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Create a quiz</button>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Create a quiz</div>
                            <form onSubmit={onSubmit}>
                                <div><b>Quiz name:</b> <input onChange={(e) => setName(e.target.value)} required maxLength={30}></input></div>
                                <div><b>Description:</b> <input onChange={(e) => setDescription(e.target.value)} maxLength={200}></input></div>
                                <div><b>Start:</b> <input style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => setStart(e.target.value)} required></input></div>
                                <div><b>Deadline:</b> <input style={{ 'width': 'auto', 'height': 'auto' }} type='datetime-local' onChange={(e) => setDeadline(e.target.value)} required></input></div>
                                <div><b>Max Grades:</b> <input type="number" value={maxGrade} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <div><b>Weight:</b> <input type="number" value={weight} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e) => setWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                                <div><button type='submit' className='btn waves-light globalbtn'>Create</button></div>
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
export default withAuthorization(authCondition)(Quizzes as any) as any;