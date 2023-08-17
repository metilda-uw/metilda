import React from "react"
import { useState, useContext, useEffect} from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { withAuthorization } from "../../Session";
import { AuthUserContext } from "../../Session";
import Modal from 'react-modal'
import Sidebar from "./Sidebar";
import { useParams } from "react-router-dom";
import "./GeneralStyles.scss"

function Assignment() {

    return (
        <div>
            <Header></Header>
            <div className="main-layout">
                <Sidebar courseId={useParams()['id']}></Sidebar>
                <div className="main-view">
                    
                    Course id: {useParams()['id']}
                    
                </div>
            </div>
        </div>
    )
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(Assignment as any) as any;