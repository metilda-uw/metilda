import React, { useState, useContext,  useEffect } from 'react';
import UserView from './UserView'; 
import './UserView.scss'; 

import AdminView from './AdminView'; 
import './AdminView.scss'; 
import Header from "../Components/header/Header";

import FirebaseContext from "../Firebase/context";
import { NotificationManager } from 'react-notifications';
import axios from 'axios';

const Feedback: React.FC = () => {
  const [roles, setRoles] = useState<string[]>([]); 
  const [loading, setLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 
  const [view, setView] = useState<string | null>(null); 
  const firebase = useContext(FirebaseContext);

  /**
   * Function to fetch roles for the current user.
   */
  const fetchRoles = async (userId: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/get-user-roles/${userId}`);

      if (response.data.result) {
        // Extract role names
        const rolesList = response.data.result.map((role: any) => role[0]);

        setRoles(rolesList); 
      } else {
        NotificationManager.error('No roles found.');
        setError('No roles found.');
      }
    } catch (error) {
      NotificationManager.error('Failed to fetch roles.');
      setError('Failed to fetch roles.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles when the component mounts
  useEffect(() => {
    if (firebase.auth.currentUser) {
      const userId = firebase.auth.currentUser.email;
      fetchRoles(userId);
    }
  }, [firebase.auth.currentUser]);

  // If the user has an 'Admin' role, show the page with selection buttons
  if (roles.includes('Admin')) {
    if (view === 'admin') {
      return <AdminView />;
    } else if (view === 'user') {
      return <UserView />;
    }

    return (
      <div className="feedback-container">
        <Header />
        <h1>Feedback Portal</h1>
        
        {/* Button selection view */}
        <div className="button-container">
          <button onClick={() => setView('user')} className="btn-user">
            User View
          </button>
          <button onClick={() => setView('admin')} className="btn-admin">
            Admin View
          </button>
        </div>
      </div>
    );
  }

  // If the user does not have an 'Admin' role, only show UserView
  return <UserView />;
};

export default Feedback;
