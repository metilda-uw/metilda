import React from "react"
import { Link } from "react-router-dom"

export default function Sidebar(args) {
    return (
        <div className="sidebar">
            <aside>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']} >Overview</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']+'/syllabus'} >Syllabus</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/' + args['courseId'] + '/lessons'} >Lessons</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']+'/discussion'} >Discussion</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']+'/assignments'} >Assignment</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']+'/quiz'} >Quiz</Link></div>
                <div className="sidebar-item"><Link to={'/student-view/course/'+args['courseId']+'/grades'} >Grades</Link></div>
            </aside>
        </div>
    )
}