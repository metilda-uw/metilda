import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaBookOpen, FaChalkboardTeacher, FaComments, FaClipboardList, FaQuestionCircle, FaChartBar, FaGamepad, FaCalendarAlt, FaBell } from "react-icons/fa";

const Sidebar = ({ courseId }) => {
    const location = useLocation();
    const menuItems = [
        { name: "Course Info", icon: <FaHome />, path: `/student-view/course/${courseId}` },
        { name: "Syllabus", icon: <FaBookOpen />, path: `/student-view/course/${courseId}/syllabus` },
        { name: "Lessons", icon: <FaChalkboardTeacher />, path: `/student-view/course/${courseId}/lessons` },
        { name: "Discussion", icon: <FaComments />, path: `/student-view/course/${courseId}/discussion` },
        { name: "Assignment", icon: <FaClipboardList />, path: `/student-view/course/${courseId}/assignment` },
        { name: "Quiz", icon: <FaQuestionCircle />, path: `/student-view/course/${courseId}/quiz` },
        { name: "Grades", icon: <FaChartBar />, path: `/student-view/course/${courseId}/grades` },
        { name: "Play & Learn", icon: <FaGamepad />, path: `/student-view/course/${courseId}/play_and_learn` },
        { name: "Calendar", icon: <FaCalendarAlt />, path: `/student-view/course/${courseId}/calendar` },
        { name: "Notification", icon: <FaBell />, path: `/student-view/course/${courseId}/notification` },
    ];

    return (
        <div className="sidebar">
            <aside>
                {menuItems.map((item, index) => (
                    <div key={index} className={`sidebar-item ${item.name=="Course Info"? location.pathname==item.path ? 'active' : '' :location.pathname.includes(item.path) ? 'active' : ''}`}>
                        <Link to={item.path} className={`sidebar-link ${item.name=="Course Info"? location.pathname==item.path ? 'active' : '' : location.pathname.includes(item.path) ? 'active' : ''}`}>
                            {item.icon}
                            <span className={`sidebar-text ${item.name=="Course Info"? location.pathname==item.path ? 'active' : '' : location.pathname.includes(item.path) ? 'active' : ''}`}>{item.name}</span>
                        </Link>
                    </div>
                ))}
            </aside>
        </div>
    );
};

export default Sidebar;