# Use a nice old version of nodejs because we have nice old code
FROM node:10.22 as build

WORKDIR /app

COPY ./app/js /app/
RUN npm install
# build main.js
RUN npm run build

FROM nginx
COPY app/ /usr/share/nginx/html
COPY --from=build /app/main.js /usr/share/nginx/html/js/main.js
