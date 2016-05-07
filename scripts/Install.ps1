param(
     [string]$url = "https://coreperf.blob.core.windows.net/cmdport/win/cmdport.zip",
     [ValidateScript({[System.IO.Path]::IsPathRooted($_)})]
     [string]$target_dir = $target,
     [string]$broker_addr = $broker,
     [string]$broker_username = $username,
     [string]$broker_password = $password
)

if(test-path $target_dir)
{
    Write-Error "$target_dir already exists"
    exit 1;
}

mkdir -force $target_dir
$zipfilePath = Join-Path $target_dir "_temp_download.zip"

"Downloading [$url]`n"
$client = new-object System.Net.WebClient
$client.DownloadFile( $url, $zipfilePath )

"Unzipping to [$target_dir]`n"
#Load the assembly
[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
#Unzip the file
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipfilePath, $target_dir);

pushd $target_dir
node setup.js -h $broker_addr -u $broker_username -P $broker_password

npm install -g forever 
forever start app.js
