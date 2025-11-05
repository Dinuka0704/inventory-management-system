FROM node:20.17.0

RUN npm install -g nodemon

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 5432

CMD [ "npm", "start"]



