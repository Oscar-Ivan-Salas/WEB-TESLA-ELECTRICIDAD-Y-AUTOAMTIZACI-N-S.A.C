Add-Type -AssemblyName System.Drawing

$inputPath = "assets/logo.png"
$outputPath = "assets/og-whatsapp.png"

$img = [System.Drawing.Image]::FromFile($inputPath)

# Crear imagen transparente cuadrada de 300x300px (Súper liviana)
$canvas = New-Object System.Drawing.Bitmap(300, 300, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($canvas)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Dibujar logo ajustado sin fondo
$g.DrawImage($img, 0, 0, 300, 300)

# Guardar como PNG transparente
$canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$img.Dispose()

$file = Get-Item $outputPath
Write-Host "✅ PNG Transparente de 300x300 creado: $($file.Name) - Peso: $($file.Length) bytes"
