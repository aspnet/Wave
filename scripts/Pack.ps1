#Check 7Zip before running anything. 
if (-not (test-path "$env:ProgramFiles\7-Zip\7z.exe")) {throw "$env:ProgramFiles\7-Zip\7z.exe needed"} 

function npmdedupe($dir){
    pushd $dir
    npm install
    Write-Host NPM dedupe $PWD
    npm dedupe
    popd
}

$sourceDir = Resolve-Path ( Join-Path $PSScriptRoot ".." )
$artifactsDir = Join-Path $sourceDir "artifacts\"
$zipfile = Join-Path $sourceDir "artifacts\win\cmdport.zip"

#flatten the packages. 
npmdedupe($sourceDir)
npmdedupe(Join-Path $sourceDir "client")

If(Test-path $zipfile) {Remove-item $zipfile}

$versionFile = Join-Path $artifactsDir "version.txt"
new-item -force -path $versionFile -value "" -type file
git log -n1 --format="%h" | Out-File -FilePath $versionFile -Encoding ascii 

#Zip files. 
Write-Host Packing [$sourceDir] into [$zipfile]

#remove root dir for 7zip. 
$sourceDir7zip = Join-Path $sourceDir   "*";
if (-not (test-path "$env:ProgramFiles\7-Zip\7z.exe")) {throw "$env:ProgramFiles\7-Zip\7z.exe needed"} 
set-alias sz "$env:ProgramFiles\7-Zip\7z.exe"  
sz a -mx=9 "-x!_creds.js" "-x!_envVars.json" "-x!_logdir.json.js" $zipfile $sourceDir7zip