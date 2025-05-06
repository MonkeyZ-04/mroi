FROM node:16

ARG ENVIRONMENT

RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/client

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

WORKDIR /usr/src/app/client
COPY client/package*.json ./
RUN npm install

WORKDIR /usr/src/app
COPY . .

WORKDIR /usr/src/app/client
RUN npm run build:${ENVIRONMENT}

WORKDIR /usr/src/app
RUN npm run build
RUN sh clean.sh 

CMD ["npm","run", "server"]
