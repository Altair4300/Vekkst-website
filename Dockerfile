FROM node:lts

WORKDIR /app

COPY . .

WORKDIR /app/source

RUN npm install

RUN npm run build

RUN cp -r ../public/images/public/images/* dist/public/images/ && cp -r ../public/videos/public/videos/* dist/public/videos/

EXPOSE 3000

CMD ["npm", "start"]
