export const getUsers = async () => {
    
    // Get all users
    try {
        const response = await fetch(`api/get-users`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`);
        }
      
        const body = await response.json();
      
        const userDetails = body.result.map((user: any) => {
          try {
            const newUser = {
                id: user[0],
                university: user[1],
                createdAt: user[2],
                lastLogin: user[3],
                name: user[4]
            };
            return newUser;
          } catch (error) {
            console.error(`Error fetching user roles: ${error}`);
          }
        });
        return userDetails;
      } catch (error) {
        console.error(`Error fetching users: ${error}`);
        
      }
};

export const saveMessagesToDatabase = async(data) =>{
  if(data == null || data == undefined) return;
  
  const firebase = data.firebase;
  const message = data.message;
  const selectedUsers = data.selectedUsers;
  const timestamp = data.timestamp;
  try{
    const batch = firebase.firestore.batch();
    let newMessages = [];

    for (const user of selectedUsers) {
      if (user && typeof user === 'object' && user !== null) {
          
          const userEmail = user && (user as any).value;

          let newMsg = message;

          // Store the message in the "sent" collection of the sender
          const receivedRef = firebase.firestore.collection('Messages').doc(userEmail).collection('Received').doc();
          batch.set(receivedRef, {
            Message: newMsg,
            timestamp: timestamp.fromDate(new Date()),
            From: firebase.auth.currentUser.email,
            isRead: false
          });

          const sentCollectionRef = firebase.firestore.collection('Messages').doc(firebase.auth.currentUser.email).collection('Sent');

          // Create a new document reference within the batch
          const newDocRef = sentCollectionRef.doc();

          // console.log("newDocRef :::", newDocRef);

          // Add set operation to the batch for the current selected user
          batch.set(newDocRef, {
            Message: newMsg,
            timestamp: timestamp.fromDate(new Date()),
            to: userEmail 
          });

          const newMessage = {
            Message: newMsg,
            id: newDocRef.id,
            timestamp: timestamp.fromDate(new Date()),
            to: userEmail
          };
          newMessages.push(newMessage);
      }
      
    }
    // Commit the batch
    await batch.commit();

    return newMessages;

  }catch(e){
   
  }

}