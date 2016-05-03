#Check 7Zip before running anything. 
if (-not (test-path "$env:ProgramFiles\7-Zip\7z.exe")) {throw "$env:ProgramFiles\7-Zip\7z.exe needed"} 

function npmdedupe($dir){
    pushd $dir
    Write-Host NPM dedupe $PWD
    npm dedupe
    popd

}

$sourceDir = Resolve-Path ( Join-Path $PSScriptRoot ".." )
$zipfile = Join-Path $sourceDir "artifacts\win\cmdport.zip"
$artifactsDir = [System.IO.Path]::GetDirectoryName($zipfile);

#flatten the packages. 
npmdedupe($sourceDir)
npmdedupe(Join-Path $sourceDir "client")

If(Test-path $zipfile) {Remove-item $zipfile}

#Zip files. 
Write-Host Packing [$sourceDir] into [$destination]

#remove root dir for 7zip. 
$sourceDir7zip = Join-Path $sourceDir   "*";
if (-not (test-path "$env:ProgramFiles\7-Zip\7z.exe")) {throw "$env:ProgramFiles\7-Zip\7z.exe needed"} 
set-alias sz "$env:ProgramFiles\7-Zip\7z.exe"  
sz a -mx=9 "-x!_creds.js" $zipfile $sourceDir7zip