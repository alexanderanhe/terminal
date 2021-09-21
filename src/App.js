import { useEffect } from 'react';
import HttpsRedirect from 'react-https-redirect';
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";

import { useAppContext } from "./context/AppContext";
import Layout from './components/Layout';
import Home from "./pages/home";
import Login from './pages/login';
import Chat from './pages/chat';

import './App.scss';

export default function App() {
  const [{ theme, lang, uid }] = useAppContext();
  const ToLogin = () => <Redirect to="/login" />;
  const ToHome = () => <Redirect to="/" />;
  const html = document.querySelector("html");

  useEffect(() => {
    html.dataset.theme = `theme-${theme}`;
    html.lang = lang;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, lang]);

  return (
    <HttpsRedirect>
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route exact path="/" component={uid ? Home : ToLogin} />
            <Route exact path="/login" component={uid ? ToHome : Login} />
            <Route exact path="/chat/:room" component={uid ? Chat : ToLogin} />
            <Route exact path="/chat" component={uid ? Chat : ToLogin} />
            <Route component={uid ? ToHome : ToLogin} />
          </Switch>
        </Layout>
      </BrowserRouter>
    </HttpsRedirect>
  );
}
