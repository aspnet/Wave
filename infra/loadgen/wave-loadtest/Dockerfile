FROM dotnetperf/wave
RUN git pull
RUN git checkout loadtest
WORKDIR /wave/infra/loadgen/wave-loadtest/
RUN npm install
RUN npm link
WORKDIR /wave
