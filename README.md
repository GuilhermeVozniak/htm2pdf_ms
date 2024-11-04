# HTML to PDF Converter Microservice

A RESTful microservice for generating PDFs from HTML content using Bun, TypeScript, Puppeteer, and Express. This microservice accepts HTML content via a POST request and returns a generated PDF. It also supports merging multiple PDFs and compressing the final output.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Using Bun](#using-bun)
  - [Using Docker](#using-docker)
- [API Usage](#api-usage)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- Convert HTML content to PDF using Puppeteer.
- Merge multiple PDFs into a single document.
- Compress PDFs using Ghostscript.
- Lightweight and optimized for production using Bun and Docker.
- Written in TypeScript with ESLint and Prettier configurations.

---

## Prerequisites

- **Bun**: A fast JavaScript runtime. [Install Bun](https://bun.sh/)
- **Docker**: For containerization (optional). [Install Docker](https://docs.docker.com/get-docker/)
- **Ghostscript**: Required for PDF compression. Installed in the Docker image.

---

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/GuilhermeVozniak/htm2pdf_ms.git
   cd htm2pdf_ms
   ```

2. **Install Dependencies**

   Use Bun's package manager to install dependencies:

   ```bash
   bun install
   ```

---

## Running the Application

### Using Bun

#### 1. Run the Application

```bash
bun run src/index.ts
```

#### 2. Access the Service

The service will be running on `http://localhost:1646` by default.

### Using Docker

#### 1. Build the Docker Image

```bash
docker build -t htm2pdf_ms .
```

#### 2. Run the Docker Container

```bash
docker run -p 1646:1646 htm2pdf_ms
```

---

## API Usage

### Endpoint

**POST** `/pdf`

### Request Headers

- `Content-Type`: `application/json` or `text/html`

### Request Body

- For single HTML content (as text):

  ```html
  <html>
    <body>
      <h1>Hello, World!</h1>
    </body>
  </html>
  ```

- For multiple HTML contents (as JSON array):

  ```json
  [
    "<html><body><h1>Page 1</h1></body></html>",
    "<html><body><h1>Page 2</h1></body></html>"
  ]
  ```

### Query Parameters

- `filename` (optional): The name of the output PDF file (default: `document.pdf`).

### Response

- Returns the generated PDF file as an attachment.

### Example Request Using `curl`

```bash
curl -X POST \
  -H "Content-Type: text/html" \
  --data '<html><body><h1>Hello, World!</h1></body></html>' \
  http://localhost:1646/pdf --output output.pdf
```

---

## Environment Variables

- `PORT`: The port number the server listens on (default: `1646`).
- `BODY_LIMIT`: The maximum request body size (default: `10mb`).

You can create a `.env` file in the project root to set environment variables:

```dotenv
PORT=1646
BODY_LIMIT=10mb
```

---

## Scripts

### Available Scripts in `package.json`

- **Start the application**

  ```bash
  bun run src/index.ts
  ```

- **Run in development mode**

  ```bash
  bun run src/index.ts
  ```

- **Build the project**

  ```bash
  bun run tsc
  ```

- **Lint the code**

  ```bash
  bun run eslint 'src/**/*.{ts}'
  ```

- **Format the code**

  ```bash
  bun run prettier --write 'src/**/*.{ts,js,json}'
  ```

---

## Project Structure

```plaintext
.
├── Dockerfile
├── package.json
├── bun.lockb
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
├── src
│   ├── index.ts
│   ├── print.ts
│   └── utils.ts
└── README.md
```

- **index.ts**: Entry point of the application, sets up the Express server and defines routes.
- **print.ts**: Contains the function to generate PDFs using Puppeteer.
- **utils.ts**: Utility functions for parsing requests and compressing PDFs.

---

## TypeScript Configuration

The `tsconfig.json` is configured to work seamlessly with Bun and TypeScript:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"]
}
```

---

## ESLint and Prettier

The project uses ESLint and Prettier for code linting and formatting. Configuration files are provided:

- **.eslintrc.js**
- **.prettierrc**

Run linting and formatting with:

```bash
bun run eslint 'src/**/*.{ts}'
bun run prettier --write 'src/**/*.{ts,js,json}'
```

---

## Dockerization

A lightweight Docker image is provided for production deployment.

### Dockerfile

```dockerfile
# Use the official Bun image as the base
FROM oven/bun:latest

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies required by Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libxss1 \
    libasound2 \
    fonts-liberation \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxshmfence1 \
    xdg-utils \
    ghostscript \
  && rm -rf /var/lib/apt/lists/*

# Copy package.json and bun.lockb (if available)
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 1646

# Start the application
CMD ["bun", "src/index.ts"]
```

### Building and Running the Docker Image

#### Build the Docker Image

```bash
docker build -t htm2pdf_ms .
```

#### Run the Docker Container

```bash
docker run -p 1646:1646 htm2pdf_ms
```

---

## Troubleshooting

- **Puppeteer Errors**: Ensure all system dependencies are installed. The Dockerfile includes necessary packages.
- **Ghostscript Errors**: Make sure Ghostscript is installed if running outside Docker.
- **TypeScript Import Errors**: Ensure `moduleResolution` in `tsconfig.json` is set to `bundler` or `node`.
- **Environment Variables**: Use a `.env` file or pass variables when running the Docker container.

---

## License

This project is licensed under the ISC License.

---

## Acknowledgments

- **[Bun](https://bun.sh/)**: A fast JavaScript runtime.
- **[Puppeteer](https://github.com/puppeteer/puppeteer)**: Headless Chrome Node.js API.
- **[Express](https://expressjs.com/)**: Fast, unopinionated, minimalist web framework for Node.js.

---

**Note**: Replace `https://github.com/yourusername/htm2pdf_ms.git` with the actual repository URL if available.

---

Feel free to contribute to this project by submitting issues or pull requests.