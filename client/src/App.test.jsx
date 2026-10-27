import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import App from './App';

vi.mock('axios', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const structure = {
  '/about': { type: 'file' },
  '/blog': { type: 'directory', contents: ['first'] },
};

beforeEach(() => {
  axios.get.mockImplementation((url) => {
    if (url.endsWith('/structure')) return Promise.resolve({ data: structure });
    if (url.endsWith('/page-get')) return Promise.resolve({ data: { title: 'Test Page', content: '<p>Hello from the backend</p>' } });
    return Promise.reject(new Error(`Unexpected request: ${url}`));
  });
});

test('renders the home page from the backend', async () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(await screen.findByRole('heading', { level: 1, name: 'Test Page' })).toBeInTheDocument();
  expect(screen.getByText('Hello from the backend')).toBeInTheDocument();
  expect(await screen.findByRole('button', { name: 'about' })).toBeInTheDocument();
});

test('renders the admin panel with the page structure', async () => {
  window.history.pushState({}, '', '/admin');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Admin Panel' })).toBeInTheDocument();
  expect(await screen.findByRole('link', { name: '/about' })).toHaveAttribute('href', '/page/about');
  expect(screen.getByRole('link', { name: 'first' })).toHaveAttribute('href', '/page/blog/first');
});

test('adds editable elements in the page editor', async () => {
  const user = userEvent.setup();
  window.history.pushState({}, '', '/admin/create');
  render(<App />);
  await user.click(screen.getByRole('button', { name: 'Add Title' }));
  expect(await screen.findByRole('heading', { level: 2, name: 'Enter Title' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Add Formated Text' }));
  expect(await screen.findByText('Type here')).toBeInTheDocument();
});
