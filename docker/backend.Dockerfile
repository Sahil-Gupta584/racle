FROM node:22.12-alpine

WORKDIR /app
RUN apk add --no-cache git

COPY . .
RUN npm i

RUN npm run build:backend
CMD [ "npm","run","start:backend"]