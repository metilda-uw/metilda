
import React, { Component, useState } from "react";
import Header from "../Components/header/Header";
import './Notifications.scss';


const NotificationsComponent = () =>{

    const [selectedOption, setSelectedOption] = useState("inbox");

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
    };

    const Sidebar = ({ onSelect }) => {
        return (
          <div className="sidebar">
            {/* <h2>Options</h2> */}
            <button onClick={() => onSelect("inbox")}>Inbox</button>
            <button onClick={() => onSelect("sent")}>Sent</button>
          </div>
        );
    };

    const renderInboxMessages = () =>{
        const list = ["hi","hlo","bye","sry","happy", "sad", "life","hi","hlo","bye","sry","happy", "sad", "life"];
      
        return (
            <div className="inbox-content">
                <table>
                    <tr>
                        <th>Message</th>
                        <th>View</th>
                        <th>delete</th>
                    </tr>
                    {list && list.map((msg) =>{
                        return (<tr>
                            <td>{msg}</td>
                            <td>View</td>
                            <td>Delete</td>
                        </tr>
                        )
                    })
                    }
                </table>
                
            </div>
        )

    }
    const renderSentMessages = () =>{
        return (
            <div>
                <p>Sent messages</p>
            </div>
        )

    }
      
    const Content = ({ selectedOption }) => {
        return (
          <div className="notifications-content">
            <h2>{selectedOption.toUpperCase()}</h2>
            {/* Render content based on the selected option */}
            {selectedOption === "inbox" && renderInboxMessages()}
            {selectedOption === "sent" && renderSentMessages()}
          </div>
        );
      };
    

    return (
        <div className="notifications">
            <Header></Header>
            {/* <h2> Notifications </h2> */}
            <div className="notifications-component">
                <Sidebar onSelect={handleOptionSelect} />
                <Content selectedOption={selectedOption} />
            </div>
           
        </div>
    );
}

export default NotificationsComponent;