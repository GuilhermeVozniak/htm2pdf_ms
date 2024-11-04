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
