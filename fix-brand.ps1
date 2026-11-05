$root = "C:\Users\ACER NITRO\OneDrive\Desktop\dev\Roots.co"
$files = @(
    "src/components/AccountModal.jsx",
    "src/components/BenefitsBar.jsx",
    "src/components/ChatWidget.jsx",
    "src/components/EditorialBand.jsx",
    "src/components/Footer.jsx",
    "src/components/Header.jsx",
    "src/components/Hero.jsx",
    "src/context/AuthContext.jsx",
    "src/data/info.js",
    "src/data/products.js",
    "src/data/site.js",
    "src/lib/utils.js",
    "public/images/banners/store.svg",
    "scripts/generate-assets.mjs",
    "docker-compose.yml",
    "Dockerfile",
    "README.md",
    "prd.md",
    "index.html"
)

foreach ($f in $files) {
    $p = Join-Path $root $f
    if (Test-Path $p) {
        $c = [System.IO.File]::ReadAllText($p)
        $c2 = $c.Replace("ROOT.CO", "ROOTS.CO")
        if ($c -ne $c2) {
            [System.IO.File]::WriteAllText($p, $c2)
            Write-Host "Updated: $f"
        } else {
            Write-Host "No change: $f"
        }
    } else {
        Write-Host "Not found: $f"
    }
}
