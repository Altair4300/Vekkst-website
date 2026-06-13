FROM node:lts

WORKDIR /app

COPY . .

WORKDIR /app/source

RUN npm install

RUN npm run build

RUN mkdir -p dist/public/images dist/public/videos && cp -r ../public/images/* dist/public/images/ && cp -r ../public/videos/* dist/public/videos/

EXPOSE 3000

CMD ["npm", "start"]
