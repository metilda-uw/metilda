import React from "react";
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { AuthUserContext } from "../../../Session";
import Modal from 'react-modal';
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "../GeneralStyles.scss";
import { verifyTeacherCourse } from "../../AuthUtils";
import { uploadFileWrapper } from "../Utils";
import { FirebaseContext } from "../../../Firebase";
import ReactFileReader from "react-file-reader";

function Quiz() {
    const courseId = useParams()['id'];
    const [questionList, setQuestionList] = useState([]);
    const user = (useContext(AuthUserContext) as any);
    const quizId = useParams()['quiz_id'];
    const firebase = useContext(FirebaseContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [start, setStart] = useState('');
    const [deadline, setDeadline] = useState('');
    const [maxGrade, setMaxGrade] = useState(0.0);
    const [weight, setWeight] = useState(0.0);
    const [veri, setVeri] = useState(true);
    const history = useHistory();

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            formData.append('quiz', quizId);

            try {
                let response = await fetch('/cms/quiz/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });

                setTimeout(async () => {
                    if (!response.ok) {
                        throw new Error('Error loading quiz information');
                    }
                    response = await response.json();
                    setName(response['name']);
                    setDescription(response['description']);
                    setStart(response['start']);
                    setDeadline(response['deadline']);
                    setMaxGrade(response['max_grade']);
                    setWeight(response['weight']);
                }, 2000);

                response = await fetch('/cms/quiz/questions', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });

                setTimeout(async () => {
                    if (!response.ok) {
                        throw new Error('Error loading questions');
                    }
                    let responseJSON = await response.json();
                    setQuestionList(responseJSON);
                }, 2000);
            } catch (error) {
                console.log(error);
            }
        }
        fetchData();
    }, [user.email, courseId, quizId, veri]);

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="main-view">
                    <div className="info-list">
                        <div className="title">Quiz Information</div>
                        <div><b>Quiz Name:</b> {name}</div>
                        <div><b>Description:</b> {description}</div>
                        <div><b>Quiz Start Time:</b> {start ? new Date(start).toLocaleString() : 'Loading...'}</div>
                        <div><b>Quiz End time:</b> {deadline ? new Date(deadline).toLocaleString() : 'Loading...'}</div>
                        <div><b>Max Grade:</b> {maxGrade}</div>
                        <div><b>Weight:</b> {weight}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Quiz;