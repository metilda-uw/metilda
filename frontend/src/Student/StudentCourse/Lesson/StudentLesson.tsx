import React, { createRef } from "react"
import { useState, useContext, useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../StudentSidebar";
import { useParams } from "react-router-dom";
import draftToHtml from 'draftjs-to-html';
import "../../../CMS/Course/GeneralStyles.scss"
import { getFile, getFileSrcDict, onDownloadFiles, onDownloadFilesFromSource, removeFileWrapper } from "../../../CMS/Course/Utils";
import { FirebaseContext } from "../../../Firebase";
import { verifyStudentCourse } from "../../../CMS/AuthUtils";
import PitchArtblock from "../../../CMS/Course/Lesson/PitchArtBlock";


export function StudentLesson() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const lessonId = useParams()['lesson_id']
    const [title,setTitle] = useState('')
    const [content, setContent] = useState([])
    const blockList=content
    const firebase = useContext(FirebaseContext)
    const downloadRef = createRef<HTMLAnchorElement>();
    const [fileSrcDict, setFileSrcDict] = useState({})

    const history = useHistory()

    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('lesson', lessonId);
            try {
                let response = await fetch('/student-view/lessons/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setTitle(response['name'])
                setContent(response['content'])

                let temp2 = {}
                for (let x of response['content']) {
                    if (x.type === 'image' || x.type === 'file' || x.type === 'audio' || x.type === 'video') {
                        await getFileSrcDict(firebase,temp2,x.id,`/cms/lesson/block/file/read/${courseId}/lesson-block/${x.id}`)
                    }
                }
                setFileSrcDict(temp2)
            }
            catch {}
        }
        if (user) {
            fetchData()
        }
    },[user,])

    function makeProps(wordId){
        return {
            pitchart: wordId,
            firebase: firebase || undefined,
            history: history || undefined,
            location: undefined,
            match: undefined,
        };
    }

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>
    }
    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view centered">
                    <div className="info-list">
                        <div className='title'>{title}</div>
                        {blockList.length ?
                            <div className="blocks">
                                {blockList.map((block, index) => {
                                    if (block.type === 'text'){
                                        return (
                                            <div key={block.id} className="lesson-block">
                                                <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(block.content)) }}></div>
                                            </div>
                                        )
                                    }
                                    else if (block.type === 'image') {
                                        return (
                                            <div key={block.id} className="lesson-block">
                                                <div style={{'textAlign':'center'}}><img src={fileSrcDict[block.id]} alt="Loading"></img></div>
                                            </div>
                                        );
                                    }
                                    else if (block.type === 'pitchart') {
                                        return (
                                            <div className="lesson-block">
                                                <div><PitchArtblock collectionUUID={block.content.split(' ')[0]} wordId={block.content.split(' ')[1]}></PitchArtblock> </div>
                                            </div>
                                        );
                                    }
                                    else if (block.type === 'file') {
                                        return (
                                            <div className="lesson-block">
                                                <a className="hide" ref={downloadRef} target="_blank">
                                                    Hidden Download Link
                                                </a>

                                                <div><b>File:</b> <u className="download-link" onClick={() => onDownloadFilesFromSource(fileSrcDict[block.id],block.content,downloadRef)}>{fileSrcDict[block.id]?block.content:'Loading...'}</u></div>
                                            </div>
                                        )
                                    }
                                    else if (block.type === 'audio') {
                                        return (
                                            <div className="lesson-block">
                                                <div style={{ 'textAlign': 'center' }}><audio src={fileSrcDict[block.id]} controls></audio></div>
                                            </div>
                                        );
                                    }
                                    else if (block.type === 'video') {
                                        return (
                                            <div className="lesson-block">
                                                <div style={{ 'textAlign': 'center' }}><video className="lesson-video" src={fileSrcDict[block.id]} controls></video></div>
                                            </div>
                                        );
                                    }
                                })
                                }
                            </div>
                        :null}
                        <Link className="content-link" to={'/student-view/course/'+courseId+'/lessons'}>Back</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentLesson as any) as any;