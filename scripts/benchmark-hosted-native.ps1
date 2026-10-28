param(
  [Parameter(Mandatory)][string]$DockerHost,
  [Parameter(Mandatory)][string]$DockerConfig,
  [Parameter(Mandatory)][string]$ScratchDirectory,
  [Parameter(Mandatory)][string]$Image,
  [Parameter(Mandatory)][ValidateSet('4cpu4g','2cpu8g','2cpu4g','1cpu4g','1cpu2g')][string]$Profile,
  [ValidateSet('hd30','landscape4k60','portrait4k60')][string]$Case,
  [ValidateSet(12,60)][int]$DurationSeconds=60,
  [switch]$ConstantFocus,
  [ValidateSet(1,3)][int]$ClipCount=1,
  [switch]$Archive
)
$ErrorActionPreference = 'Stop'
if($ClipCount -eq 3 -and ($DurationSeconds -ne 12 -or -not $Case)) { throw 'The retained batch uses three 12-second cuts from one selected source.' }
$clScratch = (Resolve-Path -LiteralPath $ScratchDirectory).Path
if (-not (Test-Path -LiteralPath (Join-Path $clScratch 'benchmark.mjs')) -or
    -not (Test-Path -LiteralPath (Join-Path $clScratch 'fixtures/picture.png'))) {
  throw 'Generate and bundle the fixed synthetic fixtures first.'
}
$clCpu = $Profile.Substring(0,1)
$clMemory = $Profile.Substring(4)
$clName = 'cl125-' + $Profile + '-' + [guid]::NewGuid().ToString('N').Substring(0,8)
$clLabel = $Profile + $(if ($Case) { '-' + $Case } else { '' }) + '-' + $DurationSeconds + $(if($ConstantFocus){'-constant'}else{'-dynamic'})
if($ClipCount -eq 3){$clLabel += '-batch3'}
if($Archive){$clLabel += '-quality'}
$clLog = Join-Path $clScratch ($clLabel + '.log')
$clMeta = Join-Path $clScratch ($clLabel + '.json')
$clImageId = & docker --host $DockerHost --config $DockerConfig image inspect $Image --format '{{.Id}}'
if ($LASTEXITCODE -ne 0) { throw 'Local benchmark image missing.' }
$clArgs = @('--host',$DockerHost,'--config',$DockerConfig,'run','--name',$clName,
  '--label','clipbuilder.benchmark=CL-125','--init','--network','none','--read-only',
  '--cpus',$clCpu,'--memory',$clMemory,'--memory-swap',$clMemory,'--pids-limit','512',
  '--shm-size','256m','--tmpfs','/tmp:size=6g,mode=1777',
  '--tmpfs','/home/node:size=128m,uid=1000,gid=1000,mode=0700',
  '--mount',"type=bind,source=$clScratch/benchmark.mjs,target=/app/dist/benchmark.mjs,readonly",
  '--mount',"type=bind,source=$clScratch/fixtures,target=/fixtures,readonly")
if($Archive){
  $clArchive=Join-Path $clScratch ($clLabel+'-media')
  if(Test-Path -LiteralPath $clArchive){throw 'Synthetic archive already exists.'}
  New-Item -ItemType Directory -Path $clArchive | Out-Null
  $clArgs+=@('--mount',"type=bind,source=$clArchive,target=/results")
}
$clArgs+=@('--entrypoint','node',$clImageId.Trim(),'/app/dist/benchmark.mjs','run')
$clArgs += $(if ($Case) { $Case } else { 'all' })
$clArgs += [string]$DurationSeconds
$clArgs += $(if ($ConstantFocus) { 'constant' } else { 'dynamic' })
$clArgs += [string]$ClipCount
$clArgs += $(if($Archive){'archive'}else{'discard'})
$clStarted = [DateTime]::UtcNow
try {
  & docker @clArgs *> $clLog
  $clExit = $LASTEXITCODE
  $clInspect = & docker --host $DockerHost --config $DockerConfig inspect $clName | ConvertFrom-Json
  if ($LASTEXITCODE -ne 0) { throw 'Benchmark container inspection failed.' }
  [ordered]@{
    profile=$Profile; case=$Case; duration=$DurationSeconds; constantFocus=[bool]$ConstantFocus;
    clipCount=$ClipCount;
    archived=[bool]$Archive;
    image=$clImageId.Trim(); exitCode=$clExit;
    seconds=([DateTime]::UtcNow-$clStarted).TotalSeconds;
    oomKilled=$clInspect[0].State.OOMKilled;
    memory=$clInspect[0].HostConfig.Memory;
    memorySwap=$clInspect[0].HostConfig.MemorySwap;
    nanoCpus=$clInspect[0].HostConfig.NanoCpus;
    network=$clInspect[0].HostConfig.NetworkMode;
    readOnly=$clInspect[0].HostConfig.ReadonlyRootfs;
    tmpfs=$clInspect[0].HostConfig.Tmpfs
  } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $clMeta
  Get-Content -LiteralPath $clLog | Where-Object { $_.StartsWith('{') }
  if ($clExit -ne 0) { throw "Benchmark failed; inspect private log $clLog" }
} finally {
  # Only the exact container this invocation created is removed, including on failure.
  & docker --host $DockerHost --config $DockerConfig rm -f $clName | Out-Null
}
