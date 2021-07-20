import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './styles/tailwind.css';
import App from './App';
import { StrictMode } from 'react';
import { ReactQueryDevtools } from 'react-query/devtools';

ReactDOM.render(
  <QueryClientProvider
    client={
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
    }
  >
    <StrictMode>
      <App />
      <ReactQueryDevtools initialIsOpen />
    </StrictMode>
  </QueryClientProvider>,
  document.getElementById('root')
);
