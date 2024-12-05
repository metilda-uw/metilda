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

  // Fetch questions and options 
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [questionsResponse, optionsResponse] = await Promise.all([
          axios.get('/api/getQuestions'),
          axios.get('/api/getOptions')
        ]);

        if (questionsResponse.data.result) {
          const mappedQuestions = questionsResponse.data.result.map((q: any) => ({
            qid: q[0],
            questionvalue: q[1],
            textflag: q[2],
            isactive: q[3],
            createdby: q[4],
            createddate: q[5]
          }));
          setQuestions(mappedQuestions);
        } else {
          setError('No questions found');
        }

        if (optionsResponse.data.result) {
          const mappedOptions = optionsResponse.data.result.map((o: any) => ({
            oid: o[0],
            optionvalue: o[1]
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
  }, []);

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
