import React, { createRef }from "react"
import { useState, useContext, useEffect } from "react";
import Header from "../../Components/header/Header";
import { AuthUserContext, withAuthorization } from "../../Session";
import Sidebar from "./Sidebar";
import { Link, useParams } from "react-router-dom";
import ReactFileReader from "react-file-reader";
import { getFile, uploadFileWrapper } from "./Utils";
import FirebaseContext from "../../Firebase/context";
import "./GeneralStyles.scss";
import { onDownloadFiles } from "./Utils";
import { verifyTeacherCourse } from "../AuthUtils";

function Syllabus() {
    const firebase = useContext(FirebaseContext);
    const downloadRef = createRef<HTMLAnchorElement>();
    const [files, setFiles] = useState([]);
    const courseId = useParams()['id']
    const user = (useContext(AuthUserContext) as any)
    const [veri, setVeri] = useState(true)

    const uploadHandler = async (para_files: any) => {
        try {
          await uploadFileWrapper(para_files, setFiles, firebase, courseId, 'syllabus',files.length?files[0].path:'');
        } catch (ex) {
          console.log(ex);
        }
        window.location.reload()
    }

    useEffect(() => {
        verifyTeacherCourse(user.email,courseId,setVeri)
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
                <div className="main-view">
                    <ReactFileReader
                        fileTypes={["*"]}
                        multipleFiles={false}
                        handleFiles={uploadHandler}
                    >
                        <button className="UploadFile waves-effect waves-light btn globalbtn">
                            <i className="material-icons right">cloud_upload</i>
                            Upload Syllabus File
                        </button>
                    </ReactFileReader>

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
export default withAuthorization(authCondition)(Syllabus as any) as any;