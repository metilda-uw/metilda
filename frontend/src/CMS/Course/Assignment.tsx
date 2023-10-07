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

function Assignment() {
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
                <div className="main-view">
                    <div className="info-list">
                        <div>Assignments:</div>
                        {assignmentListString?JSON.parse(assignmentListString).map(x => (
                            <div key={x.assignment+'4'}>
                                <div key={x.assignment} className="assignment">
                                    <div key={x.assignment+'1'}><Link key={x.assignment+'2'} to={'/content-management/course/' + courseId + '/assignment/detail/' + x.assignment}>{x.name}</Link></div>
                                    <div key={x.assignment+'3'} className="deadline">Deadline: {new Date(x.deadline).toLocaleString()}</div>
                                </div>
                                <br></br>
                            </div>
                        )) : null}
                    </div>

                    <div className="float-right">
                        <Link to={'/content-management/course/'+courseId+'/assignment/create'}>Create an assigment</Link>
                    </div>
                    
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Assignment as any) as any;