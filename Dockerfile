FROM node:lts

WORKDIR /app

COPY . .

WORKDIR /app/source

RUN npm install

RUN npm run build

RUN cp -r ../public/* dist/public/

EXPOSE 3000

CMD ["npm", "start"]
