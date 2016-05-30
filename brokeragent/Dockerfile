FROM ubuntu:14.04 
ENV DEBIAN_FRONTEND noninteractive

# Install prereqs
COPY install-prereqs.sh .
RUN ./install-prereqs.sh

# Broker setup
COPY setpwd.sh .
EXPOSE 1883
EXPOSE 1884
COPY mosquitto.conf /etc/mosquitto/mosquitto.conf
COPY aclfile.conf /etc/mosquitto/aclfile.conf
RUN touch /etc/mosquitto/pwfile

# Agent Setup
RUN git clone http://github.com/aspnet/wave
WORKDIR /wave
RUN npm install
RUN ./scripts/write_version.sh
EXPOSE 8000
CMD /setpwd.sh ${ADMINPWD} ${READPWD} && service mosquitto restart && /usr/bin/node setup.js -h ${BROKER} -p {PORT} -u ${USERNAME} -P ${PASSWORD} && /usr/bin/node app.js

