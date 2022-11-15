# Use a nice old version of nodejs because we have nice old code
FROM node:16 as build

WORKDIR /app

COPY ./app/js /app/
RUN --mount=type=cache,target=/cache npm set cache /cache && npm ci
# build main.js
RUN --mount=type=cache,target=/cache npm set cache /cache && npm run build

FROM nginx
COPY app/ /usr/share/nginx/html
COPY --from=build /app/main.js /usr/share/nginx/html/js/main.js

EXPOSE 80
