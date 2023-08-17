import React from "react"
import { useState, useContext, useEffect } from "react";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../StudentSidebar";
import { useParams } from "react-router-dom";
import { Editor } from 'react-draft-wysiwyg'
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from 'draftjs-to-html';
import { convertFromRaw } from 'draft-js';
import "../../../CMS/Course/GeneralStyles.scss"
import "../../../CMS/Course/Discussion/Discussion.scss"

export function StudentPost() {
    const repliesPerPage = 10
    const user = useContext(AuthUserContext) as any

    const [contentState, setContentState] = useState();

    const courseId = useParams()['id']
    const topicId = useParams()['topic_id']
    const postId = useParams()['post_id']

    const [postAuthor, setPostAuthor] = useState('')
    const [postTitle,setPostTitle] = useState('')
    const [postContent,setPostContent] = useState('{}')
    const [postCreated_at,setPostCreated_at] = useState('')

    const [replyListString, setReplyListString] = useState('')

    const [numPages, setNumPages] = useState(0)
    const [curPage, setCurPage] = useState(1)

    useEffect(() => {
        async function fetchData() {
            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('post', postId);
            try {
                let response = await fetch('/cms/posts/read', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                response = await response.json()
                setPostAuthor(response['author'])
                setPostTitle(response['title'])
                setPostContent(response['content'])
                setPostCreated_at(response['created_at'])
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }


            formData = new FormData();
            formData.append('user', user.email);
            formData.append('post', postId);
            try {
                await fetch('/cms/replies', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => {
                    setNumPages(Math.ceil(x.length / repliesPerPage))
                    return x
                })
                .then(x=>x.sort((a,b)=>{return (new Date(b.created_at)).getTime()-(new Date(a.created_at)).getTime()}))
                .then(JSON.stringify)
                .then(setReplyListString)
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        if (user) {
            fetchData()
        }
    }, [user,courseId,topicId,postId,replyListString])

    async function onSubmit() {
        const formData = new FormData();
        formData.append('user', user.email);
        formData.append('content', JSON.stringify(contentState))
        formData.append('author', user.email)
        formData.append('post', postId)
        const newDate=new Date()
        formData.append('created_at', newDate.getUTCFullYear() + '-' + (Number(newDate.getUTCMonth())+1) + '-' + newDate.getUTCDate() + ' '
            + newDate.getUTCHours() + ':' + newDate.getUTCMinutes()+':'+newDate.getUTCSeconds())

        try {
            await fetch('/cms/replies/create', {
                method: "POST",
                headers: {
                    Accept: "application/json"
                },
                body: formData
            })
        }
        catch (error) {
            console.log("Fetch failed, see if it is 403 in error console")
        }

        window.location.reload()
    }


    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">
                    <div>
                        <div className="post">
                            <div className="title" >{postTitle}</div>
                            <div className="author" >Author: {postAuthor}</div>
                            <div className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(postContent)) }}></div>
                            <div className="created-at">Created at: {new Date(postCreated_at).toLocaleString()}</div>
                        </div>

                        <Editor
                            onContentStateChange={setContentState}
                            wrapperClassName="editor-wrapper"
                            editorClassName="editor-content"
                            toolbarClassName="editor-toolbar"
                        >
                        </Editor>
                        <div><button onClick={onSubmit}>Reply</button></div>

                        <div>
                            {replyListString ? <div>Replies:</div> : null}
                            {replyListString?JSON.parse(replyListString).slice((curPage - 1) * repliesPerPage,curPage*repliesPerPage).map(x => (
                            <div key={x.reply} className="reply">
                                <div className="author" key={x.reply + 1}>Author: {x.author}</div>
                                <div key={x.reply + 2} className="content" dangerouslySetInnerHTML={{ __html: draftToHtml(JSON.parse(x.content)) }}></div>
                                <div className="created-at" key={x.reply+3}>Created at: {new Date(x.created_at).toLocaleString()}</div>
                            </div>
                            )):null}
                        </div>

                        {numPages ?
                            <div className='pagination'>
                                <button onClick={() => {
                                    if (curPage > 1) {
                                        setCurPage(curPage - 1)
                                    }
                                }}> &lt; </button>
                                {curPage} / {numPages}
                                <button onClick={() => {
                                    if (curPage < numPages) {
                                        setCurPage(curPage + 1)
                                    }
                                }}> &gt; </button>
                            </div>
                        : null}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentPost as any) as any;