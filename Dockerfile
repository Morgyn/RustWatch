FROM node:20-alpine

LABEL org.opencontainers.image.authors="morgyn@gmail.com"

WORKDIR /rustwatch

COPY index.mjs package.json ./

RUN npm install

CMD ["node", "index.mjs"]
