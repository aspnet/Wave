pushd `dirname $0` > /dev/null
docker build -t wave:debug --file Dockerfile.debug . 
docker rm -f wave
docker run -it  --net="host" -p 8000:8000/tcp -v `readlink -f ..`:/wave --name wave wave:debug 