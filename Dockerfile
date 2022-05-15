FROM node:16

COPY . .

RUN npm install

CMD npm run start
