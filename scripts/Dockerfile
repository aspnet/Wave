FROM node:argon
RUN apt-get update && apt-get install git
RUN git clone http://github.com/aspnet/wave
WORKDIR /wave
RUN npm install
EXPOSE 8000
CMD node setup.js -h ${BROKER} -u ${USERNAME} -P ${PASSWORD} && node app.js
