FROM node:21-alpine

WORKDIR /app

COPY . .
RUN npm i

RUN npm run build
CMD [ "npm",'run','start:backend' ]