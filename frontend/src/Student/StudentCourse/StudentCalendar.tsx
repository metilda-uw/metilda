import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { Link } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss";

// Define the type for the selected date(s)
type Value = Date | [Date, Date];

interface Holiday {
    name: string;
    date: string;
}

function StudentCalendar() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()["id"];
    const [veri, setVeri] = useState(true);
    const [date, setDate] = useState<Value>(new Date());
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
    const [deadlines, setDeadlines] = useState({ assignments: [], quizzes: [] });
    const [selectedDeadlines, setSelectedDeadlines] = useState<{ assignments: any[], quizzes: any[] }>({ assignments: [], quizzes: [] });

    useEffect(() => {
        const fetchHolidays = async () => {
            try {
                const response = await fetch(
                    "https://date.nager.at/api/v3/PublicHolidays/2025/US"
                );
                const data = await response.json();

                if (Array.isArray(data)) {
                    setHolidays(data);
                } else {
                    console.error("Unexpected API response format:", data);
                    setHolidays([]);
                }
            } catch (error) {
                console.error("Error fetching holidays:", error);
                setHolidays([]);
            }
        };

        const fetchDeadlines = async () => {
            try {
                const formData = new FormData();
                formData.append("course_id", courseId);

                const response = await fetch("/student-view/courses/deadline", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch deadlines");
                }

                const data = await response.json();
                setDeadlines(data);
            } catch (error) {
                console.error("Error fetching deadlines:", error);
            }
        };

        fetchDeadlines();
        fetchHolidays();
    }, []);

    const onDateChange = (value: Value) => {
        setDate(value);
        const selectedDate = Array.isArray(value) ? value[0] : value;

        if (Array.isArray(holidays)) {
            const holiday = holidays.find(
                (holiday) => new Date(holiday.date).toDateString() === selectedDate.toDateString()
            );
            setSelectedHoliday(holiday || null);
        }

        // Filter assignments and quizzes due on selected date
        const formattedDate = selectedDate.toDateString();
        const filteredAssignments = deadlines.assignments.filter(
            (assignment) => new Date(assignment.deadline).toDateString() === formattedDate
        );
        const filteredQuizzes = deadlines.quizzes.filter(
            (quiz) =>
                new Date(quiz.deadline).toDateString() === formattedDate ||
                new Date(quiz.start).toDateString() === formattedDate
        );
        setSelectedDeadlines({ assignments: filteredAssignments, quizzes: filteredQuizzes });
    };

    const tileClassName = ({ date }: { date: Date }) => {
    const isHoliday = holidays.some(
        (holiday) => new Date(holiday.date).toDateString() === date.toDateString()
    );

    const isAssignmentDeadline = deadlines.assignments.some(
        (assignment) => new Date(assignment.deadline).toDateString() === date.toDateString()
    );

    const isQuizStart = deadlines.quizzes.some(
        (quiz) => new Date(quiz.start).toDateString() === date.toDateString()
    );

    const isQuizDeadline = deadlines.quizzes.some(
        (quiz) => new Date(quiz.deadline).toDateString() === date.toDateString()
    );

    if (isHoliday) return "holiday";
    if (isAssignmentDeadline) return "assignment-deadline";
    if (isQuizStart) return "quiz-start";
    if (isQuizDeadline) return "quiz-deadline";
    return null;
};


    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div>
            <Header />
            <div className="main-layout">
                <Sidebar courseId={courseId} />
                <div className="height-column"></div>
                <div className="main-view" style={{ display: "block" }}>
                    <div className="info-list">
                        <div className="title-name">Course Calendar</div>
                        <div className="calendar-container">
                            <Calendar onChange={onDateChange} value={date} tileClassName={tileClassName} />
                            <div className="date-holiday-container">
                                <div className="selected-date">
                                    {Array.isArray(date)
                                        ? `${date[0].toDateString()} - ${date[1].toDateString()}`
                                        : date.toDateString()}
                                </div>

                                {selectedHoliday ? (
                                    <div className="holiday-info">
                                        <strong>Holiday:</strong> {selectedHoliday.name}
                                    </div>
                                ) : null}

                                {selectedDeadlines.assignments.length > 0 || selectedDeadlines.quizzes.length > 0 ? (
                                    <div className="deadlines-info">
                                        <h3>Deadlines</h3>
                                        <ul>
                                            {selectedDeadlines.assignments.map((assignment) => (
                                                <li key={assignment.id}>
                                                    <strong>Assignment:</strong> <Link to={`/student-view/course/${courseId}/assignment/${assignment.id}`} className="content-link" style={{color: 'blue'}}>{assignment.name}</Link> <br />
                                                    <strong>Deadline:</strong> {new Date(assignment.deadline).toLocaleString()}
                                                </li>
                                            ))}
                                            {selectedDeadlines.quizzes.map((quiz) => (
                                                <li key={quiz.id}>
                                                    <strong>Quiz:</strong> <Link to={`/student-view/course/${courseId}/quiz/${quiz.id}`} className="content-link" style={{color: 'blue'}}>{quiz.name}</Link> <br />
                                                    <strong>Start:</strong> {new Date(quiz.start).toLocaleString()} <br />
                                                    <strong>Deadline:</strong> {new Date(quiz.deadline).toLocaleString()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : <div>No assignments or quizzes on this date.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentCalendar as any);