# Use Node 20 (compatible with Next.js 15)
FROM node:20-alpine

WORKDIR /app

# Copy package files first (caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
