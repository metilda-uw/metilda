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

function Grades() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [assignmentListString, setAssignmentListString] = useState('')
    const [quizList, setQuizList] = useState([])
    const [otherListString, setOtherListString] = useState('')
    const [veri, setVeri] = useState(true)

    const [showModal, setShowModal] = useState(false)
    
    const [name, setName] = useState('')
    const [maxGrade, setMaxGrade] = useState('')
    const [weight, setWeight] = useState(0.0)
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await fetch('/cms/assignments', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.deadline)).getTime()-(new Date(a.deadline)).getTime()}))
                .then(JSON.stringify)
                .then(setAssignmentListString)
                .catch(err => {
                    console.log("Fetch failed, see if it is 403 in error console");
                    setError("Error loading assignments.");
                });
            } catch (error) {
                setError("Error loading assignments.");
            }

            formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await fetch('/cms/grades/quiz', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => x.sort((b, a) => { return (new Date(b.deadline)).getTime() - (new Date(a.deadline)).getTime() }))
                .then(setQuizList)
                .catch(err => {
                    console.log("Fetch failed, see if it is 403 in error console");
                    setError("Error loading quizzes.");
                });
            } catch (error) {
                setError("Error loading quizzes.");
            }

            formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating a 2-second delay
                await fetch('/cms/grades/gradables', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => x.sort((b, a) => { return (new Date(b.created_at)).getTime() - (new Date(a.created_at)).getTime() }))
                .then(JSON.stringify)
                .then(setOtherListString)
                .catch(err => {
                    console.log("Fetch failed, see if it is 403 in error console");
                    setError("Error loading gradables.");
                });
            } catch (error) {
                setError("Error loading gradables.");
            }
        }
        fetchData()
    }, [])
    
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
                        <div className="title">Assignments:</div>
                        {error ? ( // Display error message if there is an error
                            <div style={{ color: 'red' }}>{error}</div>
                        ) : assignmentListString ? JSON.parse(assignmentListString).map(x => (
                            <div key={x.assignment + '1'} className="list-item">
                                <div key={x.assignment + '2'}>
                                    <Link className="content-link list-item-title" key={x.assignment + '3'} to={'/content-management/course/' + courseId + '/grades/assignment/' + x.assignment}>{x.name}</Link>
                                </div>
                            </div>
                        )) : null}
                        <div className="title">Quiz:</div>
                        {error ? ( // Display error message if there is an error
                            <div style={{ color: 'red' }}>{error}</div>
                        ) : quizList.length ? quizList.map(x => (
                            <div key={x.quiz} className="list-item">
                                <Link className="content-link list-item-title" to={'/content-management/course/' + courseId + '/grades/quiz/' + x.quiz}>{x.name}</Link>
                            </div>
                        )) : null}
                        <div className="title">Other:</div>
                        {error ? ( // Display error message if there is an error
                            <div style={{ color: 'red' }}>{error}</div>
                        ) : otherListString ? JSON.parse(otherListString).map(x => (
                            <div key={x.id + '1'} className="list-item">
                                <div key={x.id + '2'}>
                                    <Link className="content-link list-item-title" key={x.id + '3'} to={'/content-management/course/' + courseId + '/grades/gradable/' + x.id}>{x.name}</Link>
                                </div>
                            </div>
                        )) : null}
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
                            <div><b>Weight:</b> <input type="number" style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e)=>setWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                            <div><button type='submit' className='btn waves-light globalbtn'>Create</button></div>
                            <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                        </form>
                    </Modal>

                    <div className="float-right">
                        <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Create a gradable item</button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Grades as any) as any;