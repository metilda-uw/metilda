import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import "./GeneralStyles.scss"
import Sidebar from "./Sidebar";
import { verifyTeacherCourse } from "../AuthUtils";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function Lessons() {
    const courseId = useParams()['id']
    const [lessonListString, setLessonListString] = useState('')
    const lessonList = useMemo(() => lessonListString.split(';'), [lessonListString])
    const user = (useContext(AuthUserContext) as any)
    const [showModal, setShowModal] = useState(false)
    const [name, setName] = useState('')
    const [available, setAvailable] = useState('')
    const [veri, setVeri] = useState(true)
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [draggable, setDraggable] = useState(false)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri)
            if (!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating a 2-second delay
                await fetch('/cms/lessons', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }).then(x => x.json())
                    .then(x => x.map(obj => obj[0] + ',' + obj[1] + ',' + obj[2] + ',' + obj[3]))
                    .then(x => x.join(';'))
                    .then(setLessonListString)             
                setError(null);
            } catch (error) {
                setError("Error loading lessons.");
            } finally {
                setLoading(false);
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

    async function onSubmit(e) {
        e.preventDefault()
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('name', name);
        formData.append('course', courseId);
        formData.append('available', available);
        formData.append('length', lessonList.length.toString());

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
        setName('')
    }

    function handleOnDragEnd(result) {
        if (!result.destination) return;

        const items = Array.from(lessonList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLessonListString(items.join(';'));
    }

    async function onReorganize() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('lessons', lessonList.map((lesson, index) => {
            return (
                lesson.split(',')[0] + ',' + index
            );
        }).join(';')
        );

        try {
            await fetch('/cms/lessons/reorganize', {
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
                        <div className='title'>Lessons:</div>
                        {loading ? (
                            <div>{spinnerIcon()} </div>
                        ) : error ? (
                            <div className="error-message">Error loading topics. Please try again later.</div>
                        ) :
                            (
                                lessonListString ? (
                                    <DragDropContext onDragEnd={handleOnDragEnd}>
                                        <Droppable droppableId="lessons">
                                            {(provided) => (
                                                <div className="lessons" {...provided.droppableProps} ref={provided.innerRef}>
                                                    {
                                                        lessonList.map((lesson, index) => {
                                                            return (
                                                                <Draggable isDragDisabled={!draggable} key={lesson.split(',')[0]} draggableId={lesson.split(',')[0]} index={index}>
                                                                    {(provided) => (
                                                                        <div className="unstyle list-item" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                                            <Link to={'/content-management/course/' + courseId + '/lessons/' + lesson.split(',')[0]} className="content-link list-item-title">{lesson.split(',')[1]}</Link>
                                                                            <div><b>Available:</b> {lesson.split(',')[3] === 'true' ? 'Yes' : 'No'}</div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            );
                                                        })}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>
                                ) : null
                            )}
                    </div>

                    <div className="float-right">
                        <div><button className='btn waves-light globalbtn' onClick={() => setShowModal(true)} disabled={draggable}>Create a lesson</button></div>
                        <div>
                            {
                                draggable ?
                                    <button className='btn waves-light globalbtn' onClick={() => { onReorganize(); setDraggable(false) }}>Save lesson list</button>
                                    :
                                    <button className='btn waves-light globalbtn' onClick={() => setDraggable(true)}>Reorganize lesson list</button>
                            }

                        </div>
                    </div>

                    <div>
                        <Modal
                            isOpen={showModal}
                            // onAfterOpen={afterOpenModal}
                            onRequestClose={() => { setShowModal(false); resetStates() }}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="title">Create a lesson</div>
                            <form onSubmit={onSubmit}>
                                <div><b>Lesson name:</b> <input onChange={(e) => setName(e.target.value)} required maxLength={30}></input></div>
                                <div><b>Available:</b> <input type='checkbox' checked={available === '1' ? true : false} style={{ 'opacity': 100, 'pointerEvents': 'auto', 'position': 'unset' }} onChange={(e) => setAvailable(e.target.checked ? '1' : '0')}></input></div>
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
export default withAuthorization(authCondition)(Lessons as any) as any;