import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
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
  </QueryClientProvider>,
);
