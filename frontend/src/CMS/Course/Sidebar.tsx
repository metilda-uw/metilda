import React from "react"
import { Link } from "react-router-dom"

export default function Sidebar(courseId) {
    return (
        <div className="sidebar">
            <aside>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId']} >Overview</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/syllabus'} >Syllabus</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/lessons'} >Lessons</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/discussion'} >Discussion</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/grades'} >Grades</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/assignment'} >Assignment</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/quiz'} >Quiz</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/students'} >Students</Link></div>
                <div className="sidebar-item"><Link to={'/content-management/course/' + courseId['courseId'] + '/grades'} >Grades</Link></div>
            </aside>
        </div>
    )
}