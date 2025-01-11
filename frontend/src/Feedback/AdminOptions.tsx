/**
 * This is the AdminOptions page that is used to diplay, edit, add and delete options
 * from the Options table by the Admin. 
 */

import React, { useState, useEffect, useContext } from 'react';
import { NotificationManager } from 'react-notifications';
import FirebaseContext from "../Firebase/context";
import axios from 'axios';

export interface Option {
  oid: number;
  optionValue: string;
  createdBy: string;
  createdDate: string;
}

const AdminOptions: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [optionToDelete, setOptionToDelete] = useState<Option | null>(null);
  const [newOptionValue, setNewOptionValue] = useState<string>("");
  const [editOptionValue, setEditOptionValue] = useState<string>("");
  const [isAddOptionPopupVisible, setIsAddOptionPopupVisible] = useState<boolean>(false);
  const firebase = useContext(FirebaseContext);

  /**
   *  Function for fetcing all the options
   *  */ 
  const fetchOptions = async () => {
    setLoading(true);
    try {
      // The API call for fetaching from DB tables
      const response = await axios.get('/api/getOptions');
      if (response.data.result) {
        const optionsList = response.data.result.map((option: any) => ({
          oid: option[0],
          optionValue: option[1],
          createdBy: option[2],
          createdDate: option[3],
        }));

        setOptions(optionsList);
        NotificationManager.success('Options fetched successfully.');
      } else {
        NotificationManager.error('No options found.');
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      NotificationManager.error('Failed to fetch options.');
    } finally {
      setLoading(false);
    }
  };

  /**
   *  Function used to Delete option by OID
   *  */ 
  const handleConfirmDelete = async () => {
    if (!optionToDelete) return;

    try {
      await axios.delete(`/api/deleteOption/${optionToDelete.oid}`);
      // Refresh the options list after deletion
      setOptions((prevOptions) => prevOptions.filter((option) => option.oid !== optionToDelete.oid));
      setOptionToDelete(null); // Close the delete modal
      NotificationManager.success('Option deleted successfully.');
    } catch (error) {
      console.error('Error deleting option:', error);
      NotificationManager.error('Failed to delete option. Please try again.');
    }
  };

  /**
   *  Function used to Open delete confirmation modal
   *  */ 
  const handleDeleteOption = (option: Option) => {
    setOptionToDelete(option);
  };

  /**
  *  Function used to Open edit modal and set selected option for editing
  *  */ 
  const handleEditOption = (option: Option) => {
    setSelectedOption(option);
    setEditOptionValue(option.optionValue);
  };

  /**
  *  Function used to update the option value
  *  */   
  const handleUpdateOption = async () => {
    if (!selectedOption) return;
  
    // Create FormData to send as application/x-www-form-urlencoded
    const formData = new FormData();
    formData.append('OPTIONVALUE', editOptionValue);
  
    try {
      const response = await axios.put(`/api/updateOption/${selectedOption.oid}`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
  
      if (response.data.result === 'success') {
        fetchOptions(); // Refresh options after successful update

        // Close the modal or UI state, Clear the edit input, and send a sucess notification for user
        setSelectedOption(null); 
        setEditOptionValue(""); 
        NotificationManager.success('Option Value Updated successfully.');
      } else {
        NotificationManager.error('Update failed. Please try again.');
      }
    } catch (error) {
      console.error('Error updating option:', error);
      NotificationManager.error('Failed to update option. Please try again.');
    }
  };
  
    /**
  *  Function used to close modals
  *  */   
  const closeModals = () => {
    setSelectedOption(null);
    setOptionToDelete(null);
  };

  /**
  *  Function used to add a new option to the Options table 
  *  */   
  const handleAddOption = async () => {
    if (!newOptionValue.trim()) {
      NotificationManager.error('Option value is required.');
      return; 
    }

    // Create FormData to send as application/x-www-form-urlencoded
    const formData = new FormData();
    formData.append('OPTIONVALUE', newOptionValue);
    formData.append('CREATEDBY', firebase.auth.currentUser.email);

    try {
      const response = await axios.post('/api/addOption', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response.data.result) {
        fetchOptions(); // Refresh options after successful addition
        setNewOptionValue(""); // Clear input field
        NotificationManager.success('Option added successfully.');
      }
    } catch (error) {
      console.error('Error adding option:', error);
      NotificationManager.error('Failed to add option. Please try again.');
    }
  };


  /**
  *  Function to render the popup modal for adding an option
  *  */    
  const renderAddOptionModal = () => {
    if (isAddOptionPopupVisible) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Option</h3>
            <input
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder="Enter option value"
              autoFocus
            />
            <div className="modal-buttons">
              <button onClick={handleAddOption}>Add Option</button>
              <button onClick={() => setIsAddOptionPopupVisible(false)}>Cancel</button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  /**
  *  Function used to render update modal
  *  */   
  const renderEditModal = () => {
    if (selectedOption) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Option</h3>
            <input
              type="text"
              value={editOptionValue}
              onChange={(e) => setEditOptionValue(e.target.value)}
            />
            <button onClick={handleUpdateOption}>Save</button>
            <button onClick={closeModals}>Cancel</button>
          </div>
        </div>
      );
    }
    return null;
  };

  /**
  *  Function used to render delete modal
  *  */   
  const renderDeleteModal = () => {
    if (optionToDelete) {
      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete the following option?</p>
            <p><strong>OID:</strong> {optionToDelete.oid}</p>
            <p><strong>Option Value:</strong> {optionToDelete.optionValue}</p>
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
      <h2>Options List</h2>
      <div className="add-option">
        <button onClick={() => setIsAddOptionPopupVisible(true)}>Add Option</button>
        {renderAddOptionModal()}
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Option Value</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {options.map((option, index) => (
              <tr key={option.oid}>
                <td>{index + 1}</td>
                <td>{option.optionValue}</td>
                <td>{option.createdBy}</td>
                <td>{new Date(option.createdDate).toLocaleString()}</td>
                <td>
                  <button onClick={() => handleEditOption(option)}>Edit</button>
                  <button onClick={() => handleDeleteOption(option)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {renderEditModal()}
      {renderDeleteModal()} 
    </div>
  );
};

export default AdminOptions;
