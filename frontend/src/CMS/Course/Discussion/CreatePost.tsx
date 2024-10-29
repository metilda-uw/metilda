import React, { useState, useContext, useEffect } from "react";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from ".././Sidebar";
import { useParams } from "react-router-dom";
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "../GeneralStyles.scss";
import { useHistory } from "react-router-dom";
import "./Discussion.scss";

export function CreatePost() {
    const user = useContext(AuthUserContext) as any;
    const courseId = useParams()['id'];
    const topicId = useParams()['topic_id'];

    const history = useHistory();
    
    const [contentState, setContentState] = useState();
    const [newTitle, setNewTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    async function onSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('title', newTitle);
        formData.append('content', JSON.stringify(contentState));
        formData.append('author', user.email);
        formData.append('topic', topicId);
        const newDate = new Date();
        formData.append('created_at', newDate.getUTCFullYear() + '-' + (Number(newDate.getUTCMonth()) + 1) + '-' + newDate.getUTCDate() + ' '
            + newDate.getUTCHours() + ':' + newDate.getUTCMinutes() + ':' + newDate.getUTCSeconds());

        setTimeout(async () => {
            try {
                await fetch('/cms/posts/create', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                });
                history.push('/content-management/course/' + courseId + '/discussion/topic/' + topicId);
            } catch (error) {
                setErrorMessage("Error creating post. Please try again.");
            }
        }, 1000);
    }

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    <div className="info-list">
                        {errorMessage && <div className="error-message">{errorMessage}</div>}
                        <form onSubmit={onSubmit}>
                            <div><b>Title:</b> <input className="new-title" onChange={(e) => setNewTitle(e.target.value)} required maxLength={30}></input></div>
                            <Editor
                                onContentStateChange={setContentState}
                                wrapperClassName="editor-wrapper"
                                editorClassName="editor-content"
                                toolbarClassName="editor-toolbar"
                                stripPastedStyles={true}
                            >
                            </Editor>
                            <div><button type="submit" className='btn waves-light globalbtn'>Create</button></div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(CreatePost as any) as any;
