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
  // State for storing all date related to the oprations for question page
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

  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Admin']);
  const [showRoleEditPopup, setShowRoleEditPopup] = useState<boolean>(false);
  const [selectedRolesForEdit, setSelectedRolesForEdit] = useState<string[]>([]);
  const [showAddQuestionPopup, setShowAddQuestionPopup] = useState<boolean>(false);
  const allRoles = ['Admin', 'Student', 'Teacher', 'Linguistic Researcher', 'Other'];
  const firebase = useContext(FirebaseContext);
  const [roles, setRoles] = useState([]);

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
   * */
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
      } else {
        NotificationManager.error('No questions found.');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      NotificationManager.error('Failed to fetch questions.');
    } finally {
      setLoading(false);
    }
  };

  // Function for fetching roles a given question is mapped to
  const fetchRoles = async (qid: number) => {
    try {
      const response = await axios.get(`/api/getQuestionRoles/${qid}`);
      const flattenedRoles = response.data.result.flat(); 
      setRoles(flattenedRoles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Function for handling role mapping after question is added
  const handleRoleMapping = async (qid: number) => {
    if (qid === undefined) {
      NotificationManager.error('Invalid question ID.');
      return;
    }

    try {
      const requests = selectedRoles.map(async (role) => {
        // Create FormData for each role mapping
        const formData = new FormData();
        formData.append('QID', String(qid)); 
        formData.append('USERID', String(createdby)); 
        formData.append('USERROLE', role);

        // Post request to backend API to add the role to the question
        return axios.post('/api/addRoleToQuestion', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      });

      // Wait for all role mapping requests to complete
      const responses = await Promise.all(requests);
      responses.forEach((response, index) => {
        if (response.data.result) {
          // Notify success for each role
          NotificationManager.success(`Role ${selectedRoles[index]} added successfully to question ${qid}`);
        } else {
          // Notify failure for each role
          NotificationManager.error(`Failed to add role ${selectedRoles[index]} to question ${qid}: ` +
            (response.data.message || 'Unknown error'));
        }
      });
    } catch (error) {
      console.error('Error adding roles:', error);
      NotificationManager.error('An error occurred while adding roles. Please try again.');
    }
  };

  // Function to fetch existing roles for a question and set them to state
  const handleEditRoles = async (question) => {
    setSelectedQuestion(question);
    setSelectedRolesForEdit([]); 

    try {
      const response = await axios.get(`/api/getQuestionRoles/${question.qid}`);

      // Extract the role names from the array structure
      const roles = response.data.result.map((roleArray) => roleArray[0]);
      setSelectedRolesForEdit(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      NotificationManager.error('Error fetching roles.');
    }

    setShowRoleEditPopup(true);
  };

  const handleRoleEditChange = (role: string) => {
    setSelectedRolesForEdit((prevRoles) => {
      if (prevRoles.includes(role)) {
        // If role is already selected, deselect it
        return prevRoles.filter((r) => r !== role);
      } else {
        // Otherwise, add the role
        return [...prevRoles, role];
      }
    });
  }

  // Save changes when the user clicks the save button
  const handleSaveRoleChanges = async () => {
    if (!selectedQuestion || selectedRolesForEdit.length === 0) {
      NotificationManager.warning('No roles selected or question not specified.');
      return;
    }

    try {
      // Fetch existing roles for the selected question
      const response = await axios.get(`/api/getQuestionRoles/${selectedQuestion.qid}`);
      const existingRoles = response.data.result.map((roleArray) => roleArray[0]);

      // Find roles to remove
      const rolesToRemove = existingRoles.filter((role) => !selectedRolesForEdit.includes(role));
      const removeRequests = rolesToRemove.map((role) => {
        return axios.delete(`/api/removeRoleFromQuestion/${selectedQuestion.qid}/${role}`);
      });

      // Wait for all remove requests to complete
      await Promise.all(removeRequests);

      // Find roles to add
      const rolesToAdd = selectedRolesForEdit.filter((role) => !existingRoles.includes(role));
      const addRequests = rolesToAdd.map((role) => {
        const formData = new FormData();
        formData.append('QID', String(selectedQuestion.qid));
        formData.append('USERID', String(createdby));
        formData.append('USERROLE', role);

        return axios.post('/api/addRoleToQuestion', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      });

      // Wait for all add requests to complete
      await Promise.all(addRequests);

      NotificationManager.success('Roles updated successfully');
      setShowRoleEditPopup(false);
      fetchQuestions(); // this is for refreshing page
    } catch (error) {
      console.error('Error updating roles:', error);
      NotificationManager.error('Failed to update roles.');
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
      setQuestionToDelete(null); 
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


  // Function for handling role selection changes
  const handleRoleChange = (role) => {
    // Prevent deselecting 'admin'
    if (role === 'Admin') {
      if (!selectedRoles.includes('Admin')) {
        setSelectedRoles((prevRoles) => [...prevRoles, 'Admin']);
      }
    } else {
      setSelectedRoles((prevRoles) => {
        if (prevRoles.includes(role)) {
          // If role is already selected, deselect it
          return prevRoles.filter((r) => r !== role);
        } else {
          // Otherwise, select the role
          return [...prevRoles, role];
        }
      });
    }
  };


  /**
   * Function for adding a new question
   */
  const handleAddQuestion = async () => {
    if (!newQuestion.questionvalue.trim()) {
      NotificationManager.error('Question value is required.');
      return;
    }


    // Create FormData to send as application/x-www-form-urlencoded
    const formData = new FormData();
    formData.append('QUESTIONVALUE', newQuestion.questionvalue);
    formData.append('ISACTIVE', String(newQuestion.isactive));
    formData.append('TEXTFLAG', String(newQuestion.textflag));
    formData.append('CREATEDBY', createdby);
    formData.append('CREATEDDATE', currentDate);

    try {
      const response = await axios.post('/api/addQuestion', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data && response.data.result) {
        const qid = response.data.result;
        fetchQuestions();
        setNewQuestion({ questionvalue: '', isactive: false, textflag: false });
        setSelectedRoles(['Admin']);
        NotificationManager.success('Question added successfully');

        // Map roles to the newly added question
        await handleRoleMapping(qid);
      } else {
        NotificationManager.error('Failed to add question. Please try again.');
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
    if (selectedQuestion?.qid) {
      setRoles([]);
      fetchRoles(selectedQuestion.qid);
    }

    fetchQuestions();
  }, [selectedQuestion?.qid]);

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
            <p><strong>Roles:</strong></p>
            {roles.length > 0 ? (
              roles.map((role, index) => (
                <h3 key={index}>{role}</h3>
              ))
            ) : (
              <p>No roles available for this question.</p>
            )}
            <button onClick={closeModals}>Close</button>
          </div>
        </div>
      );
    }
    return null;
  };

  // Render the role edit modal
  const renderRoleEditModal = () => {
    if (showRoleEditPopup && selectedQuestion) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Roles for Question</h3>
            <p><strong>Question ID:</strong> {selectedQuestion.qid}</p>
            <p><strong>Question Value:</strong> {selectedQuestion.questionvalue}</p>

            <div>
              <h3>Existing Roles:</h3>
              <div className="button-group">
                {allRoles.map((role) => (
                  <button
                    key={role}
                    className={`button ${selectedRolesForEdit.includes(role) ? 'selected' : ''}`}
                    onClick={() => handleRoleEditChange(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleSaveRoleChanges} className="btn">Save Changes</button>
              <button onClick={() => setShowRoleEditPopup(false)} className="btn">Close</button>
            </div>
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
                  className={`button ${newQuestion.isactive === true ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, isactive: true })}
                >
                  True
                </button>
                <button
                  className={`button ${newQuestion.isactive === false ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, isactive: false })}
                >
                  False
                </button>
              </div>
            </div>

            <div className="input-group">
              <h3>Text Flag:</h3>
              <div className="button-group">
                <button
                  className={`button ${newQuestion.textflag === true ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, textflag: true })}
                >
                  True
                </button>
                <button
                  className={`button ${newQuestion.textflag === false ? 'selected' : ''}`}
                  onClick={() => setNewQuestion({ ...newQuestion, textflag: false })}
                >
                  False
                </button>
              </div>
            </div>

            <div className="input-group">
              <h3>Select Roles for the Question:</h3>
              <div className="button-group">
                {['Admin', 'Student', 'Teacher', 'Linguistic Researcher', 'Other'].map((role) => (
                  <button
                    key={role}
                    className={`button ${selectedRoles.includes(role) ? 'selected' : ''}`}
                    onClick={() => handleRoleChange(role)}
                    disabled={role === 'Admin' && !selectedRoles.includes('Admin')}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="input-group">
              <p><strong>Created By:</strong> {createdby}</p>
              <p><strong>Created Date:</strong> {currentDate}</p>
            </div>

            <div className="button-group">
              <button onClick={handleAddQuestion}>Save</button>
              <button onClick={() => setShowAddQuestionPopup(false)}>Close</button>
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
                  <button onClick={() => handleEditRoles(question)}>Edit Roles</button>
                  <button onClick={() => handleDeleteQuestion(question)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderDetailsModal()}
      {renderRoleEditModal()}
      {renderEditPopup()}
      {renderDeleteModal()}
      {renderAddQuestionPopup()}
    </div>
  );
};

export default AdminQuestions;
