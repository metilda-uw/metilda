import React from "react"
import { useState, useContext, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../../Components/header/Header";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import "./GeneralStyles.scss"
import Sidebar from "./Sidebar";
import { verifyTeacherCourse } from "../AuthUtils";
import { spinnerIcon } from "../../Utils/SpinnerIcon";

const PlayLearn = () => {
    const courseId = useParams()["id"];
    const user = useContext(AuthUserContext) as any;

    const [activities, setActivities] = useState({});
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [words, setWords] = useState([]);
    const [targets, setTargets] = useState([]);

    const [selectedWord, setSelectedWord] = useState(null);
    const [matches, setMatches] = useState({});
    const [lines, setLines] = useState([]);
    const [score, setScore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false)
    const [rows, setRows] = useState([{ word: "", targetType: "word", targetValue: "" }]);
    const [difficultyLevel, setDifficultyLevel] = useState('');
    const wordRefs = useRef({});
    const targetRefs = useRef({});
    const containerRef = useRef(null);

    async function fetchActivities() {
        let formData = new FormData();
        formData.append("course", courseId);
        try {
            const response = await fetch("/student-view/activities", {
                method: "POST",
                headers: { Accept: "application/json" },
                body: formData,
            });
            const data = await response.json();
            setActivities(data);
            setError(null);
        } catch (error) {
            setError("Error fetching activities");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchActivities();
    }, [courseId]);

    const handleActivitySelect = (activityNumber) => {
        const activity = activities[activityNumber];
        const words = Object.keys(activity)
        const shuffledTargets = Object.values(activity).sort(() => Math.random() - 0.5);

        setSelectedActivity(activityNumber);
        setWords(words);
        setTargets(shuffledTargets);
        setMatches({});
        setScore(null);
        setLines([]);
        setSelectedWord(null);
    };

    const handleWordClick = (word) => {
        setSelectedWord(word);
    };

    const handleTargetClick = (target) => {
        if (selectedWord) {
            const correctTarget = activities[selectedActivity][selectedWord];
            if (correctTarget.value === target.value) {
                setMatches((prevMatches) => ({ ...prevMatches, [selectedWord]: target }));
                drawLine(selectedWord, target); // Draw line for correct matches
                setSelectedWord(null); // Deselect word after a successful match
            } else {
                alert("Incorrect match! Try again."); // Notify user of incorrect match
            }
        }
    };

    const handleCreateActivity = async () => {
        // Capture the input values
        const difficulty = difficultyLevel;
        const words = rows.map(row => row.word);
        const targetTypes = rows.map(row => row.targetType);
        const targetValues = rows.map(row => row.targetValue);
    
        // Validation: Check if all fields are filled
        if (!difficulty) {
            alert("Please enter a difficulty level.");
            return;
        }
    
        if (words.some(word => !word) || targetValues.some(value => !value)) {
            alert("Please fill in all the words and target values.");
            return;
        }
    
        // Proceed if validation passes
        const formData = new FormData();
        formData.append("course_no", courseId);
        formData.append("difficulty_level", difficulty);
        formData.append("words", JSON.stringify(words));
        formData.append("targetType", JSON.stringify(targetTypes));
        formData.append("targetValue", JSON.stringify(targetValues));
    
        try {
            const response = await fetch("/cms/activities/create", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                },
                body: formData,
            });
    
            const data = await response.json();
            console.log(JSON.stringify(data))
            if (JSON.stringify(data).includes("success")) {
                alert("Activity created successfully!");
                fetchActivities();
                setShowModal(false); // Close the modal after successful creation
            } else {
                alert("Error creating activity");
                throw new Error(data.message || "Error creating activity");
            }
        } catch (error) {
            
        } 
    };

    
    const drawLine = (word, target) => {
        const wordElement = wordRefs.current[word];
        const targetElement = targetRefs.current[target.value];
        const containerElement = containerRef.current;

        if (wordElement && targetElement && containerElement) {
            const wordRect = wordElement.getBoundingClientRect();
            const targetRect = targetElement.getBoundingClientRect();
            const containerRect = containerElement.getBoundingClientRect();

            const newLine = {
                x1: wordRect.left + wordRect.width / 2 - containerRect.left,
                y1: wordRect.top + wordRect.height / 2 - containerRect.top,
                x2: targetRect.left + targetRect.width / 2 - containerRect.left,
                y2: targetRect.top + targetRect.height / 2 - containerRect.top,
            };

            setLines((prevLines) => [...prevLines, newLine]);
        }
    };

    const handleSubmit = () => {
        setScore(Object.keys(matches).length);
    };

    const handleReset = () => {
        setMatches({});
        setScore(null);
        setLines([]);
        setSelectedWord(null);
    };

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { word: "", targetType: "word", targetValue: "" }]);
    };


    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker semi-transparent background
            backdropFilter: 'blur(8px)', // Adds a blur effect to the background
            zIndex: 1000 // Ensures the modal is above everything
        },
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            borderRadius: '10px',
            padding: '20px',
            background: 'white',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
            width: '700px',
            maxHeight: '500px',
            overflowY: 'auto'
        }
    };

    return (
        <div>
            <Header />
            <div className="main-layout">
                <Sidebar courseId={courseId} />
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        {loading ? (
                            <div className="spinner-container">{spinnerIcon()}</div>
                        ) : error ? (
                            <div className="error-message">{error}</div>
                        ) : !selectedActivity ? (
                            <div>
                                <div className="assignments-header">
                                    <div className="title-name">
                                        Activities
                                    </div>
                                    <div className="create-assignment-button" onClick={() => setShowModal(true)}>
                                        + Create an Activity
                                    </div>
                                </div>
                                <div>
                                    {Object.keys(activities).map((activityNumber) => (
                                        <div key={activityNumber} className="list-item" style={{ cursor: "pointer" }}>
                                            <div
                                                className="content-link list-item-title" style={{ color: "black" }}
                                                onClick={() => handleActivitySelect(activityNumber)}
                                            >
                                                Activity {activityNumber}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div
                                ref={containerRef}
                                style={{
                                    position: "relative",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    padding: "20px",
                                    width: "500px",
                                }}
                            >
                                <button className="back-button"
                                    style={{ textAlign: "left", margin: "0 0 10px 0" }}
                                    onClick={() => setSelectedActivity(null)}
                                >
                                    Back
                                </button>
                                <svg
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        pointerEvents: "none",
                                    }}
                                >
                                    {lines.map((line, index) => (
                                        <line
                                            key={index}
                                            x1={line.x1}
                                            y1={line.y1}
                                            x2={line.x2}
                                            y2={line.y2}
                                            stroke="black"
                                            strokeWidth="2"
                                        />
                                    ))}
                                </svg>

                                <div className="instruction">Match by selecting a word box on the left, then selecting the corresponding matching word box on the right</div>

                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                    {/* Words Section */}
                                    <div style={{ width: "30%" }}>
                                        <div className="play_n_learn_heading">Words</div>
                                        {words.map((word) => (
                                            <div
                                                className="wordContainer"
                                                key={word}
                                                ref={(el) => (wordRefs.current[word] = el)}
                                                onClick={() => handleWordClick(word)}
                                                style={{
                                                    background:
                                                        selectedWord === word ? "#d4edda" : matches[word] ? "#a1d1a3" : "rgb(248, 215, 218)",
                                                }}
                                            >
                                                <div style={{ lineHeight: "100px", fontSize: "16px" }}>
                                                    {word}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Targets Section */}
                                    <div>
                                        <div className="play_n_learn_heading">Targets</div>
                                        <div style={{ justifyContent: "space-around", marginTop: "3%" }}>
                                            {targets.map((target) => (
                                                <div
                                                    className="wordContainer"
                                                    key={target.value}
                                                    ref={(el) => (targetRefs.current[target.value] = el)}
                                                    onClick={() => handleTargetClick(target)}
                                                    style={{
                                                        background: Object.values(matches).includes(target)
                                                            ? "#a1d1a3"
                                                            : "rgb(248, 215, 218)"
                                                    }}
                                                >
                                                    {target.type === "url" ? (
                                                        <img
                                                            src={target.value}
                                                            alt={target.value}
                                                            style={{
                                                                width: "100%",
                                                                height: "100%",
                                                                objectFit: "cover",
                                                                opacity: Object.values(matches).includes(target) ? 0.5 : 1,
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{ lineHeight: "100px", fontSize: "16px" }}>
                                                            {target.value}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: "20px", textAlign: "center" }}>

                                    <button
                                        onClick={handleReset}
                                        style={{
                                            backgroundColor: "darkgrey",
                                            borderColor: "darkgray",
                                            color: "black",
                                            borderRadius: "4px",
                                            padding: "10px 20px",
                                        }}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>
                        )}
                        <Modal
                            isOpen={showModal}
                            onRequestClose={() => setShowModal(false)}
                            contentLabel="Example Modal"
                            style={customStyles}
                        >
                            <div className="announcement-title-name">Add an Activity</div>
                            <input
                                type="text"
                                placeholder="Difficulty level"
                                value={difficultyLevel}
                                onChange={(e) => setDifficultyLevel(e.target.value)}  
                                required
                                maxLength={30}
                                style={{ width: '32%' }}
                            />
                            {rows.map((row, index) => (
                                <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                    <input
                                        type="text"
                                        placeholder="Word"
                                        value={row.word}
                                        onChange={(e) => handleChange(index, "word", e.target.value)}
                                        required
                                        maxLength={30}
                                        style={{ width: '32%' }}
                                    />

                                    <select className="select"
                                        value={row.targetType}
                                        onChange={(e) => handleChange(index, "targetType", e.target.value)}
                                        style={{ flex: "1", padding: "8px", cursor: "pointer" }}
                                    >
                                        <option value="word">Target Word</option>
                                        <option value="image">Target Image</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder={row.targetType === "image" ? "Image URL" : "Target Word"}
                                        value={row.targetValue}
                                        onChange={(e) => handleChange(index, "targetValue", e.target.value)}
                                        maxLength={200}
                                        style={{ width: '32%' }}
                                    />
                                </div>
                            ))}

                            <div
                                className="create-assignment-button"
                                style={{ textAlign: "center", cursor: "pointer" }}
                                onClick={addRow}
                            >
                                + Add More
                            </div>

                            <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
                                <div className="create-assignment-button" style={{ width: "fit-content" }} onClick={handleCreateActivity} >Save</div>
                                <div className="create-assignment-button" style={{ width: "fit-content" }} onClick={() => setShowModal(false)}>Cancel</div>
                            </div>
                        </Modal>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayLearn;