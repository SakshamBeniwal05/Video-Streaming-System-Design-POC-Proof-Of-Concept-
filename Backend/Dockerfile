FROM node

WORKDIR /VideoStream
COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npm","run","dev"]