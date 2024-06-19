FROM node:18.15.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18.15.0 AS runner
ARG APP_ENV
ARG DB_HOST
ARG DB_PORT
ARG DB_USERNAME
ARG DB_PASSWORD
ARG DB_DATABASE
ARG DB_DEBUG
ARG DB_SYNC
ARG CORS_DOMAIN
ARG SECRET_PK

ENV APP_ENV $APP_ENV
ENV DB_HOST $DB_HOST
ENV DB_PORT $DB_PORT
ENV DB_USERNAME $DB_USERNAME
ENV DB_PASSWORD $DB_PASSWORD
ENV DB_DATABASE $DB_DATABASE
ENV DB_DEBUG $DB_DEBUG
ENV DB_SYNC $DB_SYNC
ENV CORS_DOMAIN $CORS_DOMAIN
ENV SECRET_PK $SECRET_PK
ENV PORT 8080

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json ./
RUN npm install --production
USER node
EXPOSE 8080
COPY --from=builder --chown=node:node /app/dist  .
CMD ["npm", "run", "start:prod"]