FROM node:lts

WORKDIR /app

COPY . .

WORKDIR /app/source

RUN npm install

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
