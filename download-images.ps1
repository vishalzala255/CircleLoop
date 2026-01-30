# PowerShell script to download images for CircleLoop project
# Run this from the project root directory

Write-Host "CircleLoop Image Downloader" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Create images directory if it doesn't exist
$imagesDir = "public\images"
if (-not (Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir | Out-Null
    Write-Host "Created $imagesDir directory" -ForegroundColor Green
}

# Define images to download
$images = @(
    @{
        url = "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "hero-ewaste-recycling.jpg"
        description = "Hero - E-Waste Recycling Bins"
    },
    @{
        url = "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "green-jobs.jpg"
        description = "Impact - Green Jobs Creation"
    },
    @{
        url = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "resource-recovery.jpg"
        description = "Impact - Resource Recovery"
    },
    @{
        url = "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?q=80&w=1365&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "collection-process.jpg"
        description = "Process - Collection Service"
    },
    @{
        url = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "ewaste-statistics.jpg"
        description = "Statistics - E-Waste Pile"
    },
    @{
        url = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3"
        filename = "recycling-marketplace.jpg"
        description = "Marketplace - Electronics Inventory"
    }
)

Write-Host "Downloading $($images.Count) images..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($image in $images) {
    $outputPath = Join-Path $imagesDir $image.filename
    
    # Check if file already exists
    if (Test-Path $outputPath) {
        Write-Host "Skipping $($image.filename) (already exists)" -ForegroundColor Yellow
        $successCount++
        continue
    }
    
    try {
        Write-Host "Downloading: $($image.description)" -ForegroundColor White
        Write-Host "   -> $($image.filename)" -ForegroundColor Gray
        
        # Download the image
        Invoke-WebRequest -Uri $image.url -OutFile $outputPath -UseBasicParsing
        
        $fileSize = (Get-Item $outputPath).Length / 1KB
        Write-Host "   Downloaded successfully ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green
        Write-Host ""
        $successCount++
    }
    catch {
        Write-Host "   Failed to download: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        $failCount++
    }
}

Write-Host "================================" -ForegroundColor Green
Write-Host "Download Summary:" -ForegroundColor Cyan
Write-Host "   Successful: $successCount" -ForegroundColor Green
Write-Host "   Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($successCount -eq $images.Count) {
    Write-Host "All images downloaded successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run npm run dev to start the development server" -ForegroundColor White
    Write-Host "2. Visit http://localhost:3000 to see the images" -ForegroundColor White
} else {
    Write-Host "Some images failed to download." -ForegroundColor Yellow
    Write-Host "The app will still work using CDN URLs from Unsplash." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Note: Images are sourced from Unsplash (free for commercial use)" -ForegroundColor Gray
