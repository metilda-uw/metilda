/**
 * This is the AdminQuestion page that is used to diplay, fetach, edit, insert and delete question
 * from the Questions table by the Admin. 
 */

import React, { useState, useEffect, useContext } from 'react';
import { NotificationManager } from 'react-notifications';
import FirebaseContext from "../Firebase/context";
import axios from 'axios';

// Define the structure for a Question object
export interface Question {
  qid: number;
  questionvalue: string;
  textflag: boolean;
  isactive: boolean;
  createdby: string;
  createddate: string;
}

const AdminQuestions: React.FC = () => {
  // State for storing all questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<{
    questionvalue: string;
    isactive: boolean;
    textflag: boolean;
    createdby?: string;
    createddate?: string;
  }>({
    questionvalue: '',
    isactive: false,
    textflag: false,
  });
  const [showAddQuestionPopup, setShowAddQuestionPopup] = useState<boolean>(false);
  const firebase = useContext(FirebaseContext);

  // State for editing modal
  const [showDetailsPopup, setShowDetailsPopup] = useState<boolean>(false);
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [editingValue, setEditingValue] = useState<boolean>(false);
  const [editingStatus, setEditingStatus] = useState<boolean>(false);
  const [updatedValue, setUpdatedValue] = useState<string>('');
  const [updatedStatus, setUpdatedStatus] = useState<boolean | null>(null);
  const currentDate = new Date().toLocaleString();
  const createdby = firebase.auth.currentUser.email;

  /**
   * Function for fetching all active and inactive questions
   *  */ 
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/getAllQuestions');
      if (response.data.result) {
        const questionsList = response.data.result.map((q: any) => ({
          qid: q[0],
          questionvalue: q[1],
          textflag: q[2],
          isactive: q[3],
          createdby: q[4],
          createddate: q[5],
        }));

        setQuestions(questionsList);
        NotificationManager.success('Questions fetched successfully.');
      } else {
        NotificationManager.error('No questions found.');
      }
    }catch(error) {
      console.error('Error fetching questions:', error);
      NotificationManager.error('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function for handling a deletion of question
   */
  const handleConfirmDelete = async () => {
    if (!questionToDelete) return;

    try {
      await axios.delete(`/api/deleteQuestion/${questionToDelete.qid}`);
      // Refresh the options list after deletion
      setQuestions((prevQuestion) => prevQuestion.filter((question) => question.qid !== questionToDelete.qid));
      setQuestionToDelete(null); // Close the delete modal
      NotificationManager.success('Question deleted successfully'); 
    } catch (error) {
      console.error('Error deleting question:', error);
      NotificationManager.error('Failed to delete question. Please try again.');
    }
  };

  /**
   * Function for Openning delete confirmation modal
   */
  const handleDeleteQuestion = (question: Question) => {
    setQuestionToDelete(question);
  };

  /**
   * Function for adding a new question
   */
const handleAddQuestion = async () => {
    if (!newQuestion.questionvalue.trim()) {
      NotificationManager.error('Question value is required.');
      return; // Stop the function if the input is empty
    }
  
    // Create FormData to send as application/x-www-form-urlencoded
    const formData = new FormData();
    formData.append('QUESTIONVALUE', newQuestion.questionvalue);
    formData.append('ISACTIVE', String(newQuestion.isactive));
    formData.append('TEXTFLAG', String(newQuestion.textflag));
    formData.append('CREATEDBY', createdby); 
    formData.append('CREATEDDATE', currentDate );
  
    try {
      const response = await axios.post('/api/addQuestion', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      // Refresh questions after successful addition
      if (response.data.result) {
        fetchQuestions();
        setNewQuestion({ questionvalue: '', isactive: false, textflag: false }); // Reset form
        NotificationManager.success('Questions added successfully');
      }
    } catch (error) {
      console.error('Error adding question:', error);
      NotificationManager.error('Failed to add new question. Please try again.');
    }
  };
  

  /**
   * Function for Viewing details of a selected question
   */
  const handleViewDetails = (question: Question) => {
    setSelectedQuestion(question);
    setShowDetailsPopup(true);
  };


  /**
   * Function for openning the edit popup for either value or status
   */
  const handleOpenEditPopup = (question: Question, editType: 'value' | 'status') => {
    setSelectedQuestion(question);
    setUpdatedValue(question.questionvalue);
    setUpdatedStatus(question.isactive);
    setShowEditPopup(true);

    if (editType === 'value') {
      setEditingValue(true);
      setEditingStatus(false);
    } else if (editType === 'status') {
      setEditingValue(false);
      setEditingStatus(true);
    }
  };

  // Separate functions for editing value and editing status
  const handleUpdateQuestionValue = async () => {
    if (selectedQuestion && updatedValue.trim() !== '') {
      try {
        const formData = new FormData();
        formData.append('QUESTION_VALUE', updatedValue);

        await axios.put(`/api/updateQuestion/${selectedQuestion.qid}`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        fetchQuestions();
        setShowEditPopup(false);
        setSelectedQuestion(null);
        NotificationManager.success('Question Value updated successfully');
      } catch (error) {
        console.error('Error updating question value:', error);
        NotificationManager.error('Failed to update question value. Please try again.');
      }
    }
  };

  
   /**
   * Function for updating Update the question's status
   */
  const handleUpdateQuestionStatus = async () => {
    if (selectedQuestion !== null && updatedStatus !== null) {
      try {
        const formData = new FormData();
        formData.append('ISACTIVE', String(updatedStatus));

        await axios.put(`/api/updateQuestionStatus/${selectedQuestion.qid}`, formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        fetchQuestions();
        setShowEditPopup(false);
        setSelectedQuestion(null);
        NotificationManager.success('Question Status updated successfully');
      } catch (error) {
        console.error('Error updating question status:', error);
        NotificationManager.errort('Failed to update question status. Please try again.');
      }
    }
  };


   /**
   * Function for closing modals
   */
  const closeModals = () => {
    setShowDetailsPopup(false);
    setSelectedQuestion(null);
    setQuestionToDelete(null);
    setShowAddQuestionPopup(false);
    setShowEditPopup(false);
    setEditingValue(false);
    setEditingStatus(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

   /**
   * Function for rendering details about question
   */
  const renderDetailsModal = () => {
    if (showDetailsPopup && selectedQuestion) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Question Details</h3>
            <p><strong>QID:</strong> {selectedQuestion.qid}</p>
            <p><strong>Question Value:</strong> {selectedQuestion.questionvalue}</p>
            <p><strong>Text Flag:</strong> {selectedQuestion.textflag ? 'True' : 'False'}</p>
            <p><strong>Is Active:</strong> {selectedQuestion.isactive ? 'True' : 'False'}</p>
            <p><strong>Created By:</strong> {selectedQuestion.createdby}</p>
            <p><strong>Created Date:</strong> {new Date(selectedQuestion.createddate).toLocaleString()}</p>
            <button onClick={closeModals}>Close</button>
          </div>
        </div>
      );
    }
    return null;
  };

   
   /**
   * Function for rendering deletion of a question
   */
   const renderDeleteModal = () => {
    if (questionToDelete) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the following question?</p>
            <p><strong>QID:</strong> {questionToDelete.qid}</p>
            <p><strong>Question Value:</strong> {questionToDelete.questionvalue}</p>
            <button onClick={handleConfirmDelete}>Confirm</button>
            <button onClick={closeModals}>Cancel</button>
          </div>
        </div>
      );
    }
    return null;
  };

   /**
   * Function for rendering the updates of a question
   */
  const renderEditPopup = () => {
    console.log('Rendering edit popup', showEditPopup, selectedQuestion);
    if (showEditPopup && selectedQuestion) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Question</h3>
            {editingValue && (
              <div>
                <h3>Update Question Value:</h3>
                <input
                  type="text"
                  placeholder="New question value"
                  value={updatedValue}
                  onChange={(e) => setUpdatedValue(e.target.value)}
                />
                <button onClick={handleUpdateQuestionValue}>Update Value</button>
              </div>
            )}
            {editingStatus && (
              <div>
                <h3>Update Status:</h3>
                <div className="status-buttons">
                  <button
                    className={`status-button ${updatedStatus ? 'active' : ''}`}
                    onClick={() => setUpdatedStatus(true)}
                  >
                    Active
                  </button>
                  <button
                    className={`status-button ${updatedStatus === false ? 'inactive' : ''}`}
                    onClick={() => setUpdatedStatus(false)}
                  >
                    Inactive
                  </button>
                </div>
                <button onClick={handleUpdateQuestionStatus}>Update Status</button>
              </div>
            )}
            <button onClick={closeModals}>Close</button>
          </div>
        </div>
      );
    }
    return null;
  };
  
   /**
   * Function for rendering the addition of a new question
   */
  const renderAddQuestionPopup = () => {
    if (showAddQuestionPopup) {
      return (
        <div className="modal-overlay">
        <div className="modal-content">
            <h3>Add New Question</h3>

            <div className="input-group">
              <h3>Question Value:</h3>
              <input
                type="text"
                placeholder="Enter question value"
                value={newQuestion.questionvalue}
                onChange={(e) => setNewQuestion({ ...newQuestion, questionvalue: e.target.value })}
              />
            </div>

            <div className="input-group">
              <h3>Is Active:</h3>
                <div className="button-group">
                  <button
                    className={`button-group ${newQuestion.isactive === true ? 'selected' : ''}`}
                    onClick={() => setNewQuestion({ ...newQuestion, isactive: true })}
                  >
                    True
                  </button>
                  <button
                    className={`button-group ${newQuestion.isactive === false ? 'selected' : ''}`}
                    onClick={() => setNewQuestion({ ...newQuestion, isactive: false })}
                  >
                    False
                  </button>
                  </div>
                </div>

              <h3>Text Flag:</h3>
              <div className="button-group">
                <button
                  className={`button-group ${newQuestion.textflag === true ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, textflag: true })}
                >
                  True
                </button>
                <button
                  className={`button-group ${newQuestion.textflag === false ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, textflag: false })}
                >
                  False
                </button>
              </div>
            
            <div>
              <p><strong>Created By:</strong> {createdby}</p>
              <p><strong>Created Date:</strong> {currentDate}</p>
            </div>

            <div className="button-group">
              <button onClick={handleAddQuestion}>Save</button>
              <button onClick={closeModals}>Close</button>
            </div>
          </div>
        </div>

      );
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Questions List</h2>
      <div className="add-question-container">
        <button onClick={() => setShowAddQuestionPopup(true)}>Add New Question</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Question Value</th>
              <th>Created By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question, index) => (
              <tr key={question.qid}>
                <td>{index + 1}</td>
                <td>{question.questionvalue}</td>
                <td>{question.createdby}</td>
                <td>
                  <button onClick={() => handleViewDetails(question)}>View</button>
                  <button onClick={() => handleOpenEditPopup(question, 'value')}>Edit Value</button>
                  <button onClick={() => handleOpenEditPopup(question, 'status')}>Edit Status</button>
                  <button onClick={() => handleDeleteQuestion(question)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderDetailsModal()}
      {renderEditPopup()}
      {renderDeleteModal()}
      {renderAddQuestionPopup()}
    </div>
  );
};

export default AdminQuestions;
