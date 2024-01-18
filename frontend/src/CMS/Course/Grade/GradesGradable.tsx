import React, { createRef } from "react"
import { useState, useContext, useEffect} from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss"
import { verifyTeacherCourse } from "../../AuthUtils";
import Modal from 'react-modal'

function GradesGradable() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const gradableId = useParams()['gradable_id']
    const [title,setTitle] = useState('')
    const [maxGrade, setMaxGrade] = useState(0.0)
    const [weight, setWeight] = useState(0.0)
    const [veri, setVeri] = useState(true)
    const [newTitle,setNewTitle] = useState('')
    const [newMaxGrade, setNewMaxGrade] = useState(0.0);
    const [showModal, setShowModal] = useState(false)
    const [studentListString, setStudentListString] = useState('')
    const [newWeight, setNewWeight] = useState(0.0)
    const [average, setAverage] = useState(0.0)
    const [std,setStd]=useState(0.0)
    const history=useHistory()

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('gradable', gradableId);
            try {
                let response = await fetch('/cms/grades/gradable/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setNewTitle(response['name'])
                setMaxGrade(+response['max_grade'])
                setNewMaxGrade(+response['max_grade'])
                setStudentListString(JSON.stringify(response['grades'].sort((a, b) => {
                    if (a.student > b.student)
                        return 1
                    else 
                        return -1
                })))
                setWeight(+response['weight'])
                setNewWeight(+response['weight'])


                let responseJSON=response['grades']
                let graded=Object.keys(responseJSON).length
                let sum = 0
                for (let record of responseJSON) {
                    if (record.grade!==-1.0)
                        sum += record.grade
                    else
                        graded-=1
                }
                if(graded)
                    setAverage(sum / graded)
                else
                    setAverage(0)
                
                let avg = sum / graded
                sum = 0.0
                for (let record of responseJSON) {
                    if (record.grade!==-1.0)
                        sum += (record.grade - avg) ** 2
                }
                if(graded)
                    setStd((sum / graded) ** 0.5)
                else
                    setStd(0)

            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
    }, [])
    
    function onUpdate(e) {
        e.preventDefault()
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('gradable',gradableId)
            formData.append('name', newTitle);
            formData.append('max_grade', newMaxGrade.toString());
            formData.append('weight', newWeight.toString())
            try {
                await fetch('/cms/grades/gradable/update', {
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
            window.location.reload()
        }
        fetchData()
    }


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
        
    function resetStates() {
        setNewTitle(title)
        setNewMaxGrade(maxGrade)
        setNewWeight(weight)
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
                <div className="main-view centered">
                    <div className="info-list">
                        <div className="title">{title}</div>
                        <div><b>Max grade:</b> {maxGrade}</div>
                        <div><b>Weight:</b> {weight}</div>
                        
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Update a gradable item</div>
                            <form onSubmit={onUpdate}>
                                <div><b>Item name:</b> <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required maxLength={30}></input></div>
                                <div><b>Max Grade:</b> <input type='number' value={newMaxGrade} onChange={(e) => setNewMaxGrade(+e.target.value)} required max={1000000} min={0.01} step={0.01}></input></div>
                                <div><b>Weight:</b> <input type="number" value={newWeight} style={{ 'width': 'auto', 'height': 'auto' }} onChange={(e)=>setNewWeight(+e.target.value)} required max={1} min={0} step={0.0001}></input></div>
                                <div><button type="submit" className='btn waves-light globalbtn'>Update</button></div>
                                <div><button className='btn waves-light globalbtn' onClick={() => { setShowModal(false); resetStates() }}>Cancel</button></div>
                            </form>
                        </Modal>

                        <div className="title">Students:</div>
                        {studentListString?JSON.parse(studentListString).map(x => (
                            <div key={x.student+'1'} className="assignment">
                                <div key={x.student + '2'}><Link className="content-link list-item-title" key={x.student + '3'} to={'/content-management/course/' + courseId + '/grades/gradable/' + gradableId + '/student/' + x.student}>{x.student}</Link> Grade: {x.grade===-1?'-':x.grade}/{maxGrade}</div>
                            </div>
                        )) : null}
                        <div className="title">Statistics:</div>
                        <div><b>Average:</b> {average.toFixed(2)} &nbsp; Standard deviation: {std.toFixed(2)}</div>
                        <Link className="content-link" to={`/content-management/course/${courseId}/grades`}>Back</Link>
                    </div>
                    <div className="float-right">
                        <button className='btn waves-light globalbtn' onClick={() => setShowModal(true)}>Update gradable item</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesGradable as any) as any;