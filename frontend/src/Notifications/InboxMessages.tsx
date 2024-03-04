
import React, { Component, useContext, useEffect, useState } from "react";
import './InboxMessages.scss';
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
import * as constants from "../constants";

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

const InboxMessages = () =>{
    const firebase = useContext(FirebaseContext);
    const [MessagesReceived, setMessagesReceived] = useState([]);
    const [areMessagesLoaded, setAreMessagesLoaded] =useState(false);
    const [selectedMessagesIds, setselectedMessagesIds] = useState([]);
    const [isShowMessageModalopen, setIsShowMessageModalopen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(-1);
    const [paginationIndexes, setPaginationIndexes] = useState({low:0,high:constants.MAXIMUM_MESSAGES_PER_PAGE});
  

    const onToggleSelect = (id) => {
        if (selectedMessagesIds.includes(id)) {
        setselectedMessagesIds(selectedMessagesIds.filter((msgId) => msgId !== id));
        } else {
        setselectedMessagesIds([...selectedMessagesIds, id]);
        }
    };
    const handleSelectAll = () => {
        if (selectedMessagesIds.length === MessagesReceived.length) {
            setselectedMessagesIds([]);
        } else {
            const ids = [];
            for (let i = 0; i < MessagesReceived.length; i++) {
                ids.push(MessagesReceived[i].id);
            }
            setselectedMessagesIds(ids);
        }
    };

    const isRowSelected = (id) => selectedMessagesIds.includes(id);

    useEffect(()=>{

        let unsubscribe = null;
        const fetchData = async () => {
            // Call getMessages to start listening for updates
            const unsubscribePromise = getMessages();
            unsubscribe = await unsubscribePromise;
        };
      
        fetchData();
      
        // Cleanup function to unsubscribe when the component unmounts
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };

    },[])

    const getMessages =  async () =>{
        try {
            const currentUser = firebase.auth.currentUser && firebase.auth.currentUser.email;
            if(currentUser == null || currentUser == undefined) return;
         
          // Get user data from the "Messages" collection
          const userDoc =  await firebase.firestore.collection('Messages').doc(currentUser).get();
      
          if (userDoc.exists) {
            // User data exists
            const userData = userDoc.data();
            const receivedCollection =  await firebase.firestore.collection('Messages').doc(currentUser).collection('Received');
      
            // Get data from the "sent" subcollection
            const unsubscribe = receivedCollection.onSnapshot((snapshot) => {
                const receivedMessages = snapshot.docs.map((doc) => {
                    const newObj = {...doc.data(), id: doc.id};
                    return newObj
                });
                console.log("received data", receivedMessages);

                const sortedMessagesReceived = receivedMessages.sort((a, b) => b.timestamp - a.timestamp);
        
                setMessagesReceived(sortedMessagesReceived);
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
        // console.log("On messages delete");
        if(selectedMessagesIds.length > 0){
            const currentUser = firebase.auth.currentUser && firebase.auth.currentUser.email;
            if(currentUser == null || currentUser == undefined) return;
            const collectionRef = firebase.firestore.collection('Messages').doc(currentUser).collection('Received');
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

    const displayMessageModal = () =>{
        if(selectedRow < 0 || selectedRow >= MessagesReceived.length) return;
  
        const msg = MessagesReceived[selectedRow] && MessagesReceived[selectedRow].Message;
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
                <p className="dialog-title">Message</p>
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

    const closeDisplayMessageModal = async() =>{
        console.log("meessage: ", MessagesReceived[selectedRow]);
        const id =  MessagesReceived[selectedRow].id;
        const currentUser = firebase.auth.currentUser && firebase.auth.currentUser.email;
        const updatedData = {...MessagesReceived[selectedRow], isRead:true};
        setIsShowMessageModalopen(false);
        await firebase.firestore.collection('Messages').doc(currentUser).collection('Received').doc(id).update(updatedData)
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
        const highIndex = paginationIndexes.high+messagesAllowed > MessagesReceived.length ? MessagesReceived.length : paginationIndexes.high+messagesAllowed;

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
        <div className="inbox-content">
            {displayMessageModal()}
            <h3>Inbox</h3>
            {!areMessagesLoaded ? <h6>Loading</h6> :<>
                <button key="delete-msg" className="delete-msgs waves-effect waves-light btn globalbtn left" onClick={onDeleteMessages}>Delete Messages</button>
          
                {/* <p>{MessagesReceived.length} </p> */}
                <table>
                    <thead>
                        <tr>
                            <th className="checkbox">Select All <input type="checkbox" onChange={handleSelectAll} checked={selectedMessagesIds.length != 0 && selectedMessagesIds.length === MessagesReceived.length} /></th>
                            <th>Date</th>
                            <th>From</th>
                            <th>Message</th>    
                        </tr>
                    </thead>
                    <tbody>
                        {MessagesReceived && MessagesReceived.filter((msg, index) => index >= paginationIndexes.low && index < paginationIndexes.high).map((msg, index) => (
                            <React.Fragment key={msg.id}>
                               { msg.Message != undefined && 
                                    <tr >
                                        <td className="checkbox">
                                            <input
                                                key={`checkbox-${msg.id}`}
                                                type="checkbox"
                                                onChange={() => onToggleSelect(msg.id)}
                                                checked={isRowSelected(msg.id)}
                                            />
                                        </td>
                                        <td>{msg.timestamp.toDate().toLocaleDateString()}</td>
                                        <td>{msg.From}</td>
                                        <td className={!msg.isRead ? "message read" : "message"} onClick={() => openDisplayMessageModal(index)}>
                                            {/* <div dangerouslySetInnerHTML={{ __html: msg.Message }} /> */}
                                            <div>{formatMessage(msg.Message)}</div>
                                        </td>
                                    </tr>
                                }
                            </React.Fragment>
                        ))}
                        
                    </tbody>
                    
                </table>

                <button className="prev waves-effect waves-light btn globalbtn left" disabled= {paginationIndexes.low == 0} onClick={onPaginationPrevClick}>Prev</button>
                <button className="next waves-effect waves-light btn globalbtn right" disabled = {paginationIndexes.high >= MessagesReceived.length} onClick={onPaginationNextClick}>Next</button>
            </>}
            
        </div>
    )

}

export default InboxMessages;