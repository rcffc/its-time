FROM node:12.2.0-alpine
WORKDIR /src
ENV PATH /app/node_modules/.bin:$PATH
COPY package*.json ./
RUN npm install
CMD ["npm", "start"]
