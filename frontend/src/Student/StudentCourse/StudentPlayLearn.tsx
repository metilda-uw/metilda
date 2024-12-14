import React, { useState, useRef, useEffect, useContext, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import { spinnerIcon } from "../../Utils/SpinnerIcon";

const StudentPlayLearn = () => {
  const courseId = useParams()['id'];
  const user = (useContext(AuthUserContext) as any);
  const containerRef = useRef(null);

  const [activities, setActivities] = useState({});
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [words, setWords] = useState([]);
  const [images, setImages] = useState([]);

  const [matches, setMatches] = useState({});
  const [draggedWord, setDraggedWord] = useState(null);
  const [lines, setLines] = useState([]);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const wordRefs = useRef({});
  const imageRefs = useRef({});

  useEffect(() => {
    async function fetchActivities() {
      let formData = new FormData();
      formData.append('course', courseId);
      try {
        const response = await fetch('/student-view/activities', {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData
        });
        const data = await response.json();
        setActivities(data);
        setError(null);
      }
      catch (error) {
        setError("Error fetching activities")
      }
      finally {
        setLoading(false);
      }
    }
    fetchActivities();
  }, [courseId]);

  const handleActivitySelect = (activityNumber) => {
    const activity = activities[activityNumber];
    const shuffledWords = Object.keys(activity).sort(() => Math.random() - 0.5);
    console.log(activity)
    console.log(shuffledWords)
    const shuffledImages = Object.values(activity).sort(() => Math.random() - 0.5);

    setSelectedActivity(activityNumber);
    setWords(shuffledWords);
    setImages(shuffledImages);
    setMatches({});
    setScore(null);
    setLines([]);
  };

  const handleDragStart = (word) => {
    setDraggedWord(word);
  };

  const handleDrop = (image) => {
    if (draggedWord) {
      setMatches((prevMatches) => {
        const updatedMatches = Object.fromEntries(
          Object.entries(prevMatches).filter(([key, value]) => value !== draggedWord)
        );
        updatedMatches[image] = draggedWord;
        return updatedMatches;
      });
      setDraggedWord(null);
    }
  };

  const updateLines = () => {
    const newLines = Object.entries(matches).map(([image, word]: [any, any]) => {
      const wordElement = wordRefs.current[word];
      const imageElement = imageRefs.current[image];
      if (wordElement && imageElement) {
        const wordRect = wordElement.getBoundingClientRect();
        const imageRect = imageElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        return {
          x1: wordRect.left + wordRect.width / 2 - containerRect.left,
          y1: wordRect.top + wordRect.height / 2 - containerRect.top,
          x2: imageRect.left + imageRect.width / 2 - containerRect.left,
          y2: imageRect.top + imageRect.height / 2 - containerRect.top,
        };
      }
      return null;
    });
    setLines(newLines.filter((line) => line !== null));
  };

  useEffect(() => {
    updateLines();
  }, [matches]);

  const handleSubmit = () => {
    let correctCount = 0;
    const correctMatches = activities[selectedActivity];
    for (const [image, word] of Object.entries(matches)) {
      if (correctMatches[word] === image) {
        correctCount++;
      }
    }
    setScore(correctCount);
  };

  const handleReset = () => {
    setMatches({});
    setScore(null);
    setLines([]);
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
              <div className="spinner-container">
                {spinnerIcon()}
              </div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              !selectedActivity ? (
                <div>
                  <div style={{ fontSize: "27px", fontWeight: "bold" }}>Select an Activity</div>
                  <ul>
                    {Object.keys(activities).map((activityNumber) => (
                      <li key={activityNumber}>
                        <div className="activity_name" onClick={() => handleActivitySelect(activityNumber)} >
                          Activity {activityNumber}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div
                  ref={containerRef}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                  }}
                >
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

                  <div style={{ width: "100%" }}>
                    <button
                      onClick={() => setSelectedActivity(0)}
                      style={{
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "10px 20px",
                        margin: "10px 0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px", // Adds spacing between the arrow and text
                        height: "30px"
                      }}
                    >
                      <span>&larr;</span>
                      Back
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                    <div style={{ width: "30%" }}>
                      <div className="play_n_learn_heading">Words</div>
                      {words.map((word) => (
                        <div style={{ height: "120px", paddingTop: "6%" }}>
                          <div
                            key={word}
                            draggable
                            onDragStart={() => handleDragStart(word)}
                            style={{
                              padding: "10px",
                              margin: "10px",
                              cursor: "grab",
                              background: "#ee6e73",
                              borderRadius: "4px",
                              textAlign: "center",
                              fontSize: "17px",
                              width: "50%"
                            }}
                            ref={(el) => (wordRefs.current[word] = el)}
                          >
                            {word}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ width: "60%" }}>
                      <div className="play_n_learn_heading">Images</div>
                      <div style={{ justifyContent: "space-around", marginTop: "3%" }}>
                        {images.map((image) => (
                          <div
                            key={image}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(image)}
                            style={{
                              width: "100px",
                              height: "100px",
                              border: "2px dashed gray",
                              borderRadius: "8px",
                              textAlign: "center",
                              lineHeight: "100px",
                              background: matches[image] ? "#d4edda" : "#f8d7da",
                              position: "relative",
                              margin: "2%"
                            }}
                            ref={(el) => (imageRefs.current[image] = el)}
                          >
                            <img
                              src={image}
                              alt={image}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                opacity: matches[image] ? 0.5 : 1,
                                pointerEvents: "none",
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "20px", marginLeft: "-50%" }}>
                    <button
                      className="play_n_learn_button"
                      onClick={handleSubmit}
                      style={{ marginRight: "10px", backgroundColor: "forestgreen" }}
                    >
                      Submit
                    </button>
                    <button
                      className="play_n_learn_button"
                      onClick={handleReset}
                      style={{ backgroundColor: "darkgrey", color: "black" }}
                    >
                      Reset
                    </button>
                  </div>

                  {score !== null && activities[selectedActivity] && (
                    <div style={{ marginTop: "20px", fontSize: "18px" }}>
                      <strong>Score:</strong> {score} / {Object.keys(activities[selectedActivity]).length}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPlayLearn;