FROM node:18-alpine

WORKDIR /app

RUN apk update && app add --no-cache g++

COPY . .

RUN npm install

EXPOSE 8000
 
CMD ["node", "index.js"]

