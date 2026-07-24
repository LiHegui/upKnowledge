param(
    [Parameter(Mandatory = $true)]
    [string]$Username,

    [string]$DisplayName,

    [string]$EventType = "system.manual",

    [string]$Topic = "general",

    [string]$Title = "manual update",

    [ValidateSet("todo", "in_progress", "done", "skipped", "failed")]
    [string]$Status = "done",

    [ValidateSet("manual", "interviewer", "learn-plan", "kb-inject", "migration", "system")]
    [string]$Source = "manual",

    [double]$Score = [double]::NaN,

    [int]$Level = 0,

    [string]$DetailsJson = "{}",

    [switch]$InitOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-IsoNow {
    return (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
}

function New-EventId {
    $stamp = (Get-Date).ToString("yyyyMMdd-HHmmss")
    $rand = Get-Random -Minimum 100 -Maximum 1000
    return "evt-$stamp-$rand"
}

function Ensure-Array {
    param([object]$Value)
    if ($null -eq $Value) {
        return @()
    }
    if ($Value -is [System.Array]) {
        return $Value
    }
    return @($Value)
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$templatePath = Join-Path $scriptDir "_template.json"
$userPath = Join-Path $scriptDir ("{0}.json" -f $Username)

if (-not (Test-Path -Path $templatePath)) {
    throw "Template not found: $templatePath"
}

$now = Get-IsoNow

if (-not (Test-Path -Path $userPath)) {
    $archive = Get-Content -Path $templatePath -Raw | ConvertFrom-Json
    $archive.user.username = $Username
    if ([string]::IsNullOrWhiteSpace($DisplayName)) {
        $archive.user.displayName = $Username
    }
    else {
        $archive.user.displayName = $DisplayName
    }
    $archive.user.createdAt = $now
    $archive.user.updatedAt = $now
    $archive.summary.totalEvents = 0
    $archive.summary.interviewPracticeCount = 0
    $archive.summary.tsLevel = 0
    $archive.summary.lastPracticeAt = $null
    $archive.events = @()

    $archive | ConvertTo-Json -Depth 100 | Set-Content -Path $userPath -Encoding UTF8
}

if ($InitOnly.IsPresent) {
    Write-Output ("[INIT] {0}" -f $userPath)
    exit 0
}

$userArchive = Get-Content -Path $userPath -Raw | ConvertFrom-Json
$userArchive.events = Ensure-Array -Value $userArchive.events

try {
    $details = $DetailsJson | ConvertFrom-Json
}
catch {
    throw "DetailsJson must be valid JSON."
}

$event = [ordered]@{
    id = New-EventId
    type = $EventType
    topic = $Topic
    title = $Title
    status = $Status
    source = $Source
    createdAt = $now
}

if (-not [double]::IsNaN($Score)) {
    $event.score = $Score
}

if ($Level -gt 0) {
    $event.level = $Level
}

if ($null -ne $details) {
    $event.details = $details
}

$eventObj = New-Object psobject -Property $event
$events = @($userArchive.events)
$events += $eventObj
$userArchive.events = $events

$userArchive.summary.totalEvents = @($userArchive.events).Count
$userArchive.summary.interviewPracticeCount = @($userArchive.events | Where-Object { $_.type -eq "interview.practice" }).Count

if ($Level -gt [int]$userArchive.summary.tsLevel) {
    $userArchive.summary.tsLevel = $Level
}

if ($EventType -match "^(interview\.|learning\.|kb\.)") {
    $userArchive.summary.lastPracticeAt = $now
}

$userArchive.user.updatedAt = $now

$userArchive | ConvertTo-Json -Depth 100 | Set-Content -Path $userPath -Encoding UTF8

Write-Output ("[OK] {0}" -f $userPath)
Write-Output ("[EVENT] {0} | {1}" -f $EventType, $Title)
