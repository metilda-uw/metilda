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
import { getFile} from "../../CMS/Course/Utils";
import { onDownloadFiles } from "../../CMS/Course/Utils";
import "../../CMS/Course/GeneralStyles.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";

function StudentSyllabus() {
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [files, setFiles] = useState([]);
    const courseId = useParams()['id']
    const [veri, setVeri] = useState(true)
    const user = (useContext(AuthUserContext) as any)


    useEffect(() => {
        verifyStudentCourse(user.email,courseId,setVeri)
        getFile(firebase,setFiles,`/file/read/${courseId}/syllabus`)
    },[])


    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        <a className="hide" ref={downloadRef} target="_blank">
                            Hidden Download Link
                        </a>

                        {/* <div>Files: {JSON.stringify(files)}</div> */}
                        <div><b>Syllabus file:</b> <u className="download-link" onClick={()=>onDownloadFiles(files,downloadRef,firebase)}>{files.length ? files[0].name : null}</u></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentSyllabus as any) as any;