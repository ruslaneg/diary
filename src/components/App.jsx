import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Redirect, Route, Switch } from 'wouter';
import ReactHelmet from 'react-helmet';

import Log from '../routes/Log';
import Auth from '../routes/Auth';
import { today } from '../util/dates';
import Message from '../routes/Message';
import ErrorBoundary from './ErrorBoundary';
import useUser from '../hooks/use-user';

export const Container = styled.div`
  margin: 0 auto;
  max-width: 30rem;
  padding: 1rem;
`;

const LoadingIcon = styled.img`
  display: block;
  margin: 0 auto;
  margin-top: 4rem;
  width: 4rem;

  @media (prefers-color-scheme: dark) {
    filter: invert();
    background: white;
  }
`;

function App() {
  const [user, userLoading, userError] = useUser();

  if (userError) throw userError;

  if (userLoading) {
    return (
      <Container>
        <LoadingIcon src="/assets/light/icon.svg" alt="Loading" />
      </Container>
    );
  }

  return (
    <Container>
      <Switch>
        <Route path="/m/:type*">{(params) => <Message {...params} />}</Route>
        <Route path="/auth/:action">{(params) => <Auth {...params} />}</Route>

        {!user && (
          <Route path="/auth">
            <Auth action="sign-in" />
          </Route>
        )}

        {user && (
          <Route path="/:year/:month">{(params) => <Log {...params} />}</Route>
        )}

        <Route>
          <Redirect to={user ? `/${today.year}/${today.month}` : '/auth'} />
        </Route>
      </Switch>
    </Container>
  );
}

function Helmet() {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    const listener = (e) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(match.matches ? 'dark' : 'light');

    match.addEventListener('change', listener);
    return () => match.removeEventListener('change', listener);
  }, []);

  return (
    <ErrorBoundary>
      <ReactHelmet>
        <meta
          name="theme-color"
          content={colorScheme === 'light' ? '#ffffff' : '#000000'}
        />
        <link rel="icon" href={`/assets/${colorScheme}/icon.svg`} />
        <link
          rel="apple-touch-icon"
          href={`/assets/${colorScheme}/apple-touch-icon.png`}
        />
        <link rel="manifest" href={`/assets/${colorScheme}/manifest.json`} />
      </ReactHelmet>

      <App />
    </ErrorBoundary>
  );
}

export default Helmet;
