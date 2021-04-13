import * as React from 'react';
import { GraphQLClient, ClientContext } from 'graphql-hooks';
import Navigation from './Navigation';

const client = new GraphQLClient({
  url: 'https://localhost:5001/graphql'
})

function App() {
  return (
    <ClientContext.Provider value={client}>
      <Navigation></Navigation>
    </ClientContext.Provider>
  )
}

export default App
