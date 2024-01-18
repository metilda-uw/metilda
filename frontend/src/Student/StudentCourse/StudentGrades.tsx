import React from "react"
import { useState, useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Sidebar from "./StudentSidebar";
import { useParams } from "react-router-dom";
import "../../CMS/Course/GeneralStyles.scss"
import { verifyStudentCourse } from "../../CMS/AuthUtils";

function StudentGrades() {
    const user = useContext(AuthUserContext) as any
    const courseId = useParams()['id']
    const [gradeListString, setGradeListString] = useState('')
    const [weightedSum,setWeightedSum]=useState(0.0)
    const [veri, setVeri] = useState(true)

    useEffect(() => {
        async function fetchData() {
            await verifyStudentCourse(user.email,courseId,setVeri)
            if(!veri)
                return

            let formData = new FormData();
            formData.append('user', user.email);
            formData.append('course', courseId);
            try {
                let response=await fetch('/student-view/grades', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let grades = await response.json()

                let unifiedResponse = grades.assignments.concat(grades.quiz).concat(grades.gradables)
                setGradeListString(JSON.stringify(unifiedResponse))
                let graded=Object.keys(unifiedResponse).length
                let sum = 0
                let totalWeight=0
                for (let record of unifiedResponse) {
                    if (record.grade !== -1.0) {
                        sum += record.grade / record.max_grade * record.weight
                        totalWeight+=record.weight
                    }
                    else
                        graded-=1
                }
                if(graded)
                    setWeightedSum(sum/totalWeight)
                else
                    setWeightedSum(0)

                response=await fetch('/student-view/grades/stats', {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                })
                let stats = await response.json()
                
                let a_grades = grades.assignments
                let g_grades = grades.gradables
                let q_grades = grades.quiz

                let averages_a = stats.assignment_averages
                let stds_a = stats.assignment_stds
                let averages_g = stats.gradable_averages
                let stds_g = stats.gradable_stds
                let averages_q = stats.quiz_averages
                let stds_q = stats.quiz_stds

                for (let assignment in averages_a) {
                    for (let record of a_grades)
                        if(assignment===record.assignment)
                            record['average']=averages_a[assignment]
                }
                for (let assignment in stds_a) {
                    for (let record of a_grades)
                        if(assignment===record.assignment)
                            record['std']=stds_a[assignment]
                }

                for (let gradable in averages_g) {
                    for (let record of g_grades) {
                        if(gradable===record.gradable)
                            record['average']=averages_g[gradable]
                    }

                }
                for (let gradable in stds_g) {
                    for (let record of g_grades)
                        if(gradable===record.gradable)
                            record['std']=stds_g[gradable]
                }

                for (let quiz in averages_q) {
                    for (let record of q_grades) {
                        if(quiz===record.quiz)
                            record['average']=averages_q[quiz]
                    }

                }
                for (let quiz in stds_q) {
                    for (let record of q_grades)
                        if(quiz===record.quiz)
                            record['std']=stds_q[quiz]
                }
                
                unifiedResponse = grades.assignments.concat(grades.quiz).concat(grades.gradables)
                setGradeListString(JSON.stringify(unifiedResponse))
            }
            catch (error) {
                console.log(error)
            }
        }
        fetchData()
    }, [])
    
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
                    <table>
                        <caption className="title">Grades</caption>
                        <thead>
                            <tr>
                                <th className="grades-grade_list-name_col">Graded Item</th>
                                <th className="grades-grade_list-grade_col">Grade</th>
                                <th className="grades-grade_list-grade_col">Weight</th>
                                <th className="grades-grade_list-grade_col">Mean</th>
                                <th className="grades-grade_list-grade_col">Standard deviation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gradeListString?JSON.parse(gradeListString).map(x => (
                                <tr key={x.name+'1'}>
                                    <td>{x.name}</td>
                                    <td>{x.grade===-1.0?'-':x.grade}/{x.max_grade}</td>
                                    <td>{x.weight * 100}%</td>
                                    <td>{x.average!==undefined?x.average.toFixed(2):'-'}</td>
                                    <td>{x.average!==undefined?x.std.toFixed(2):'-'}</td>
                                </tr>
                            )) : null}
                            {gradeListString ?
                                <tr>
                                    <td colSpan={5}>Weighted Sum: {(weightedSum*100).toFixed(2)}%</td>
                                </tr>
                            : null}
                        </tbody>
                    </table>
                    
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(StudentGrades as any) as any;