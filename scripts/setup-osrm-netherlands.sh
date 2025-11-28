#!/bin/bash

# OSRM Data Setup Script for Netherlands
# This script downloads and prepares Netherlands map data for OSRM

set -e

echo "🗺️  OSRM Netherlands Data Setup"
echo "================================"

# Configuration
DATA_DIR="./osrm-data"
COUNTRY="netherlands"
OSM_FILE="${COUNTRY}-latest.osm.pbf"
DOWNLOAD_URL="https://download.geofabrik.de/europe/${OSM_FILE}"

# Create data directory
mkdir -p "$DATA_DIR"
cd "$DATA_DIR"

# Download Netherlands map data
echo "📥 Downloading Netherlands map data (~200MB)..."
if [ ! -f "$OSM_FILE" ]; then
    wget -c "$DOWNLOAD_URL"
    echo "✅ Download complete"
else
    echo "ℹ️  Map data already exists, skipping download"
fi

# Extract and prepare data
echo "🔧 Extracting and preparing OSRM data..."
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-extract -p /opt/car.lua /data/$OSM_FILE

echo "📊 Partitioning data..."
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-partition /data/${COUNTRY}-latest.osrm

echo "🎯 Customizing data..."
docker run -t -v "${PWD}:/data" osrm/osrm-backend osrm-customize /data/${COUNTRY}-latest.osrm

echo ""
echo "✅ OSRM data preparation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start OSRM server: docker-compose -f docker-compose.prod.yml up -d osrm-netherlands"
echo "2. Test routing: curl 'http://localhost:5000/route/v1/driving/4.9041,52.3676;4.8952,52.3702'"
echo ""
echo "💾 Data size: $(du -sh . | cut -f1)"
echo "📍 Region: Netherlands (Amsterdam area)"
