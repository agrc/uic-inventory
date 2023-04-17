import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import App from './App';
import './styles/tailwind.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
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
  </QueryClientProvider>
);
