param(
     [Parameter(Mandatory = $true, ValueFromPipeline = $true)] 
     [string]$url,
     [ValidateScript({[System.IO.Path]::IsPathRooted($_)})]
     [string]$target,
     [string]$broker,
     [string]$username,
     [string]$password
)

if(test-path $target)
{
    Write-Error "$target already exists"
    exit 1;
}

mkdir -p $target
$zipfilePath = Join-Path $target "_temp_download.zip"

"Downloading [$url]`n"
$client = new-object System.Net.WebClient
$client.DownloadFile( $url, $zipfilePath )

"Unzipping to [$target]`n"
#Load the assembly
[System.Reflection.Assembly]::LoadWithPartialName("System.IO.Compression.FileSystem") | Out-Null
#Unzip the file
[System.IO.Compression.ZipFile]::ExtractToDirectory($zipfilePath, $target);

pushd $target
node setup.js $broker $username $password

npm install -g forever 
forever start app.js