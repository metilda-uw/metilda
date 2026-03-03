import React, { Component, useEffect, useState } from "react";
import Header from "../Components/header/Header";
import './Notifications.scss';
import InboxMessages from "./InboxMessages";
import SentMessagesComponent from "./SentMessages";
import Box from "@material-ui/core/Box";

const NotificationsComponent = () =>{

    const [selectedOption, setSelectedOption] = useState("inbox");
    const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

    useEffect(() => {
      const resizeHandler = () => setWindowWidth(window.innerWidth)
      window.addEventListener("resize", resizeHandler)
    }, [])
    
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

    const Content = ({ selectedOption }) => {
        return (
          <div className="notifications-content">
            {/* <h2>{selectedOption.toUpperCase()}</h2> */}
            {/* Render content based on the selected option */}
            {selectedOption === "inbox" && <InboxMessages/>}
            {selectedOption === "sent" && <SentMessagesComponent/>}
          </div>
        );
      };
    
    return (
      <div className="notifications">
        <Header></Header>
        {/* <h2> Notifications </h2> */}
        {(windowWidth < 600) ? (
          <Box style={{ display: 'flex', justifyContent: 'center' }}>
            <button style={{ width: '100px' }} onClick={() => handleOptionSelect("inbox")}>Inbox</button>
            <button style={{ width: '100px' }} onClick={() => handleOptionSelect("sent")}>Sent</button>
          </Box>
        ) : (<></>)}
        <div className="notifications-component">
          {(windowWidth >= 600) ? (
            <Sidebar onSelect={handleOptionSelect} />
          ) : (<></>)}
          <Content selectedOption={selectedOption} />
        </div>
      </div>
    );
}

export default NotificationsComponent;
