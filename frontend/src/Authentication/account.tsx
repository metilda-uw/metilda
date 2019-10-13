import React from "react";
import "./account.scss";
import { AuthUserContext } from "../Session/";
import { PasswordForgetForm } from "./password_forget";
import PasswordChangeForm from "./password_change";
import { withAuthorization } from "../Session";
import Header from "../Layout/Header";

const AccountPage = () => (
  <AuthUserContext.Consumer>
    {authUser => (
      <div>
        <Header />
        <div className="manageAccount">
          <h3>Account: {(authUser as any).email}</h3>
          <PasswordForgetForm />
          <PasswordChangeForm />
        </div>
      </div>
    )}
  </AuthUserContext.Consumer>
)

const authCondition = (authUser: any) => !!authUser

export default withAuthorization(authCondition)(AccountPage as any)
