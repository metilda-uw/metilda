import React, { useState } from 'react';
import './AdminView.scss';
import Header from "../Components/header/Header";
import AdminAnswer from './AdminAnswer';
import AdminComment from './AdminCommets';
import AdminOption from './AdminOptions';
import AdminQuestion from './AdminQuestions';

// This is to format whatthe admin can view and used to access all the different pages
const AdminView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('questions');

  const renderSection = () => {
    switch (activeSection) {
      case 'answers':
        return <AdminAnswer />;
      case 'questions':
        return <AdminQuestion />;
      case 'comments':
        return <AdminComment />;
      case 'options':
        return <AdminOption />;
      default:
        return <div>Select a section to view.</div>;
    }
  };

  return (
    <div className="adminview-container">
      <Header />
      <div className="button-container">
        <button onClick={() => setActiveSection('questions')}>Questions</button>
        <button onClick={() => setActiveSection('answers')}>Answers</button>
        <button onClick={() => setActiveSection('comments')}>Comments</button>
        <button onClick={() => setActiveSection('options')}>Options</button>
      </div>
      <div className="section-container">{renderSection()}</div>
    </div>
  );
};

export default AdminView;
