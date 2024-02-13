import React from "react"
import { useState, useContext, useEffect} from "react";
import { Link } from "react-router-dom";
import Header from "../../../Components/header/Header";
import { withAuthorization } from "../../../Session";
import { AuthUserContext } from "../../../Session";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../GeneralStyles.scss"
import { verifyTeacherCourse } from "../../AuthUtils";

function GradesAssignmentSubmissions() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const assignmentId = useParams()['assignment_id']
    const [submissionListString, setSubmissionListString] = useState('')
    const [average, setAverage] = useState(0.0)
    const [std,setStd]=useState(0.0)
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyTeacherCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            const formData = new FormData();
            formData.append('user', user.email);
            formData.append('assignment', assignmentId);
            try {
                let response=await fetch('/cms/grades/assignment/submissions', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let responseJSON = await response.json()
                responseJSON.sort((a,b)=>{return (new Date(b.time)).getTime()-(new Date(a.time)).getTime()})
                setSubmissionListString(JSON.stringify(responseJSON))

                let graded=Object.keys(responseJSON).length
                let sum = 0
                for (let record of responseJSON) {
                    if (record.grade!==-1.0)
                        sum += record.grade
                    else
                        graded-=1
                }
                if(graded)
                    setAverage(sum / graded)
                else
                    setAverage(0)
                
                let avg = sum / graded
                sum = 0.0
                for (let record of responseJSON) {
                    if (record.grade!==-1.0)
                        sum += (record.grade - avg) ** 2
                }
                if(graded)
                    setStd((sum / graded) ** 0.5)
                else
                    setStd(0)
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
                        <div className='title'>Submissions:</div>
                        {submissionListString?JSON.parse(submissionListString).map(x => (
                            <div key={x.submission + '1'} className="list-item">
                                <div key={x.submission+'2'}><Link className="content-link list-item-title" key={x.submission+'3'} to={'/content-management/course/' + courseId + '/grades/assignment/' + assignmentId+'/submission/'+x.submission}>{x.user}</Link></div>
                                <div key={x.submission + '4'}><b>Grade:</b> {x.grade===-1?'-':x.grade}/{x.max_grade} &nbsp;&nbsp; <b>Submission time:</b> {new Date(x.time).toLocaleString()}</div>
                            </div>
                        )) : null}
                        <div className='title'>Statistics:</div>
                        <div><b>Average:</b> {average.toFixed(2)} &nbsp; <b>Standard deviation:</b> {std.toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(GradesAssignmentSubmissions as any) as any;