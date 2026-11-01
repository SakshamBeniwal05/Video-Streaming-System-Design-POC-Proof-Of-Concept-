FROM node

WORKDIR /VideoStream
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npm install -g serve
ENTRYPOINT ["serve","-s","dist","-l","8000" ]

