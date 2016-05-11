# HelloWorldMvc
## Test

| Command     | Host      |Description|
|-------------|-----------|-----------|
| `git clone -b sivagms/perf $(scriptSource)` <config cwd="$(basepath)"/> | $(server) | Clone the repo | 
| `build.ps1 clean` <config cwd="$(basepath)\musicstore"/>| $(server) | Install CLI |
| `dotnet.exe restore --infer-runtimes` <config cwd="$(basepath)\musicstore\src\musicstore"/> | $(server) | Restore packages |
| `dotnet.exe run --server.urls=http://$(server):5000` <config cwd="$(basepath)\musicstore\src\musicstore" async="true"/> | $(server) | Restore packages |
| `npm install loadtest -g` <config cwd="$(basepath)"/> | $(client) | Restore packages |
| `loadtest -n 1000 -c 10 http://$(server):5000` <config cwd="$(basepath)"/> | $(client) | Restore packages |