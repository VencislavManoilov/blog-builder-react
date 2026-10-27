# Blog Builder Client

This is the React frontend of the blog builder. It is built with [Vite](https://vite.dev/).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.

### `npm test`

Launches the [Vitest](https://vitest.dev/) test runner in the interactive watch mode.\
Use `npm test -- --run` to run the tests once.

### `npm run build`

Builds the app for production to the `build` folder.\
The build is minified and the filenames include the hashes.

### `npm run preview`

Serves the production build from the `build` folder locally, so you can check it before deploying.

## Configuration

The app talks to the backend at `http://localhost:8080` by default.\
Set `REACT_APP_BACKEND_URL` (in the environment or in a `.env` file) to use a different backend URL.
