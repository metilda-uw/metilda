import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaBookOpen, FaChalkboardTeacher, FaComments, FaClipboardList, FaQuestionCircle, FaUsers, FaChartBar, FaGamepad, FaBullhorn } from "react-icons/fa";

const Sidebar = ({ courseId }) => {
    const location = useLocation();
    const menuItems = [
        { name: "Course Info", icon: <FaHome />, path: `/content-management/course/${courseId}` },
        { name: "Syllabus", icon: <FaBookOpen />, path: `/content-management/course/${courseId}/syllabus` },
        { name: "Lessons", icon: <FaChalkboardTeacher />, path: `/content-management/course/${courseId}/lessons` },
        { name: "Discussion", icon: <FaComments />, path: `/content-management/course/${courseId}/discussion` },
        { name: "Assignment", icon: <FaClipboardList />, path: `/content-management/course/${courseId}/assignment` },
        { name: "Quiz", icon: <FaQuestionCircle />, path: `/content-management/course/${courseId}/quiz` },
        { name: "Students", icon: <FaUsers />, path: `/content-management/course/${courseId}/students` },
        { name: "Grades", icon: <FaChartBar />, path: `/content-management/course/${courseId}/grades` },
        { name: "Play & Learn", icon: <FaGamepad />, path: `/content-management/course/${courseId}/play_and_learn` },
        { name: "Announcement", icon: <FaBullhorn />, path: `/content-management/course/${courseId}/announcement` },
    ];

    return (
        <div className="sidebar">
            <aside>
                {menuItems.map((item, index) => (
                    <div key={index} className={`sidebar-item ${item.name=="Course Info"? location.pathname==item.path ? 'active' : '' : location.pathname.includes(item.path) ? 'active' : ''}`}>
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