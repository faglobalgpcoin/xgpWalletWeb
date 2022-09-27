import React from 'react';
import {Switch, Route, withRouter} from 'react-router-dom';
import {Provider} from 'mobx-react';

import Login from './pages/Login';

import stores from '../src/stores';
import MainRouter from './MainRouter';
import PrivateRoute from './components/PrivateRoute';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Provider {...stores}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path={`/change-password`} component={ChangePassword} />
        <PrivateRoute path="/" component={MainRouter} />
      </Switch>
    </Provider>
  );
}

export default withRouter(App);
