// import Reac, { useEffect } from 'react';
import HttpsRedirect from 'react-https-redirect';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import { useAppContext } from "./context/AppContext";
import Layout from './components/layout';
import Home from "./pages/home";
import Login from './pages/login';

import './App.css';

export default function App() {
  const [{ uid }] = useAppContext();
  const ToLogin = () => <Redirect to="/login" />;
  const ToHome = () => <Redirect to="/" />;

  return (
    <HttpsRedirect>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/" component={uid ? Home : ToLogin} />
            <Route exact path="/login" component={uid ? ToHome : Login} />
            <Route component={uid ? ToHome : ToLogin} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </HttpsRedirect>
  );
}
