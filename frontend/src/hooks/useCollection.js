import { useEffect, useState, useContext,useRef } from "react"
import FirebaseContext from "../Firebase/context"


export const useCollection = (collection) => {
  const firebase = useContext(FirebaseContext);
  const [documents, setDocuments] = useState(null)
  const [error, setError] = useState(null)  

  useEffect(() => {
    const ref = firebase.firestore.collection(collection);

    const unsubscribe = ref.onSnapshot(snapshot => {
      let results = []
      snapshot.docs.forEach(doc => {
        results.push({...doc.data(), id: doc.id})
      });
      // update state
      setDocuments(results)
      setError(null)

    }, error => {
      console.log(error)
      setError('could not fetch the data')
    })
    // unsubscribe on unmount
    return () => unsubscribe()

  }, [collection])
  
  return { documents, error }
}