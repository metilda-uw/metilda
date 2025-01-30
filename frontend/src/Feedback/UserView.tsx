import './UserView.scss';
import Header from "../Components/header/Header";
import React, { useState, useEffect, useContext } from 'react';
import { NotificationManager } from 'react-notifications';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import FirebaseContext from "../Firebase/context";

interface Question {
  qid: number;
  questionvalue: string;
  textflag: boolean;
  isactive: boolean;
  createdby: string;
  createddate: string;
}

interface Option {
  oid: number;
  optionvalue: string;
}

const Feedback: React.FC = () => {
  const history = useHistory();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: number]: number | string }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [wordCount, setWordCount] = useState<number>(0);
  const QUESTIONS_PER_PAGE = 4;
  const firebase = useContext(FirebaseContext);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchRolesData = async () => {
      if (firebase.auth.currentUser) {
        const userId = firebase.auth.currentUser.email;
        try {
          const response = await axios.get(`/api/get-user-roles/${userId}`);
          if (response.data.result && response.data.result.length > 0) {
            const rolesList = response.data.result.map((role: any) => role[0]);
            const recognizedRoles = ['Admin', 'Student', 'Teacher', 'Linguistic Researcher', 'Other'];
  
            // Validate roles
            const validRoles = rolesList.filter((role) => recognizedRoles.includes(role));
            const invalidRoles = rolesList.filter((role) => !recognizedRoles.includes(role));
  
            if (invalidRoles.length > 0) {
              NotificationManager.error(
                `The role(s) "${invalidRoles.join(', ')}" are not recognized. Defaulting to "Student".`
              );
              setRoles(['Student']);
            } else {
              setRoles(validRoles);
            }
          } else {
            NotificationManager.error('No roles found. Defaulting to "Student".');
            setRoles(['Student']);
          }
        } catch (error) {
          NotificationManager.error('Failed to fetch roles.');
        }
      }
    };
  
    fetchRolesData();
  }, [firebase.auth.currentUser]);
      
    useEffect(() => {
      const fetchData = async () => {
        if (roles.length === 0) return;
    
        try {
          const questionsPromises = roles.map((role) =>
            axios.get(`/api/getQuestionsByRole/${role}`)
          );
          const optionsPromise = axios.get('/api/getOptions');
          const responses = await Promise.all([...questionsPromises, optionsPromise]);
    
          // Process questions
          const allQuestions = responses.slice(0, roles.length).flatMap((response) => {
            if (response.data.result) {
              return response.data.result.map((q: any) => ({
                qid: q[0],
                questionvalue: q[1],
                textflag: q[2],
                isactive: q[3],
                createdby: q[4],
                createddate: q[5],
              }));
            }
            return [];
          });
    
          const uniqueQuestions = Array.from(
            new Map(allQuestions.map((q) => [q.qid, q])).values()
          );
          setQuestions(uniqueQuestions);
    
          // Process options
          const optionsResponse = responses[roles.length];
          if (optionsResponse.data.result) {
            const mappedOptions = optionsResponse.data.result.map((o: any) => ({
              oid: o[0],
              optionvalue: o[1],
            }));
            setOptions(mappedOptions);
          } else {
            setError('No options found');
          }
        } catch (err) {
          setError('Error fetching data');
          NotificationManager.error('Error fetching data!');
        } finally {
          setLoading(false);
        }
      };
    
      fetchData();
    }, [roles]);
    
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    currentPage * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE
  );

  const handleAnswerChange = (qid: number, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleCommentChange = (qid: number, value: string) => {
    setComments((prev) => {
      const newComments = { ...prev, [qid]: value };
      setWordCount(value.length); 
      return newComments;
    });
  };

  const handleSubmit = async () => {
    try {
      const requests = [];

      // Handle answers for questions with textflag false (options)
      Object.entries(answers).forEach(([qid, answer]) => {
        if (typeof answer === 'number') {
          // Submit answer for textflag = false (number answers)
          const formData = new FormData();
          formData.append('QID', qid); 
          formData.append('OID', String(answer)); 
          formData.append('ANSWEREDBY', firebase.auth.currentUser.email); 

          requests.push(
            axios.post('/api/addAnswer', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
          );
        }
      });

      // Handle comments for questions with textflag true
      Object.entries(comments).forEach(([qid, comment]) => {
        if (comment.trim()) {
          const formData = new FormData();
          formData.append('QID', qid);
          formData.append('COMMENTVALUE', comment);
          formData.append('COMMENTEDBY', firebase.auth.currentUser.email);

          requests.push(
            axios.post('/api/addComment', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
          );
        }
      });

      // Wait for all requests to complete
      await Promise.all(requests);

      // After successful submission, go to the ThankYou page
      history.push('/ThankYou');
    } catch (err) {
      NotificationManager.error('Error submitting feedback!');
      console.error(err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const getProgressColor = (progress: number) => {
    return '#66bb6a'; 
  };

  // Progress bar component
  const ProgressBar = ({ curSection, totalSections }) => {
    const progress = (curSection  / totalSections) * 100
    return (
      <div className="progressbar">
      <div 
        className="progressbar-inner" 
        style={{ 
          width: `${progress}%`, 
          backgroundColor: getProgressColor(progress) 
        }}
      ></div>
    </div>
    );
  };

  return (
    <div className="page-feedback">
      <Header />
      <h1>Evaluation Form</h1>
                <h3 className="p-intro">
                    While MeTILDA is an ongoing project, the Create tool is ready for beta. This form ask you to evaluate the
                    usage of MeTILDA overall and the Create tab. Other tools are still being developed but are available
                    to explore.
                </h3>
                <h2 className="p-intro">Feedback is welcome.</h2>

      {/* Progress Bar */}
      <ProgressBar curSection={currentPage} totalSections={totalPages} />

      <div className="question-list">
        {currentQuestions.map((question, index) => (
          <div key={question.qid} className="question-item">
            <p>{(currentPage  * QUESTIONS_PER_PAGE) + index + 1}. {question.questionvalue}</p>

            {/* For textflag false (options) */}
            {question.textflag === false && (
              <div className="options">
                {options.map((option) => (
                  <button
                    key={option.oid}
                    className={`option-button ${
                      answers[question.qid] === option.oid ? 'selected' : ''
                    }`}
                    onClick={() => handleAnswerChange(question.qid, option.oid)}
                  >
                    {option.optionvalue}
                  </button>
                ))}
              </div>
            )}

            {/* For textflag true (comments) */}
            {question.textflag === true && (
              <div className="text-input">
                <textarea
                  placeholder="Enter your comment..."
                  value={comments[question.qid] || ''}
                  onChange={(e) => handleCommentChange(question.qid, e.target.value)}
                />
                <div className="word-count">
                  {wordCount} / 1000 characters
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        {currentPage > 0 && (
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0} className="btn-back">
            Back
          </button>
        )}
        {currentPage < totalPages - 1 ? (
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages - 1} className="btn-next">
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-submit">
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default Feedback;
