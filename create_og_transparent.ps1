Add-Type -AssemblyName System.Drawing

$inputPath = "assets/logo.png"
$outputPath = "assets/og-whatsapp.png"

$img = [System.Drawing.Image]::FromFile($inputPath)

# Crear lienzo de 400x400 px con canal Alfa transparente
$canvas = New-Object System.Drawing.Bitmap(400, 400, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($canvas)

$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Dibujar el logo centrado con PADDING de 50px (300x300 dentro de 400x400)
# Esto asegura que NUNCA se recorte el texto del borde circular en WhatsApp
$padding = 50
$targetSize = 300
$g.DrawImage($img, $padding, $padding, $targetSize, $targetSize)

# Guardar como PNG transparente
$canvas.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$img.Dispose()

$file = Get-Item $outputPath
Write-Host "✅ PNG Transparente con Padding creado: $($file.Name) - Peso: $($file.Length) bytes"
