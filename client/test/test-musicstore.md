# HelloWorldMvc
## Test

| Command     | Host      |Description|
|-------------|-----------|-----------|
| `git clone -b release $(scriptSource)` <config cwd="$(basepath)"/> | $(server) | Clone the repo | 
| `build.ps1 clean` <config cwd="$(basepath)\musicstore"/>| $(server) | Install CLI |
| `dotnet.exe restore --infer-runtimes` <config cwd="$(basepath)\musicstore\src\musicstore"/> | $(server) | Restore packages |
| `cmd.exe /c set` <config cwd="$(basepath)\musicstore\src\musicstore"/> | $(server) | Restore packages |
| `dotnet.exe run` <config cwd="$(basepath)\musicstore\src\musicstore"/> | $(server) | Restore packages |
| `npm install loadtest -g` <config cwd="$(basepath)"/> | $(client) | Restore packages |
| `loadtest -n 100000 -c 10 http://$(server):5000` <config cwd="$(basepath)"/> | $(client) | Restore packages |