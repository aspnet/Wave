pushd `dirname $0` > /dev/null
docker build -t dotnetperf/brokeragent .
