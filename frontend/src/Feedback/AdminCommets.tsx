/**
 * This is the AdminComments page that is used to diplay and delete comments
 * from the comments table by the Admin.
 */

import { NotificationManager } from 'react-notifications';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export interface Comment {
  cid: number;
  qid: number;
  commentvalue: string;
  commentedby: string;
  createddate: string;
  questionValue?: string;
}

const AdminComments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  // Fetch comments from the API
  // send out notifications incase of errors
  const fetchComments = async () => {
    setLoading(true);
    try {
      const commentsResponse = await axios.get('/api/getComments');
      if (commentsResponse.data.result) {
        const commentsList = commentsResponse.data.result.map((comment: any) => ({
          cid: comment[0],
          qid: comment[1],
          commentvalue: comment[2],
          commentedby: comment[3],
          createddate: comment[4],
        }));

        const enrichedComments = await Promise.all(
          commentsList.map(async (comment) => {
            try {
              const questionResponse = await axios.get(`/api/getQuestionValue/${comment.qid}`);
              const questionValue = questionResponse.data.result?.[0]?.[0] || 'Unknown';
              return { ...comment, questionValue };
            } catch (subError) {
              console.error(`Error fetching question for QID ${comment.qid}:`, subError);
              return { ...comment, questionValue: 'Error' };
            }
          })
        );

        setComments(enrichedComments);
        NotificationManager.success('Comments fetched successfully.');
      } else {
        NotificationManager.error('No comments found.');
      }
    } catch (error) {
      NotificationManager.error('Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Function to handle the deletion of a comment 
   * */
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await axios.delete(`/api/deleteComment/${commentToDelete.cid}`);
      // Refresh the comments list after deletion
      setComments((prevComments) => prevComments.filter((comment) => comment.cid !== commentToDelete.cid));
      setCommentToDelete(null); // Close the delete modal
      NotificationManager.success('Comment deleted successfully.');
    } catch (error) {
      NotificationManager.error('Failed to delete comment. Please try again.');
    }
  };

  /**
   * Function to open the delete confirmation modal for a specific comment
   * */
  const handleDeleteComment = (comment: Comment) => {
    setCommentToDelete(comment);
  };

  /**
   * Function to set the currently selected comment for viewing details
   * */
  const handleViewDetails = (comment: Comment) => {
    setSelectedComment(comment);
  };

  /**
   * Function to close modals
   * */
  const closeModals = () => {
    setSelectedComment(null);
    setCommentToDelete(null);
  };

  useEffect(() => {
    fetchComments();
  }, []);

  /**
   * Function to render the details modal for viewing comment details
   * */
  const renderDetailsModal = () => {
    if (selectedComment) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Comment Details</h3>
            <p><strong>CID:</strong> {selectedComment.cid}</p>
            <p><strong>QID:</strong> {selectedComment.qid}</p>
            <p><strong>Question Value:</strong> {selectedComment.questionValue}</p>
            <p><strong>Comment Value:</strong> {selectedComment.commentvalue}</p>
            <p><strong>Commented By:</strong> {selectedComment.commentedby}</p>
            <p><strong>Created Date:</strong> {new Date(selectedComment.createddate).toLocaleString()}</p>
            <button onClick={closeModals}>Close</button>
          </div>
        </div>
      );
    }
    return null;
  };

  /**
   * Function to render the delete confirmation modal
   * */
  const renderDeleteModal = () => {
    if (commentToDelete) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the following comment?</p>
            <p><strong>CID:</strong> {commentToDelete.cid}</p>
            <p><strong>Commented By:</strong> {commentToDelete.commentedby}</p>
            <p><strong>Comment Value:</strong> {commentToDelete.commentvalue}</p>
            <button onClick={handleConfirmDelete}>Confirm</button>
            <button onClick={closeModals}>Cancel</button>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Comments List</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Commented By</th>
              <th>Question Value</th>
              <th>Comment Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment, index) => (
              <tr key={comment.cid}>
                <td>{index + 1}</td>
                <td>{comment.commentedby}</td>
                <td>{comment.questionValue}</td>
                <td>{comment.commentvalue}</td>
                <td>
                  <button onClick={() => handleViewDetails(comment)}>View Details</button>
                  <button onClick={() => handleDeleteComment(comment)}>Delete</button>
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

export default AdminComments;
