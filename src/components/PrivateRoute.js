import React from 'react';
import {Route, Redirect, withRouter} from 'react-router-dom';
import {verifyUser} from '../apis/auth';
import {getCookie, decodeCookieData, resetCookie} from '../utils/auth';

const PrivateRoute = ({history, component: Component, path, ...rest}) => {
  let cookieData = getCookie('key');
  let loginData;

  if (cookieData) {
    loginData = decodeCookieData(cookieData);
  }

  // if (loginData) {
  //   verifyUser(loginData.accessToken)
  //     .then((res) => {
  //       if (!res.isAdmin) {
  //         resetCookie();
  //         history.push('/login');
  //       }
  //     })
  //     .catch((err) => {
  //       console(err);
  //     });
  // }

  const render = (props) => <Component {...props} />;

  return loginData && loginData.isLoggedIn ? (
    <Route path={path} render={render} {...rest} />
  ) : (
    <Redirect to={{pathname: '/login'}} />
  );
};

export default withRouter(PrivateRoute);
