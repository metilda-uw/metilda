import React from "react";
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss";
import { verifyStudentCourse } from "../../CMS/AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

function StudentLessons() {
    const courseId = useParams()['id'];
    const [lessonListString, setLessonListString] = useState('');
    const lessonList = useMemo(() => lessonListString.split(';'), [lessonListString]);
    const user = (useContext(AuthUserContext) as any);
    const [veri, setVeri] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const paginatedLessons = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return lessonList.slice(startIndex, endIndex);
    }, [lessonList, currentPage]);

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email, courseId, setVeri);
            if (!veri) return;
            const formData = new FormData();
            formData.append('course', courseId);
            try {
                await fetch('/student-view/lessons', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                    .then(x => x.json())
                    .then(x => x.map(obj => obj[0] + ',' + obj[1] + ',' + obj[2] + ',' + obj[3]))
                    .then(x => x.join(';'))
                    .then(setLessonListString);
                setError(null);
            } catch (error) {
                setError("Error loading lessons");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [courseId, user.email, veri]);

    const totalPages = Math.ceil(lessonList.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div>
            <div><Header></Header></div>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <div className='title-name'>Lessons:</div>
                        {loading ? (
                            <div className="spinner-container">
                                {spinnerIcon()}
                            </div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : (
                            lessonListString ? (
                                <div style={{height: '420px'}}>
                                    {paginatedLessons.map((lesson) => {
                                        if (lesson.split(',')[3] === 'true') {
                                            return (
                                                <div className="list-item" key={lesson.split(',')[0]}>
                                                    <Link to={'/student-view/course/' + courseId + '/lessons/' + lesson.split(',')[0]} className="content-link list-item-title" style={{ color: "black" }}>
                                                        {lesson.split(',')[1]}
                                                    </Link>
                                                </div>
                                            );
                                        } else {
                                            return null;
                                        }
                                    })}
                                </div>
                            ) : null
                        )}
                        {/* Pagination Controls */}
                        <div className="pagination-controls">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="pagination-arrow"
                            >
                                &#8592; {/* Left Arrow */}
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="pagination-arrow"
                            >
                                &#8594; {/* Right Arrow */}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentLessons as any) as any;