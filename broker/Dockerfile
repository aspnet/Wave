FROM ubuntu:14.04 
ENV DEBIAN_FRONTEND noninteractive
COPY install-broker.sh .
RUN ./install-broker.sh
COPY setpwd.sh .
EXPOSE 1883
EXPOSE 1884
RUN service mosquitto stop
COPY mosquitto.conf .
COPY aclfile.conf .
RUN touch /etc/mosquitto/pwfile
CMD ./setpwd.sh ${ADMINPWD} ${READPWD} && mosquitto -c mosquitto.conf
