FROM node:boron

MAINTAINER Reekoh

RUN apt-get update && apt-get install -y build-essential

RUN mkdir -p /home/node/servicenow
COPY . /home/node/servicenow

WORKDIR /home/node/servicenow

# Install dependencies
RUN npm install pm2 yarn -g
RUN yarn install

CMD ["pm2-docker", "--json", "app.yml"]
