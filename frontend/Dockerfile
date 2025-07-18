FROM node:22-slim

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install

COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]
