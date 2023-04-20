import React, { createRef } from "react";
import { withAuthorization } from "../Session";
import "./EafsForMyFiles.scss";
import { spinner } from "../Utils/LoadingSpinner";

export interface SharedUsersForMyFilesProps {
    firebase: any;
    showSharedUsers: boolean;
    sharedUsersBackButtonClicked: any;
    fileName: string;
    fileId: number;
    permission: string;
}

interface SharedUsersEntity {
    audioId: number;
    userId: string;
    checked: boolean;
    permission: string;
}

interface State {
    isLoading: boolean;
    isSharedUsersClicked: boolean;
    checkedSharedUsers: boolean;
    checkAllSharedUsers: boolean;
    sharedUsers: SharedUsersEntity[];
    selectedSharedUsersName: string;
    selectedSharedUsersId: number | null;
}

export class SharedUsersForMyFiles extends React.Component<SharedUsersForMyFilesProps,
    State> {
    private downloadRef = createRef<HTMLAnchorElement>();
    constructor(props: SharedUsersForMyFilesProps) {
        super(props);

        this.state = {
            isLoading: false,
            isSharedUsersClicked: false,
            checkedSharedUsers: false,
            checkAllSharedUsers: false,
            sharedUsers: [],
            selectedSharedUsersName: "",
            selectedSharedUsersId: null
        };
    }

    async componentWillReceiveProps(nextProps: SharedUsersForMyFilesProps) {
        const { fileId } = this.props;
        if (nextProps.fileId !== null && nextProps.fileId !== fileId) {
            this.setState({
                sharedUsers: [],
                isLoading: true,
            });
            const response = await fetch(`api/get-shared-users/${nextProps.fileId.toString()}`, {
                method: "GET",
                headers: {
                    Accept: "application/json"
                }
            });
            const sharedUsersInfo = await response.json();
            sharedUsersInfo.result.forEach(async (user: any) => {
                const newUser = { audioId: user[0], userId: user[1], permission: user[2], checked: false };
                this.setState({
                    sharedUsers: [...this.state.sharedUsers, newUser]
                });
            });
            this.setState({
                isLoading: false,
            });
        }
    }

    getAnalysesForImage = async (eafId: number, eafName: string) => {
        this.setState({
            isSharedUsersClicked: true,
            selectedSharedUsersName: eafName,
            selectedSharedUsersId: eafId
        });
    }

    eafBackButtonClicked = () => {
        this.setState({
            isSharedUsersClicked: false
        });
    }

    handleCheckAllEaf = () => {
        this.setState({
            checkAllSharedUsers: !this.state.checkAllSharedUsers
        }, () => {
            const updatedSharedUsers = [...this.state.sharedUsers];
            updatedSharedUsers.map((eaf) => {
                if (eaf.permission !== "own") {
                    eaf.checked = this.state.checkAllSharedUsers
                  }
            });
            this.setState({
                sharedUsers: updatedSharedUsers
            });
        });
    }

    handleCheckboxChangeEaf = (event: any) => {
        const index = Number(event.target.value);
        const checked = event.target.checked;
        const updatedSharedUsers = [...this.state.sharedUsers];
        updatedSharedUsers[index].checked = checked;
        this.setState({
            sharedUsers: updatedSharedUsers
        }, () => {
            const uncheckedFiles = this.state.sharedUsers.filter((eaf) => !eaf.checked);
            this.setState({
                checkAllSharedUsers: uncheckedFiles.length === 0 ? true : false
            });
        });
    }

    renderEafHeader() {
        const headerNames = ["User ID", "ACCESS"];
        const headers = [];
        headers.push(<th key="checkBoxHeader">
            {<label><input className="checkBoxForAllFiles" type="checkbox"
                onChange={this.handleCheckAllEaf} checked={this.state.checkAllSharedUsers} /><span />
            </label>}
        </th>);
        for (let i = 0; i < headerNames.length; i++) {
            headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
        }
        return headers;
    }

    renderEafData() {
        return this.state.sharedUsers.map((eaf, index) => {
            return (
                <tr key={index}>
                    <td><label><input className="checkBoxForFile" type="checkbox"
                        checked={eaf.checked} onChange={this.handleCheckboxChangeEaf}
                        value={index} disabled={eaf.permission === "own"} /><span /></label></td>
                    <td>{eaf.userId}</td>
                    <td>{eaf.permission}</td>
                </tr>
            );
        });
    }

    deleteEafFiles = async () => {
        const uncheckedFiles = [];
        try {
            for (const user of this.state.sharedUsers) {
                if (user.checked) {
                    // Delete file from DB
                    const formData = new FormData();
                    formData.append("audio_id", user.audioId.toString());
                    formData.append("user_id", user.userId.toString());
                    const response = await fetch(`/api/delete-shared-user`, {
                        method: "POST",
                        headers: {
                            Accept: "application/json"
                        },
                        body: formData
                    });
                    const body = await response.json();
                } else {
                    uncheckedFiles.push(user);
                }
            }
            this.setState({
                sharedUsers: uncheckedFiles
            });
        } catch (ex) {
            console.log(ex);
        }
    }


    render() {
        const { isLoading } = this.state;
        const { showSharedUsers } = this.props;
        const className = `${showSharedUsers
            ? "eafTransition"
            : ""} EafsForMyFiles`;
        return (
            <div className={className}>
                {isLoading && spinner()}
                <button className="BackButton waves-effect waves-light btn globalbtn"
                    onClick={this.props.sharedUsersBackButtonClicked}>
                    <i className="material-icons right">arrow_back</i>
                    Back
                </button>
                {this.props.permission === "view" &&
                    <div>
                        <p id="noEafsMessage">You don't have permission to edit this file!</p>
                    </div>
                }
                {this.state.sharedUsers.length === 0 &&
                    <div>
                        <p id="noEafsMessage">No Users with Access are found!</p>
                    </div>}
                {(this.props.permission !== "view" && this.state.sharedUsers.length > 0) &&
                    <div> <br /> <br />
                        <h1 id="eafTitle">Access Managment: {this.props.fileName}</h1><br />
                    </div>}
                {(this.props.permission !== "view" && this.state.sharedUsers.length > 0) &&
                    <div className="eafContainer">
                        <table id="myFiles">
                            <tbody>
                                <tr> {this.renderEafHeader()} </tr>
                                {this.renderEafData()}
                            </tbody>
                        </table>
                    </div>
                }
                {(this.props.permission !== "view" && this.state.sharedUsers.length > 0) &&
                    <button className="DeleteFile waves-effect waves-light btn globalbtn" onClick={this.deleteEafFiles}>
                        <i className="material-icons right">delete</i>
                        Remove Users
                    </button>
                }
            </div>
        );
    }
}

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(SharedUsersForMyFiles as any) as any;