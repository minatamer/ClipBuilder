$ErrorActionPreference = 'Stop'
$taskRepo = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$taskTools = Join-Path $taskRepo '.local-build/tools'
New-Item -ItemType Directory -Path $taskTools -Force | Out-Null
if ((Get-Item -LiteralPath $taskTools).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'owner_tool_path_invalid' }
$taskArchive = Join-Path $taskTools 'ffmpeg-release-essentials.zip'
$taskExpected = '60f467265b1e312373dbcd92200c2618a74850f98d3d078e94296bb3fa2047ba'
if (!(Test-Path -LiteralPath $taskArchive)) {
  Invoke-WebRequest -Uri 'https://github.com/GyanD/codexffmpeg/releases/download/9.0.2/ffmpeg-9.0.2-essentials_build.zip' -OutFile $taskArchive -TimeoutSec 120
}
if ((Get-FileHash -LiteralPath $taskArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskExpected) { throw 'owner_tool_checksum_mismatch' }
$taskDestination = Join-Path $taskTools 'ffmpeg-release'
if (Test-Path -LiteralPath $taskDestination) {
  if ((Get-Item -LiteralPath $taskDestination).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'owner_tool_path_invalid' }
  Write-Output 'Owner tooling already extracted; owner startup verifies executable checksums.'
} else {
  Expand-Archive -LiteralPath $taskArchive -DestinationPath $taskDestination
  Write-Output 'Owner tooling prepared locally. No media or provider access.'
}
