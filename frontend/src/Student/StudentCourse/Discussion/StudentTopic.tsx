import React from "react"
import { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../StudentSidebar";
import { useParams } from "react-router-dom";
import "../../../CMS/Course/GeneralStyles.scss"
import "../../../CMS/Course/Discussion/Discussion.scss"

export function StudentTopic() {
    const postsPerPage = 10
    const user = useContext(AuthUserContext) as any

    const courseId = useParams()['id']
    const topicId=useParams()['topic_id']

    const [postListString, setPostListString] = useState('')

    const [numPages, setNumPages] = useState(0)
    const [curPage, setCurPage] = useState(1)

    useEffect(() => {
        async function fetchData() {
            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('topic', topicId);
            try {
                await fetch('/cms/posts', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x => {
                    setNumPages(Math.ceil(x.length / postsPerPage))
                    return x
                })
                .then(x=>x.sort((a,b)=>{return (new Date(b.updated_at)).getTime()-(new Date(a.updated_at)).getTime()}))
                .then(JSON.stringify)
                .then(setPostListString)
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        if (user) {
            fetchData()
        }
    }, [user,courseId,topicId,postListString])

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">
                    <div>
                        <div className="info-list">
                            {postListString?<div>Posts:</div>:null}
                            {postListString?JSON.parse(postListString).slice((curPage - 1) * postsPerPage,curPage*postsPerPage).map(x => (
                                <div key={x.post} className="post">
                                    <div key={x.post+1}><Link to={'/student-view/course/' + courseId + '/discussion/topic/' + topicId+'/post/'+x.post}>{x.title}</Link></div>
                                    {x.created_at === x.updated_at ?
                                        <div key={x.post + 2} className="created-at">Created at: {new Date(x.created_at).toLocaleString()}</div>
                                        :
                                        <div key={x.post + 3} className="created-at">Updated at: {new Date(x.updated_at).toLocaleString()}</div>
                                    }
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
                    
                    <div className="float-right">
                        <Link to={'/student-view/course/'+courseId+'/discussion/topic/'+topicId+'/create'}>Create a post</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}


const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentTopic as any) as any;