pushd `dirname $0` > /dev/null
docker build --no-cache -t dotnetperf/broker .
