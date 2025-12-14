# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Environment Setup

Backend (`fms_backend`) required env variables:

- `PORT` (default 5000)
- `MONGO_URI` (MongoDB connection string)
- `JWT_SECRET` (any strong secret)
- `FRONTEND_URL` (e.g., http://localhost:3000)
- `BACKEND_URL` (e.g., http://localhost:5000)

**AI Extraction (LlamaIndex Cloud Extract API):**

The system uses **LlamaIndex Cloud Extract API** for enterprise-grade structured data extraction from financial documents.

**Required:**
- `LLAMA_CLOUD_API_KEY` - Get your API key from https://cloud.llamaindex.ai

**Optional:**
- `LLAMA_EXTRACTION_AGENT_NAME` - Custom agent name (default: `fms_financial_extractor`)
- `LLAMA_PROJECT_ID` - Project ID for organization projects

**How it works:**
1. Uploaded documents are sent to LlamaIndex Cloud for processing
2. The system automatically creates/uses an extraction agent with a financial document schema
3. Structured data (tables, fields, categories) is extracted and saved to the database
4. Results appear in the dashboard organized by category

**Fallback:**
If LlamaIndex Cloud is not configured or fails, the system falls back to heuristic (rule-based) extraction.

**Documentation:**
- LlamaIndex Cloud Extract API: https://developers.llamaindex.ai/python/cloud/llamaextract/getting_started/api/

Frontend (`fms`) env variables:

- `REACT_APP_API_URL` (default http://localhost:5000/api)

**Dependencies:**
- LibreOffice must be installed and accessible on the backend host for PDF conversion and text extraction.
- For Ollama: Install from https://ollama.ai and run `ollama serve` before starting the backend.
