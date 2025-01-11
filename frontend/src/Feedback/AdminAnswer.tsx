/**
 * This is the AdminAnswer page that is used to diplay and delete answers
 * from the Answers table by the Admin. 
 */

import React, { useState, useEffect} from 'react';
import { NotificationManager } from 'react-notifications';
import axios from 'axios';

export interface Answer {
  aid: number;
  qid: number;
  oid: number;
  answeredby: string;
  answereddate: string;
  questionValue?: string;
  optionValue?: string;
}

const AdminAnswer: React.FC = () => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<Answer | null>(null);
  const [answerToDelete, setAnswerToDelete] = useState<Answer | null>(null);

  // Fetch answers from API
  // Each answers qid and oid is replaced with their QuestionValue and OptionValue for easy readablity when displayed 
  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const answersResponse = await axios.get('/api/getAnswers');
      if (answersResponse.data.result) {
        const answersList = answersResponse.data.result.map((answer: any) => ({
          aid: answer[0],
          qid: answer[1],
          oid: answer[2],
          answeredby: answer[3],
          answereddate: answer[4],
        }));

        // Fetch question and option details for each answer and combine them with the main answer data
        const enrichedAnswers = await Promise.all(
          answersList.map(async (answer) => {
            try {
              const questionResponse = await axios.get(`/api/getQuestionValue/${answer.qid}`);
              const optionResponse = await axios.get(`/api/getOptionValue/${answer.oid}`);

              // Set question and option values to 'Unknown' if not found
              const questionValue = questionResponse.data.result?.[0]?.[0] || 'Unknown';
              const optionValue = optionResponse.data.result?.[0]?.[0] || 'Unknown';

              return { ...answer, questionValue, optionValue };
            }
            // Handle any Error that happen while trying to fetch
            catch (subError) {
              console.error(`Error fetching question/option for QID ${answer.qid} and OID ${answer.oid}:`, subError);
              return { ...answer, questionValue: 'Error', optionValue: 'Error' };
            }
          })
        );

        setAnswers(enrichedAnswers);
        NotificationManager.success('Answers fetched successfully.');
      } else {
        NotificationManager.error('No answers found.');
      }
    } catch (error) {
      NotificationManager.error('Error fetching answers: ', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Deletes the selected answer by making an API call and updating the state.
   * Displays a notification based on the success or failure of the operation.
   */
  const handleConfirmDelete = async () => {
    if (!answerToDelete) return;

    try {
      // Perform the delete request to the API
      await axios.delete(`/api/deleteAnswer/${answerToDelete.aid}`);

      // Refresh the answers list after deletion
      setAnswers((prevAnswers) => prevAnswers.filter((answer) => answer.aid !== answerToDelete.aid));

      setAnswerToDelete(null);
      NotificationManager.success('Answer deleted successfully.');
    } catch (error) {
      NotificationManager.error('Error deleting answer:', error)
    }
  };

  /**
  * Opens the confirmation modal for deleting an answer.
  * Sets the `answerToDelete` state to the selected answer.
  */
  const handleDeleteAnswer = (answer: Answer) => {
    setAnswerToDelete(answer);
  };

  /**
   * Handles viewing the details of a specific answer.
   * Sets the `selectedAnswer` state to display the details in a modal.
   */
  const handleViewDetails = (answer: Answer) => {
    setSelectedAnswer(answer);
  };

  /**
   * Closes the modals by resetting the `selectedAnswer` and `answerToDelete` states.
   */
  const closeModals = () => {
    setSelectedAnswer(null);
    setAnswerToDelete(null);
  };

  useEffect(() => {
    fetchAnswers();
  }, []);

  /**
   * Renders the modal for viewing the details of an answer.
   * Displays the answer's properties and a close button.
   */
  const renderDetailsModal = () => {
    if (selectedAnswer) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Answer Details</h3>
            <p><strong>AID:</strong> {selectedAnswer.aid}</p>
            <p><strong>QID:</strong> {selectedAnswer.qid}</p>
            <p><strong>Question Value:</strong> {selectedAnswer.questionValue}</p>
            <p><strong>OID:</strong> {selectedAnswer.oid}</p>
            <p><strong>Option Value:</strong> {selectedAnswer.optionValue}</p>
            <p><strong>Answered By:</strong> {selectedAnswer.answeredby}</p>
            <p><strong>Answered Date:</strong> {new Date(selectedAnswer.answereddate).toLocaleString()}</p>
            <button onClick={closeModals}>Close</button>
          </div>
        </div>
      );
    }
    return null;
  };

  /**
   * Renders the modal for confirming the deletion of an answer.
   * Displays a confirmation message and buttons to confirm or cancel the operation.
   */
  const renderDeleteModal = () => {
    if (answerToDelete) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the following answer?</p>
            <p><strong>AID:</strong> {answerToDelete.aid}</p>
            <p><strong>Answered By:</strong> {answerToDelete.answeredby}</p>
            <p><strong>Question Value:</strong> {answerToDelete.questionValue}</p>
            <p><strong>Option Value:</strong> {answerToDelete.optionValue}</p>
            <button onClick={handleConfirmDelete}>Confirm</button>
            <button onClick={closeModals}>Cancel</button>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;

  /**
   * Displays the Answers List table with all the relevant data and action buttons.
   */
  return (
    <div>
      <h2>Answers List</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Answered By</th>
              <th>Question Value</th>
              <th>Option Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((answer, index) => (
              <tr key={answer.aid}>
                <td>{index + 1}</td>
                <td>{answer.answeredby}</td>
                <td>{answer.questionValue}</td>
                <td>{answer.optionValue}</td>
                <td>
                  <button onClick={() => handleViewDetails(answer)}>View Details</button>
                  <button onClick={() => handleDeleteAnswer(answer)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderDetailsModal()}
      {renderDeleteModal()}
    </div>
  );
};

export default AdminAnswer;
