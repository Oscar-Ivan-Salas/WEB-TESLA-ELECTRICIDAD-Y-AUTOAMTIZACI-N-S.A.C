Add-Type -AssemblyName System.Drawing

$inputPath = "assets/logo.png"
$outputPath = "assets/og-whatsapp.jpg"

$img = [System.Drawing.Image]::FromFile($inputPath)
$canvas = New-Object System.Drawing.Bitmap(600, 600)
$g = [System.Drawing.Graphics]::FromImage($canvas)

# Fondo oscuro elegante (#111111)
$g.Clear([System.Drawing.ColorTranslator]::FromHtml('#111111'))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Dibujar logo centrado (500x500 dentro de 600x600)
$g.DrawImage($img, 50, 50, 500, 500)

# Guardar como JPEG con calidad 85
$encoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, 85)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }

$canvas.Save($outputPath, $codec, $encoderParams)

$g.Dispose()
$canvas.Dispose()
$img.Dispose()

$file = Get-Item $outputPath
Write-Host "✅ Imagen creada exitosamente: $($file.Name) - Peso: $($file.Length) bytes"
