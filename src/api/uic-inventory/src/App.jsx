import { GraphQLClient, ClientContext } from 'graphql-hooks';
import memCache from 'graphql-hooks-memcache';
import Navigation from './Navigation';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

const client = new GraphQLClient({
  url: '/graphql',
  cache: memCache(),
});

function App() {
  return (
    <ClientContext.Provider value={client}>
      <Router>
        <Navigation />
        <Switch>
          <Route path="/contact">
          </Route>
          <Route path="/profile">
          </Route>
          <Route path="/">
          </Route>
        </Switch>
      </Router>
    </ClientContext.Provider>
  )
}

export default App
