import "./ManageUsers.scss";

import React from "react";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";
import { spinner } from "../Utils/LoadingSpinner";
import { deleteUser } from "../Create/ImportUtils";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import AuthorizeUser from "./AuthorizeUser";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { NotificationManager } from "react-notifications";

export interface ManageUsersProps {
  firebase: any;
}

interface State {
  users: UserEntity[];
  isLoading: boolean;
  isCreateUserClicked: boolean;
  isEditUserClicked: boolean;
  isauthorizeUserClicked: boolean;
  deleteUserModal: boolean;
  deletedUserId: any;
  editedUser: any;
}

interface UserEntity {
  id: string;
  name: string;
  createdAt: any;
  lastLogin: any;
  role: string;
  university: string;
  researchLanguage: string;
}

interface EditedUserEntity {
  username: string;
  email: string;
  institution: string;
  role: any[];
  languageOfResearch: any[];
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}
const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export class ManageUsers extends React.Component<ManageUsersProps, State> {
  constructor(props: ManageUsersProps) {
    super(props);

    this.state = {
      users: [],
      isLoading: false,
      isCreateUserClicked: false,
      isEditUserClicked: false,
      isauthorizeUserClicked: false,
      deleteUserModal: false,
      deletedUserId: "",
      editedUser: null,
    };
  }
  componentDidMount() {
    this.getUsers();
  }

  getUsers = async () => {
    this.setState({
      users: [],
      isLoading: true,
    });
    // Get all users
    const response = await fetch(`api/get-users`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    const body = await response.json();
    body.result.forEach(async (user: any) => {
      const userRoleResponse = await fetch(`api/get-user-roles/${user[0]}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const userRoleResponseBody = await userRoleResponse.json();
      const userRole = userRoleResponseBody.result.join(",");
      const researchLanguageResponse = await fetch(
        `api/get-user-research-language/${user[0]}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const researchLanguageResponseBody =
        await researchLanguageResponse.json();
      const userResearchLanguage =
        researchLanguageResponseBody.result.join(",");
      const newUser = {
        id: user[0],
        university: user[1],
        createdAt: user[2],
        lastLogin: user[3],
        name: user[4],
        role: userRole,
        researchLanguage: userResearchLanguage,
      };
      this.setState({
        users: [...this.state.users, newUser],
      });
    });
    this.setState({
      isLoading: false,
    });
  };

  handleCloseDeleteUserModal = () => {
    this.setState({
      deleteUserModal: false,
    });
  };

  handleOkDeleteUserModal = async () => {
    // const responseFromCloud =  deleteUser(this.state.deletedUserId, this.props.firebase);
    const updatedUsers = this.state.users.filter(
      (user) => user.id !== this.state.deletedUserId
    );
    this.setState({
      users: updatedUsers,
      deleteUserModal: false,
    });
    NotificationManager.success("Deleted user successfully");
  };

  deleteUserModal = () => {
    return (
      <Dialog
        fullWidth={true}
        maxWidth="sm"
        open={this.state.deleteUserModal}
        onClose={this.handleCloseDeleteUserModal}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle
          id="alert-dialog-title"
          onClose={this.handleCloseDeleteUserModal}
        >
          Are you sure you want to delete the user?
        </DialogTitle>
        <DialogActions>
          <button
            className="DeleteUser_Yes waves-effect waves-light btn globalbtn"
            onClick={this.handleOkDeleteUserModal}
          >
            Yes
          </button>
          <button
            className="DeleteUser_No waves-effect waves-light btn globalbtn"
            onClick={this.handleCloseDeleteUserModal}
          >
            No
          </button>
        </DialogActions>
      </Dialog>
    );
  };
  handleClickDeleteUser = (userId: any) => {
    this.setState({
      deleteUserModal: true,
      deletedUserId: userId,
    });
  };

  renderTableHeader() {
    if (this.state.users.length > 0) {
      const headerNames = [
        " Name",
        "Email",
        "Role",
        "Research Language",
        "University",
        "Last Login",
        "Modify",
      ];
      const headers = [];
      for (let i = 0; i < headerNames.length; i++) {
        headers.push(<th key={i}>{headerNames[i].toUpperCase()}</th>);
      }
      return headers;
    }
  }

  renderTableData() {
    return this.state.users.map((user, index) => {
      return (
        <tr key={index}>
          <td>{user.name}</td>
          <td>{user.id}</td>
          <td>{user.role}</td>
          <td>{user.researchLanguage}</td>
          <td>{user.university}</td>
          <td>{user.lastLogin}</td>
          <td>
            <button
              className="EditUser btn-floating btn-small waves-effect waves-light globalbtn"
              onClick={() =>
                this.editUser(
                  user.name,
                  user.id,
                  user.role,
                  user.researchLanguage,
                  user.university
                )
              }
            >
              <i className="material-icons right">edit</i>
            </button>
            <button
              className="DeleteUser btn-floating btn-small waves-effect waves-light globalbtn"
              onClick={() => this.handleClickDeleteUser(user.id)}
            >
              <i className="material-icons right">delete</i>
            </button>
          </td>
        </tr>
      );
    });
  }
  addUser = () => {
    this.setState({
      isCreateUserClicked: true,
    });
  };

  editUser = (
    username: string,
    email: string,
    role: string,
    researchLanguage: string,
    institution: string
  ) => {
    const roles = role.split(",");
    const researchLanguages = researchLanguage.split(",");
    const userRoles = [];
    const userLanguages = [];
    for (const currentRole of roles) {
      if (currentRole !== "") {
        userRoles.push({
          value: currentRole,
          label: currentRole,
        });
      }
    }
    for (const currentLanguage of researchLanguages) {
      if (currentLanguage !== "") {
        userLanguages.push({
          value: currentLanguage,
          label: currentLanguage,
        });
      }
    }
    const newUser = {
      username,
      email,
      institution,
      role: userRoles,
      languageOfResearch: userLanguages,
    };
    this.setState({
      editedUser: newUser,
      isEditUserClicked: true,
    });
  };

  authorizeUser = () => {
    this.setState({
      isauthorizeUserClicked: true,
    });
  };

  addUserBackButtonClicked = () => {
    this.getUsers();
    this.setState({
      isCreateUserClicked: false,
    });
  };

  editUserBackButtonClicked = () => {
    this.getUsers();
    this.setState({
      isEditUserClicked: false,
    });
  };
  authorizeUserBackButtonClicked = () => {
    this.setState({
      isauthorizeUserClicked: false,
    });
  };

  render() {
    const { isLoading } = this.state;
    return (
      <div className="userContainer">
        <Header />
        {this.deleteUserModal()}
        {isLoading && spinner()}
        <h1 id="usersTitle">MeTILDA Users </h1>
        <table id="allUsers">
          <tbody>
            <tr>{this.renderTableHeader()}</tr>
            {this.renderTableData()}
          </tbody>
        </table>

        {this.state.users.length > 0 && (
          <div className="manageUsersButtonContainer"></div>
        )}
        <button
          onClick={this.addUser}
          className="AddUser waves-effect waves-light btn globalbtn"
        >
          <i className="material-icons right">add</i>
          Add User
        </button>
        <button
          onClick={this.authorizeUser}
          className="AuthorizeUser waves-effect waves-light btn globalbtn"
        >
          <i className="material-icons right">add</i>
          Authorize User
        </button>
        <CreateUser
          addUserClicked={this.state.isCreateUserClicked}
          addUserBackButtonClicked={this.addUserBackButtonClicked}
        />
        <EditUser
          editUserClicked={this.state.isEditUserClicked}
          editUserBackButtonClicked={this.editUserBackButtonClicked}
          editedUser={this.state.editedUser}
        />
        <AuthorizeUser
          authorizeUserClicked={this.state.isauthorizeUserClicked}
          authorizeUserBackButtonClicked={this.authorizeUserBackButtonClicked}
        />
      </div>
    );
  }
}

const authCondition = (authUser: any) => !!authUser;
export default withAuthorization(authCondition)(ManageUsers as any);
