#!/usr/bin/env pwsh

# Docker run script for Claude Code container
# Builds and runs a container with Claude Code pre-installed

param(
    [string]$WorkspacePath = "d:\repos\snapmeal.cloud.functions",
    [string]$ImageName = "claude-image",
    [switch]$Build,
    [switch]$NoBuild,
    [string]$AnthropicApiKey = $env:ANTHROPIC_API_KEY
)

# Check if the local path exists
if (-not (Test-Path $WorkspacePath)) {
    Write-Error "Repository path does not exist: $WorkspacePath"
    exit 1
}

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Error "Docker is not running or not installed"
    exit 1
}

# Check if image exists or if build is requested
$imageExists = docker images -q $ImageName 2>$null
if (-not $imageExists -or $Build) {
    if (-not $NoBuild) {
        Write-Host "Building Claude Code Docker image..." -ForegroundColor Yellow
        Write-Host "This may take a few minutes on first run..." -ForegroundColor Yellow
        
        # Build the image
        docker build -t $ImageName .
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to build Docker image"
            exit 1
        }
        
        Write-Host "✅ Image built successfully!" -ForegroundColor Green
    }
} else {
    Write-Host "Using existing Docker image: $ImageName" -ForegroundColor Green
}

Write-Host "Starting Claude Code container..." -ForegroundColor Green
Write-Host "Image: $ImageName" -ForegroundColor Cyan
Write-Host "Workspace: $WorkspacePath" -ForegroundColor Cyan

# Prepare environment variables
$envArgs = @()
if ($AnthropicApiKey) {
    $envArgs += "-e", "ANTHROPIC_API_KEY=$AnthropicApiKey"
    Write-Host "API Key: Set from environment" -ForegroundColor Cyan
} else {
    Write-Host "API Key: Not set (you'll need to authenticate inside container)" -ForegroundColor Yellow
}

# Add git configuration if available
if ($env:GIT_AUTHOR_NAME) {
    $envArgs += "-e", "GIT_AUTHOR_NAME=$env:GIT_AUTHOR_NAME"
}
if ($env:GIT_AUTHOR_EMAIL) {
    $envArgs += "-e", "GIT_AUTHOR_EMAIL=$env:GIT_AUTHOR_EMAIL"
}

Write-Host ""
Write-Host "🤖 Starting Claude Code development environment..." -ForegroundColor Magenta

# Run the Docker command with all arguments
$dockerArgs = @(
    "run", "-it", "--rm"
    "-v", "${WorkspacePath}:/home/developer/workspace"
    $envArgs
    $ImageName
)

& docker @dockerArgs