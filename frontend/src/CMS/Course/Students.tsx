import React, { useState, useContext, useEffect, useMemo } from "react";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";

function Students() {
    const courseId = useParams()['id'];
    const [studentListString, setStudentListString] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const studentList = useMemo(() => studentListString.split(';'), [studentListString]);
    const user = useContext(AuthUserContext) as any;
    const [veri, setVeri] = useState(true);

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);

            try {
                await fetch('/cms/courses/student-list', {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    body: formData
                }).then(x => x.json())
                .then(x => x.map(obj => obj[0] + ',' + obj[1]))
                .then(x => x.join(';'))
                .then(setStudentListString);
                setErrorMessage('');
            } catch (error) {
                setErrorMessage('Error loading students. Please try again later.');
            }
        }
        fetchData();
    }, []);

    // Function to get initials for avatar
    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    return (
        <div>
            <Header />
            <div className="main-layout">
                <Sidebar courseId={courseId} />
                <div className="students-content">
                    <div className="students-card">
                        <div className="students-title">Enrolled Students</div>
                        {errorMessage && <div className="students-error">{errorMessage}</div>}
                        
                        <table className="students-table">
                            <thead>
                                <tr>
                                    <th>Avatar</th>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentList.map(x => {
                                    const [email, name] = x.split(',');
                                    return (
                                        <tr key={email}>
                                            <td>
                                                <div className="students-row">
                                                    <div className="students-avatar">{getInitials(name)}</div>
                                                </div>
                                            </td>
                                            <td>{name}</td>
                                            <td>{email}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Students as any) as any;
