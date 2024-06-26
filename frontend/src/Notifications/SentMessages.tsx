
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
import CreatableSelect from 'react-select/creatable';
import {getUsers, saveMessagesToDatabase} from './NotificationsUtils';
import * as constants from "../constants";
import SendMessagePopUp from './SendMessagePopUp';
import ReactDOM from "react-dom";




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
    const [isSendMessageModalOpen, setSendMessageModalOpen] = useState(false);
    const [areMessagesLoaded, setAreMessagesLoaded] =useState(false);
    const [message, setMessage] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [messagesSent , setMessagesSent] = useState([]);
    const [maxRecieversAlert, displayMaxRecieversAlert] = useState(false);
    
    const [isShowMessageModalopen, setIsShowMessageModalopen] = useState(false);
    const [isAttachLinkModalOpen, setIsAttachLinkModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(-1);
    const [selectedMessagesIds, setselectedMessagesIds] = useState([]);
    const [paginationIndexes, setPaginationIndexes] = useState({low:0,high:constants.MAXIMUM_MESSAGES_PER_PAGE});

    const [isSendMailModalopen, setSendMailModalopen] = useState(false);


 
   
 
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
          
          const sortedMessagesSent = sentMessages.sort((a, b) => b.timestamp - a.timestamp);

          setMessagesSent(sortedMessagesSent);
          setAreMessagesLoaded(true);
        });
    

        return unsubscribe;
     
        } else {
          setMessagesSent([]);
          setAreMessagesLoaded(true);
          console.log('User not found');
          return null;
        }
      }catch (error) {
          console.error('Error fetching user data:', error);
          throw error;
      }
    };

    const onDeleteMessages = async() =>{
      
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

    const openSendMessageModal = async () =>{
      
      let usersData = users;
      if(users.length == 0){
        const users = await getUsers() as any;
        
        usersData = users.map((user) =>{ return {value:user.id , label: user.name}})
        setUsers(usersData);  
      }
      const sendMessagePopUp = <SendMessagePopUp usersData = {usersData} firebase={firebase}></SendMessagePopUp>;
      const appSelector = document.querySelector('.App');
      // Render the React component inside the modal
      const container = document.createElement('div');
      appSelector.appendChild(container);
      
      // Render the SendMessagePopUp component into the container element
      ReactDOM.render(sendMessagePopUp, container);
      
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

    const onPaginationPrevClick = () => {

      const messagesAllowed = constants.MAXIMUM_MESSAGES_PER_PAGE;
      const highIndex = paginationIndexes.low;
      const lowIndex = paginationIndexes.low-messagesAllowed < 0 ? 0 : paginationIndexes.low-messagesAllowed;

      setPaginationIndexes({low:lowIndex, high:highIndex});
    }

  const onPaginationNextClick = () => {
      const messagesAllowed = constants.MAXIMUM_MESSAGES_PER_PAGE;
      const lowIndex = paginationIndexes.high;
      const highIndex = paginationIndexes.high+messagesAllowed > messagesSent.length ? messagesSent.length : paginationIndexes.high+messagesAllowed;

      setPaginationIndexes({low:lowIndex, high:highIndex});

  }

  const parseAndSplitHTML = (htmlContent) => {  
    const parser = new DOMParser();
    const parsedDocument = parser.parseFromString(htmlContent, 'text/html');
    const textContent = parsedDocument.body.textContent || '';
    const words = textContent.trim().split(/\s+/);
    return words;
  }

  const formatMessage = (msg) =>{
    const words = parseAndSplitHTML(msg);
    return words.length > 3  ? words.slice(0, 3).join(' ').concat(" ...") : words.join(' ');
  }
  return (
          <div className="sent-content">
            {/* {sendMessageModal()} */}
            {displayMessageModal()}
            {/* {attachLinkModal()} */}
            <h3>Messages Sent</h3>
            {!areMessagesLoaded ? <h6>Loading</h6> : 
              <>
                <div>
                  <button key="delete-msg" className="delete-msgs waves-effect waves-light btn globalbtn left" onClick={onDeleteMessages}>Delete Messages</button>
                  <button className="send-msg waves-effect waves-light btn globalbtn right" onClick={openSendMessageModal}>Send Message</button>
                  {/* <button className="send-email waves-effect waves-light btn globalbtn right" onClick={openSendEmailModal}> Send Email</button> */}
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
                      {messagesSent && messagesSent.length > 0 ? messagesSent && messagesSent.filter((msg, index) => index >= paginationIndexes.low && index < paginationIndexes.high).map((msg, index) => (
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
                                        {/* <div dangerouslySetInnerHTML={{ __html: msg.Message }} /> */}
                                        <div>{formatMessage(msg.Message)}</div>
                                    </td>
                            
                                </tr>
                                }
                            </React.Fragment>
                            )): 
                              <tr>
                                <td colSpan={4} style={{ textAlign: 'center' }}>No Messages</td>
                              </tr>
                            }
                    </tbody>
                  </table>
                  <button className="prev waves-effect waves-light btn globalbtn left" disabled= {paginationIndexes.low == 0} onClick={onPaginationPrevClick}>Prev</button>
                  <button className="next waves-effect waves-light btn globalbtn right" disabled = {paginationIndexes.high >= messagesSent.length} onClick={onPaginationNextClick}>Next</button>
                </div>
              </>
            }
          </div>
    )

}

export default SentMessagesComponent;