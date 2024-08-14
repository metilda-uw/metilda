
import React, { Component, useContext, useEffect, useState } from "react";
import FirebaseContext from "../Firebase/context";
import { NotificationManager } from "react-notifications";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import InfoIcon from '@material-ui/icons/InfoRounded';
import * as constants from "../constants";
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import Tooltip from '@material-ui/core/Tooltip';
import './SendMessagePopUp.scss';
import {saveMessagesToDatabase} from './NotificationsUtils';

const styles = (theme: Theme) =>
        createStyles({
            root: {
            margin: 0,
            padding: theme.spacing(2),
            },
            closeButton: {
            position: "absolute",
            right: theme.spacing(1),
            top: theme.spacing(1),
            color: theme.palette.grey[500],
            },
});

interface DialogTitleProps extends WithStyles<typeof styles> {
    id: string;
    children: React.ReactNode;
    onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
    const { children, classes, onClose, ...other } = props;
    return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
        <Typography variant="h6">{children}</Typography>
        {onClose ? (
        <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
        >
            <CloseIcon />
        </IconButton>
        ) : null}
    </MuiDialogTitle>
    );
});


const SendMessagePopUp = (props) => {
    const [activeTab, setActiveTab] = useState(0); // State to manage active tab
    const [openMessagePopUp, setMessagePopUp] = useState(true);
    const [isAttachLinkModalOpen, setIsAttachLinkModalOpen] = useState(false);
    const [maxRecieversAlert, displayMaxRecieversAlert] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [message, setMessage] = useState("");

    
    const users = props && props.usersData;
    const firebase = props.firebase;
    const timestamp = firebase.timestamp;

    let tooltipContent = activeTab == 0 ? constants.SEND_MSG_TOOLTIP_CONTENT : constants.SEND_EMAIL_TOOLTIP_CONTENT;

    const attachLinkModal = () =>{
        return (
          <Dialog
              fullWidth={true}
              maxWidth="sm"
              open={isAttachLinkModalOpen}
              onClose={closeAttachLinkModal}
              aria-labelledby="form-dialog-title"
              className="attach-link-modal"
            >
              <DialogTitle
                id="alert-dialog-title"
                onClose={closeAttachLinkModal}
              >
                <p className="dialog-title">Attach Link</p>
              </DialogTitle>
              <DialogContent className="attach-link-content">
                <div>
                  <label className="text">Text to Display: </label>
                  <input id="link-text" type="text" defaultValue=""/>
                </div>
  
                <div>
                  <label className="link">Link: </label>
                  <input id="link" type="text" defaultValue="" />
                </div>
              </DialogContent>
              <DialogActions>
                <button
                  className="add-link waves-effect waves-light btn globalbtn"
                  onClick={()=>{
                    const linkText = (document.getElementById('link-text') as HTMLInputElement).value;
                    const link = (document.getElementById('link') as HTMLInputElement).value;
                    handleAttachLink({ linkText, link });
                   }}
                >
                  Add Link
                </button>
              </DialogActions>
          </Dialog>
        );
      };
  
      const showAttachLinkModal = () =>{
        setIsAttachLinkModalOpen(true);
      };
  
      const closeAttachLinkModal = () =>{
        setIsAttachLinkModalOpen(false);
      };
 

    const closeSendMessagePopUp = () => {
        // Define logic to close the modal
        setMessage("");
        setSelectedUsers([] as any);
        setMessagePopUp(false);
    };

    const sendMessage = async() =>{
        if(!message || selectedUsers.length == 0){
            return;
        }
        if(selectedUsers.length > constants.MAXIMUN_RECIPIENTS_ALLOWED){
        displayMaxRecieversAlert(true);
        return;
        }
        setMessagePopUp(false);

        // send as message
        if(activeTab == 0){
            await saveMessage();
        }else{
            // send as an email

            const receivers = selectedUsers.map((user) => user.value);
            const currentUser = users.find((user) => user.value == firebase.auth.currentUser.email);

            const name = currentUser != undefined ? currentUser.label : 'MeTILDA User';
            const subject = "Message from "+ name + " : DO NOT REPLY";

            const formData = new FormData();
            formData.append("receivers", receivers.join(','));
            formData.append("message", message);
            formData.append("subject", subject);

            const response = await fetch(`/api/send-email`, {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            });
            const body = await response.json();
          
            if(body && body.isMessageSent){
                await saveMessage();
            }
        }

    };

    const saveMessage = async() =>{
        try{
            const data = {firebase:firebase,timestamp :timestamp,selectedUsers:selectedUsers,message:message};
            const messages =   await saveMessagesToDatabase(data);
    
            setMessage("");
            setSelectedUsers([] as any);
    
              NotificationManager.success(
                "Message sent successfully"
              );
            }catch(e){
              NotificationManager.error('Messages sending failed');
            }
    };

    const tabs = [
        { name: 'Send Message', heading: 'Send Message' },
        { name: 'Send Email', heading: 'Send Email' },
    ];

    const handleTabChange = (index) => {
        setMessage("");
        setSelectedUsers([] as any);
        tooltipContent = index == 0 ? constants.SEND_MSG_TOOLTIP_CONTENT : constants.SEND_EMAIL_TOOLTIP_CONTENT;
        setActiveTab(index);

    };

    const handleUserChange = (event) =>{
        console.log("event",event);

        if(event == null) {
            setSelectedUsers([]);
            return;
        }

        setSelectedUsers(event);
  
        if(event && event.length > constants.MAXIMUN_RECIPIENTS_ALLOWED){
          displayMaxRecieversAlert(true);
        } else {
          displayMaxRecieversAlert(false);
        }
    };
  
    const handleOptionCreation = (event) => {
        console.log(event);
        const newOption = {value : event , label: event }
        setSelectedUsers([...selectedUsers, newOption]);
    };

    const handleMessageChange = (event) => {
        setMessage(event.target.innerHTML);
    };

    const handleAttachLink = (data) => {

        const linkText = data.linkText ? data.linkText : "link";
        const link = data.link;

        if(!link){
            closeAttachLinkModal();
            return;
        }
        
        let newMsg = message;
        newMsg += ' <a href="' + link + '" target="_blank">' + linkText + '</a>';
        setMessage(newMsg);
        closeAttachLinkModal();
    };

    return (
        <>
        {attachLinkModal()}
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={openMessagePopUp}
            onClose={closeSendMessagePopUp}
            aria-labelledby="form-dialog-title"
            className="send-msg-modal"
        >
            <DialogTitle
                id="alert-dialog-title"
                onClose={closeSendMessagePopUp}
            >
                <p>{tabs[activeTab].heading}</p>
            </DialogTitle>
            <DialogContent>
                
                {maxRecieversAlert && <p> The maximum number of recipients allowed is {constants.MAXIMUN_RECIPIENTS_ALLOWED}.</p>}
                <div className="Info-tooltip-container">
                  <Tooltip className="Info-tooltip right" title={<p className="tooltip-content">{tooltipContent}</p>}
                    placement="top" arrow>
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </div>
                <div className="send-msg-modal-content">
                    <div className="tab-container">
                        {tabs.map((tab, index) => (
                            <button key={index} className={`tab-button ${activeTab === index ? 'active' : ''}`} onClick={() => handleTabChange(index)}>{tab.name}</button>
                        ))}
                    </div>
                    {users.length == 0 ? <p> Loading</p>:
                    <div className="tab-content">
                        <div className="users-dropdown">
                        <label htmlFor="user-list" className="select-label">Select User:</label>
                        {activeTab == 0 ? 
                            <Select className="users-list"
                            // value={users.find((user) => user.value === selectedUser)}
                            onChange={handleUserChange}
                            options={users} isSearchable
                            isMulti={true}/>
                            :
                                <CreatableSelect className="users-list"
                                isClearable
                                onChange={handleUserChange}
                                onCreateOption={handleOptionCreation}
                                options={users}
                                isMulti={true}
                                value={selectedUsers}
                            />
                        }
                        </div>
                        
                        <div
                        className="message-content"
                        contentEditable
                        dangerouslySetInnerHTML={{ __html: message }}
                        onBlur={handleMessageChange}
                        />
                        
                        
                    </div>   
                  }
                  <button className="attach-link waves-effect waves-light btn globalbtn left" onClick={showAttachLinkModal}>Attach Link</button>
                </div>
            </DialogContent>
            <DialogActions>
                <button className="sendMsg waves-effect waves-light btn globalbtn" onClick={sendMessage}>Send</button>
            </DialogActions>
        </Dialog>
        </>
    );
};

export default SendMessagePopUp;