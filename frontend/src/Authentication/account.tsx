import "./account.scss";

import React, { useEffect, useState } from "react";
import { AuthUserContext } from "../Session/";
import { PasswordForgetForm } from "./password_forget";
import PasswordChangeForm from "./password_change";
import { withAuthorization } from "../Session";
import Header from "../Components/header/Header";
import Box from "@material-ui/core/Box";

const AccountPage = () => {
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  useEffect(() => {
    const resizeHandler = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", resizeHandler)
  }, [])

  return (
    <AuthUserContext.Consumer>
      {(authUser) => (
        <div>
          <Header />
          {(windowWidth > 700) ? (
            <div className="manageAccount">
              <h3>Account: {(authUser as any).email}</h3>
              <PasswordForgetForm />
              <PasswordChangeForm />
            </div>
          ) : (
            <Box width='90%' display='flex' flexDirection='column' justifyContent='center' margin='0 auto'>
              <div className="manageAccount">
                <h3>Account: {(authUser as any).email}</h3>
                <PasswordForgetForm />
                <PasswordChangeForm />
              </div>
            </Box>
          )}
        </div>
      )}
  </AuthUserContext.Consumer>
)};

const authCondition = (authUser: any) => !!authUser;

export default withAuthorization(authCondition)(AccountPage as any);
