Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$pngPath = Join-Path $root 'assets\app-icon.png'
$icoPath = Join-Path $root 'assets\app-icon.ico'
$size = 256
$bitmap = [System.Drawing.Bitmap]::new($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::Transparent)

function New-RoundedRectanglePath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$red = [System.Drawing.ColorTranslator]::FromHtml('#ad3735')
$white = [System.Drawing.Color]::White
$background = New-RoundedRectanglePath 8 8 240 240 62
$graphics.FillPath([System.Drawing.SolidBrush]::new($red), $background)

$pen = [System.Drawing.Pen]::new($white, 16)
$pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawLines($pen, [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(73, 60), [System.Drawing.PointF]::new(157, 60),
  [System.Drawing.PointF]::new(183, 86), [System.Drawing.PointF]::new(183, 194),
  [System.Drawing.PointF]::new(73, 194), [System.Drawing.PointF]::new(73, 60)
))
$graphics.DrawLine($pen, 157, 60, 157, 86)
$graphics.DrawLine($pen, 157, 86, 183, 86)
$linePen = [System.Drawing.Pen]::new($white, 15)
$linePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$linePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($linePen, 103, 113, 153, 113)
$graphics.DrawLine($linePen, 103, 145, 145, 145)
$graphics.DrawLine($linePen, 103, 176, 132, 176)
$graphics.FillEllipse([System.Drawing.SolidBrush]::new($white), 54, 41, 38, 38)

$bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.File]::Open($icoPath, [System.IO.FileMode]::Create)
$writer = [System.IO.BinaryWriter]::new($stream)
$writer.Write([UInt16]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]1)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([Byte]0)
$writer.Write([UInt16]1)
$writer.Write([UInt16]32)
$writer.Write([UInt32]$pngBytes.Length)
$writer.Write([UInt32]22)
$writer.Write($pngBytes)
$writer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
