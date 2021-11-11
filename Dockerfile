FROM node:16
LABEL maintainer="Hugo Josefson <hugo@josefson.org> (https://www.hugojosefson.com/)"

## Use tini for PID 1 to handle process signals correctly, and support graceful shutdown.
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /
RUN chmod +rx /tini
ENTRYPOINT ["/tini", "--"]

RUN mkdir /app
WORKDIR /app

## Cache deps
COPY package.json yarn.lock ./
RUN yarn install

## Include the rest
COPY . .

## Build
RUN yarn build
RUN yarn install --production

ENV NODE_ENV=production
CMD node app.js
