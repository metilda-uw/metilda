import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from ".././Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss";
import "./Discussion.scss";
import { verifyTeacherCourse } from "../../AuthUtils";
import { spinnerIcon } from "../../../Utils/SpinnerIcon";

export function Topic() {
    const postsPerPage = 10;
    const user = useContext(AuthUserContext) as any;

    const courseId = useParams()['id'];
    const topicId = useParams()['topic_id'];

    const [postListString, setPostListString] = useState('');
    const [numPages, setNumPages] = useState(0);
    const [curPage, setCurPage] = useState(1);
    const [veri, setVeri] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email, courseId, setVeri);
            if (!veri) return;

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('topic', topicId);
            setTimeout(async () => {
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
                            setNumPages(Math.ceil(x.length / postsPerPage));
                            return x;
                        })
                        .then(x => x.sort((a, b) => (new Date(b.updated_at)).getTime() - (new Date(a.updated_at)).getTime()))
                        .then(JSON.stringify)
                        .then(setPostListString);
                        setErrorMessage(null);
                } catch (error) {
                    setErrorMessage("Error loading posts. Please try again.");
                } finally {
                    setLoading(false);
                }
            }, 1000);
        }
        if (user) {
            fetchData();
        }
    }, [user]);

    if (!veri) {
        return <div>Authentication Error, please do not use URL for direct access.</div>;
    }

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={courseId}></Sidebar>
                <div className="height-column"></div>
                <div className="main-view">
                    {
                        loading ? (
                            spinnerIcon()
                        )
                            :
                            <div className="info-list">
                                {errorMessage && <div className="error-message">{errorMessage}</div>}
                                {postListString ? <div className="title">Posts:</div> : null}
                                {postListString ? JSON.parse(postListString).slice((curPage - 1) * postsPerPage, curPage * postsPerPage).map(x => (
                                    <div key={x.post} className="list-item">
                                        <div key={x.post + 1}><Link className="content-link list-item-title" to={'/content-management/course/' + courseId + '/discussion/topic/' + topicId + '/post/' + x.post}>{x.title}</Link></div>
                                        {x.created_at === x.updated_at ?
                                            <div key={x.post + 2} className="created-at"><b>Created at:</b> {new Date(x.created_at).toLocaleString()}</div>
                                            :
                                            <div key={x.post + 3} className="created-at"><b>Updated at:</b> {new Date(x.updated_at).toLocaleString()}</div>
                                        }
                                    </div>
                                )) : null}

                                {numPages ?
                                    <div className='pagination'>
                                        <button className='btn waves-light globalbtn' onClick={() => {
                                            if (curPage > 1) {
                                                setCurPage(curPage - 1);
                                            }
                                        }}> &lt; </button>
                                        {curPage} / {numPages}
                                        <button className='btn waves-light globalbtn' onClick={() => {
                                            if (curPage < numPages) {
                                                setCurPage(curPage + 1);
                                            }
                                        }}> &gt; </button>
                                    </div>
                                    : null}
                            </div>
                    }

                    <div className="float-right">
                        <Link className="content-link" to={'/content-management/course/' + courseId + '/discussion/topic/' + topicId + '/create'}>Create a post</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Topic as any) as any;