import './ThankYou.scss';
import React from 'react';
import { Link } from "react-router-dom";

import Header from "../Components/header/Header";

const ThankYou = () => {
    return (
        <div>
            <Header />
            <h1 className="h1">Thank You!</h1>
            <p>Thank you for submitting your feedback.</p>
            <Link to="/home">Go back to Home</Link>
        </div>
    );
};

export default ThankYou;