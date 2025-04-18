FROM node:16

ARG ENVIRONMENT

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/client

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install

WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN yarn install

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/client
RUN yarn build:${ENVIRONMENT}

WORKDIR /usr/src/app
RUN yarn build
RUN sh clean.sh

CMD ["yarn", "server"]
