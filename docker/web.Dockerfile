FROM node:22.12-alpine

WORKDIR /app

COPY . .
RUN npm i

RUN npm run build:web
CMD ["npm", "run", "start:web"]