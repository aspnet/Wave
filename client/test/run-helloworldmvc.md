# HelloWorldMvc
## Test

| Command     | Host      |Description|
|-------------|-----------|-----------|
| `git clone -b brecon/hosting $(scriptSource)` <config cwd="$(basepath)"/> | $(server) | Clone the repo | 
| `build.ps1 clean` <config cwd="$(basepath)\Performance"/>| $(server) | Install CLI |
| `c:\users\asplab\appdata\local\microsoft\dotnet\dotnet.exe restore --infer-runtimes` <config cwd="$(basepath)\Performance\testapp\HelloWorldMvc"/> | $(server) | Restore packages |
| `c:\users\asplab\appdata\local\microsoft\dotnet\dotnet.exe publish -c release` <config cwd="$(basepath)\Performance\testapp\HelloWorldMvc"/> | $(server) | Restore packages |
| `c:\users\asplab\appdata\local\microsoft\dotnet\dotnet.exe .\$(appdll)` <config cwd="$(basepath)\Performance\testapp\HelloWorldMvc\bin\release\netcoreapp1.0\publish"/> | $(server) | Run Server |

