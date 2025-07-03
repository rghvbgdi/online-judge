FROM  node:18-alpine

WORKDIR /app

RUN apk update && apk add --no-cache g++

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
