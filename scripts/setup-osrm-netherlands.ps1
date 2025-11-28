# OSRM Data Setup Script for Netherlands (PowerShell)
# This script downloads and prepares Netherlands map data for OSRM

Write-Host "🗺️  OSRM Netherlands Data Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DATA_DIR = ".\osrm-data"
$COUNTRY = "netherlands"
$OSM_FILE = "$COUNTRY-latest.osm.pbf"
$DOWNLOAD_URL = "https://download.geofabrik.de/europe/$OSM_FILE"

# Create data directory
if (-not (Test-Path $DATA_DIR)) {
    New-Item -ItemType Directory -Path $DATA_DIR | Out-Null
}

Set-Location $DATA_DIR

# Download Netherlands map data
Write-Host "📥 Downloading Netherlands map data (~200MB)..." -ForegroundColor Yellow
if (-not (Test-Path $OSM_FILE)) {
    try {
        Invoke-WebRequest -Uri $DOWNLOAD_URL -OutFile $OSM_FILE -UseBasicParsing
        Write-Host "✅ Download complete" -ForegroundColor Green
    } catch {
        Write-Host "❌ Download failed: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "ℹ️  Map data already exists, skipping download" -ForegroundColor Blue
}

# Extract and prepare data
Write-Host ""
Write-Host "🔧 Extracting and preparing OSRM data..." -ForegroundColor Yellow
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/$OSM_FILE

Write-Host "📊 Partitioning data..." -ForegroundColor Yellow
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/$COUNTRY-latest.osrm

Write-Host "🎯 Customizing data..." -ForegroundColor Yellow
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/$COUNTRY-latest.osrm

Write-Host ""
Write-Host "✅ OSRM data preparation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start OSRM server: docker-compose -f docker-compose.prod.yml up -d osrm-netherlands"
Write-Host "2. Test routing: curl 'http://localhost:5000/route/v1/driving/4.9041,52.3676;4.8952,52.3702'"
Write-Host ""

$size = (Get-ChildItem -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "💾 Data size: $([math]::Round($size, 2)) MB" -ForegroundColor Blue
Write-Host "📍 Region: Netherlands (Amsterdam area)" -ForegroundColor Blue

Set-Location ..
