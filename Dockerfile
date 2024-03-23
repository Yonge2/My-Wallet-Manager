FROM node:20-alpine

WORKDIR /app

RUN apk add bash

COPY package.json .

RUN npm install

COPY . .
RUN chmod +x wait-for-it.sh

EXPOSE 3003