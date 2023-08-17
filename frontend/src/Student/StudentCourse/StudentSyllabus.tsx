import React, { createRef }from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import { FirebaseContext } from "../../Firebase";
import { getSyllabusFile } from "../../CMS/Utils";
import { onDownloadFiles } from "../../CMS/Utils";
import "../../CMS/Course/GeneralStyles.scss"

function StudentSyllabus() {
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [files, setFiles] = useState([]);
    const courseId=useParams()['id']

    useEffect(() => {
        getSyllabusFile(firebase,setFiles,courseId)
    }, [files.length])


    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="main-view">
                    <a className="hide" ref={downloadRef} target="_blank">
                        Hidden Download Link
                    </a>

                    {/* <div>Files: {JSON.stringify(files)}</div> */}
                    <div>Syllabus file: <u className="download-link" onClick={()=>onDownloadFiles(files,downloadRef,firebase)}>{files.length ? files[0].name : null}</u></div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentSyllabus as any) as any;