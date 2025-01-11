# Langflow Integration API

A Node.js API service that integrates with Langflow to process and analyze social media engagement metrics.

## Overview

This service provides an API endpoint to run Langflow workflows for analyzing social media engagement metrics. It handles streaming and non-streaming responses from Langflow and includes retry mechanisms for reliability.

## Setup

1. Clone the repository
2. Install dependencies:
```sh
npm install
```
3. Create a `.env` file based on [.env.sample](.env.sample):
```
APPLICATION_TOKEN=your_application_token
```

## Project Structure

```
.
├── src/
│   ├── controllers/
│   │   └── flowController.js    # Flow execution logic
│   ├── routes/
│   │   └── flowRoutes.js       # API route definitions
│   └── LangflowClient.js       # Langflow API client
├── index.js                    # Main application entry
└── package.json                # Project dependencies
```

## API Endpoints

### POST /api/run-flow

Executes a Langflow workflow with provided input.

**Request Body:**
```json
{
  "inputValue": "Enter post type here (e.g. 'Reel', 'Carousel', 'Static Image')",
  "inputType": "chat",
  "outputType": "chat",
  "stream": false
}
```

**Response:**
- Success: `200 OK`
```json
{
  "success": true,
  "output": "string",
  "session_id": "string"
}
```
- Error: `500 Internal Server Error`
```json
{
  "success": false,
  "error": "error message"
}
```

## Error Handling

The [`LangflowClient`](src/LangflowClient.js) implements retry logic:
- Maximum retries: 3 attempts
- Retry delay: 1000ms (increases with each attempt)
- Request timeout: 120 seconds

## Running the Server

Start the server:
```sh
npm start
```

The API will be available at `http://localhost:3000`

## Dependencies

- express
- body-parser
- cors
- dotenv
- eventsource
- node-fetch

## Environment Variables

- `APPLICATION_TOKEN`: Langflow API authentication token
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Allowed CORS origin