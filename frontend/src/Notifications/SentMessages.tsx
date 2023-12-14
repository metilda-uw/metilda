
import React, { Component, useContext, useEffect, useState } from "react";
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
import FirebaseContext from "../Firebase/context";
import './SentMessages.scss';
import { NotificationManager } from "react-notifications";
import Select from 'react-select'
import {getUsers} from './NotificationsUtils';




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

const SentMessagesComponent = () =>{
    const firebase = useContext(FirebaseContext);
    const timestamp = firebase.timestamp;
    const [users, setUsers] = useState([]);
    const [isSendMeassageModalOpen, setSendMeassageModalOpen] = useState(false);
    const [areMessagesLoaded, setAreMessagesLoaded] =useState(false);
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [messagesSent , setMessagesSent] = useState([]);
    
    const [isShowMessageModalopen, setIsShowMessageModalopen] = useState(false);
    const [isAttachLinkModalOpen, setIsAttachLinkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(-1);
    const [selectedMessagesIds, setselectedMessagesIds] = useState([]);
 
   
 
    const onToggleSelect = (id) => {
         if (selectedMessagesIds.includes(id)) {
         setselectedMessagesIds(selectedMessagesIds.filter((msgId) => msgId !== id));
         } else {
         setselectedMessagesIds([...selectedMessagesIds, id]);
         }
    };

    const handleSelectAll = () => {
        if (selectedMessagesIds.length === messagesSent.length) {
            setselectedMessagesIds([]);
        } else {
            const Ids = [];
            for (let i = 0; i < messagesSent.length; i++) {
              Ids.push(messagesSent[i].id);
            }
            setselectedMessagesIds(Ids);
        }
    };
 
    const isRowSelected = (id) => selectedMessagesIds.includes(id);
 

    useEffect(()=>{
      let unsubscribe;
        
       const fetchUsersData = async() =>{
            const unsubscribePromise = getMessages();
            unsubscribe = await unsubscribePromise;
        };

       fetchUsersData();
       
       return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
    },[])

    

    const sendMessage = async () =>{
      setSendMeassageModalOpen(true);
      if(users.length == 0){
        const users = await getUsers() as any;
        console.log("users data in ", users);
        const userData = users.map((user) =>{ return {value:user.id , label: user.name}})
        setUsers(userData);
      }

      
    };

    const getMessages = async () =>{
      try {
        const currentUser = firebase.auth.currentUser && firebase.auth.currentUser.email;
        if(currentUser == null || currentUser == undefined) return;
        
        // Get user data from the "Messages" collection
        const userDoc = await firebase.firestore.collection('Messages').doc(currentUser).get();
    
        if (userDoc.exists) {
          // User data exists
          const userData = userDoc.data();
    
          // Get data from the "sent" subcollection
          const sentCollection = await firebase.firestore.collection('Messages').doc(currentUser).collection('Sent');
          
         // Get data from the "sent" subcollection
         const unsubscribe = sentCollection.onSnapshot((snapshot) => {
          const sentMessages = snapshot.docs.map((doc) => {
              const newObj = {...doc.data(), id: doc.id};
              return newObj
          });
          console.log("received data", sentMessages);
          const sortedMessagesSent = sentMessages.sort((a, b) => b.timestamp - a.timestamp);

          setMessagesSent(sortedMessagesSent);
          setAreMessagesLoaded(true);
        });
    

        return unsubscribe;
     
        } else {
          console.log('User not found');
          return null;
        }
      }catch (error) {
          console.error('Error fetching user data:', error);
          throw error;
      }
    };

    const onDeleteMessages = async() =>{
      console.log("On messages delete");
      if(selectedMessagesIds.length > 0){
          const currentUser = firebase.auth.currentUser && firebase.auth.currentUser.email;

          if(currentUser == null || currentUser == undefined) return;
          const collectionRef = firebase.firestore.collection('Messages').doc(currentUser).collection('Sent');
          const batch = firebase.firestore.batch();

          const documentsToDelete = selectedMessagesIds;
          if(documentsToDelete.length > 0){
              documentsToDelete.forEach((docId) => {
                  const docRef = collectionRef.doc(docId);
                  batch.delete(docRef);
              });
  
              await batch.commit();
                
              setselectedMessagesIds([]);
              NotificationManager.success(
                  "Messages deleted successfully"
              );

          }
      }
    }

    

    const closeSendMessageModal = () =>{
        setSendMeassageModalOpen(false);
    }

    const onSendMesageClick = async () =>{
        console.log("message :: " + message);

        setSendMeassageModalOpen(false);

        if(!message || !selectedUser){

          return;
        }
        

        const recipientDoc = await firebase.firestore.collection('Messages').doc(selectedUser).get();

        if (!recipientDoc.exists) {
          // If the recipient user does not exist, create a new user with "sent" and "received" collections
          await firebase.firestore.collection('Messages').doc(selectedUser).set({
          });
        }
        let newMsg = message;
        
        // Store the message in the "sent" collection of the sender
        await firebase.firestore.collection('Messages').doc(selectedUser).collection('Received').add({
          Message: newMsg,
          timestamp: timestamp.fromDate(new Date()),
          From: firebase.auth.currentUser.email,
          isRead:false
        });

        const sentDoc = await firebase.firestore.collection('Messages').doc(firebase.auth.currentUser.email).get();

        if (!sentDoc.exists) {
          // If the recipient user does not exist, create a new user with "sent" and "received" collections
          await firebase.firestore.collection('Messages').doc(firebase.auth.currentUser.email).set({
          });

        }

        await firebase.firestore.collection('Messages').doc(firebase.auth.currentUser.email).collection('Sent').add({
          Message: newMsg,
          timestamp: timestamp.fromDate(new Date()),
          to: selectedUser
        });
        
        const newMessages = [{
          Message: newMsg,
          timestamp: timestamp.fromDate(new Date()),
          to: selectedUser
        }, ...messagesSent];
        
        const sortedMessagesSent = newMessages.sort((a, b) => b.timestamp - a.timestamp);
        setMessagesSent(sortedMessagesSent);


        setMessage("");
        setSelectedUser("");

        NotificationManager.success(
          "Message sent successfully"
      );

        console.log('Message sent successfully!');
    }
    const handleMessageChange = (event) => {
        setMessage(event.target.innerHTML);
    };

    const handleUserChange = (event) =>{
        setSelectedUser(event.value);
    }


    const handleAttachLink = (data) =>{

      const linkText = data.linkText ? data.linkText : "link";
      const link = data.link;

      if(!link){
        closeAttachLinkModal();
        return;
      }
      
      let newMsg = message;
      newMsg += '&nbsp <a href="' + link + '" target="_blank">' + linkText + '</a>';
      setMessage(newMsg);
      closeAttachLinkModal();
    }

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
              <p className="dialog-title">Send Message</p>
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
    }

    const showAttachLinkModal = () =>{
      setIsAttachLinkModalOpen(true);
    }

    const closeAttachLinkModal = () =>{
      setIsAttachLinkModalOpen(false);
    }

    const sendMessageModal = () => {
        return (
          <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={isSendMeassageModalOpen}
            onClose={closeSendMessageModal}
            aria-labelledby="form-dialog-title"
            className="send-msg-modal"
          >
            <DialogTitle
              id="alert-dialog-title"
              onClose={closeSendMessageModal}
            >
              <p className="dialog-title">Send Message</p>
            </DialogTitle>
            <DialogContent>
                <div className="send-msg-modal-content">
                  {users.length == 0 ? <p> Loading</p>:
                  <>
                    <div className="users-dropdown">
                      <label htmlFor="user-list" className="select-label">Select User:</label>
                      
                      <Select className="users-list"
                        value={users.find((user) => user.value === selectedUser)}
                        onChange={handleUserChange}
                       options={users} isSearchable/>

                    </div>
                    
                    <div
                      className="message-content"
                      contentEditable
                      dangerouslySetInnerHTML={{ __html: message }}
                      onBlur={handleMessageChange}
                    />
                    
                    <button className="attach-link waves-effect waves-light btn globalbtn left" onClick={showAttachLinkModal}>Attach Link</button>
                  </>   
                  }
                </div>
                
                
            </DialogContent>
            <DialogActions>
              <button
                className="sendMsg waves-effect waves-light btn globalbtn"
                onClick={onSendMesageClick}
              >
                Send
              </button>
            </DialogActions>
          </Dialog>
        );
    };

    const displayMessageModal = () =>{
      if(selectedRow < 0 || selectedRow >= messagesSent.length) return;

      const msg = messagesSent[selectedRow] && messagesSent[selectedRow].Message;
      return (
        <Dialog
            fullWidth={true}
            maxWidth="sm"
            open={isShowMessageModalopen}
            onClose={closeDisplayMessageModal}
            aria-labelledby="form-dialog-title"
            className="show-message-modal"
          >
            <DialogTitle
              id="alert-dialog-title"
              onClose={closeDisplayMessageModal}
            >
              <p className="dialog-title">
              Message
              </p> 
            </DialogTitle>
            <DialogContent>
            <div dangerouslySetInnerHTML={{ __html: msg }} />
            </DialogContent>
        </Dialog>

      );

    };

    const openDisplayMessageModal = (index) => {
      setSelectedRow(index);
      setIsShowMessageModalopen(true);
    }

    const closeDisplayMessageModal = () =>{
      setIsShowMessageModalopen(false);
    }

    return (
          <div className="sent-content">
            {sendMessageModal()}
            {displayMessageModal()}
            {attachLinkModal()}
            <h3>Messages Sent</h3>
            {!areMessagesLoaded ? <h6>Loading</h6> : 
              <>
                <div>
                  <button key="delete-msg" className="delete-msgs waves-effect waves-light btn globalbtn left" onClick={onDeleteMessages}>Delete Messages</button>
                  <button className="send-msg waves-effect waves-light btn globalbtn right" onClick={sendMessage}>Send Message</button>
                </div>
                <div className="inbox-content">
                  <table>
                    <thead>
                      <tr>
                        <th className="checkbox">Select All <input type="checkbox" onChange={handleSelectAll} checked={selectedMessagesIds.length != 0 && selectedMessagesIds.length === messagesSent.length} /></th>
                        <th>Date</th>
                        <th>To</th>
                        <th>Message</th>  
                      </tr>
                    </thead>
                    <tbody>
                      {messagesSent && messagesSent.map((msg, index) => (
                            <React.Fragment key={msg.id}>    
                              { msg.Message != undefined &&  <tr >
                                    <td className="checkbox">
                                        <input
                                            key={`checkbox-${msg.id}`} 
                                            type="checkbox"
                                            onChange={() => onToggleSelect(msg.id)}
                                            checked={isRowSelected(msg.id)}
                                        />
                                    </td>
                                    <td>{msg.timestamp.toDate().toLocaleDateString()}</td>
                                    <td>{msg.to}</td>
                                    <td className="message" onClick={() => openDisplayMessageModal(index)}>
                                        <div dangerouslySetInnerHTML={{ __html: msg.Message }} />
                                    </td>
                            
                                </tr>
                                }
                            </React.Fragment>
                            ))}
                    </tbody>
                  </table>
                </div>
              </>
            }
          </div>
    )

}

export default SentMessagesComponent;