import React from "react"
import { useState, useContext, useEffect} from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"
import { verifyTeacherCourse } from "../AuthUtils";

function Assignments() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [assignmentListString, setAssignmentListString] = useState('')
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                await fetch('/cms/assignments', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                .then(x => x.json())
                .then(x=>x.sort((b,a)=>{return (new Date(b.deadline)).getTime()-(new Date(a.deadline)).getTime()}))
                .then(JSON.stringify)
                .then(setAssignmentListString)
            }
            catch (error) {
                console.log("Fetch failed, see if it is 403 in error console")
            }
        }
        fetchData()
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
                        <div className="title">Assignments:</div>
                        {assignmentListString?JSON.parse(assignmentListString).map(x => (
                            <div key={x.assignment+'1'} className="list-item">
                                <div key={x.assignment+'2'}><Link className="content-link list-item-title" key={x.assignment+'3'} to={'/content-management/course/' + courseId + '/assignment/' + x.assignment}>{x.name}</Link></div>
                                <div key={x.assignment+'4'} className="deadline"><b>Deadline:</b> {new Date(x.deadline).toLocaleString()}</div>
                            </div>
                        )) : null}
                    </div>

                    <div className="float-right">
                        <Link className="content-link" to={'/content-management/course/'+courseId+'/assignments/create'}>Create an assigment</Link>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Assignments as any) as any;