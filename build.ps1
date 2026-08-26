# Bouwt alle pagina's van Dobosh Bouwwerken.
#
#   parts/_header.html, _mobile.html, _footer.html  = gedeelde onderdelen
#   parts/<pagina>.html                             = de inhoud van die pagina
#
# Draaien:  powershell -ExecutionPolicy Bypass -File build.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$enc  = New-Object System.Text.UTF8Encoding $false

$header = Get-Content (Join-Path $root 'parts\_header.html') -Raw -Encoding UTF8
$mobile = Get-Content (Join-Path $root 'parts\_mobile.html') -Raw -Encoding UTF8
$footer = Get-Content (Join-Path $root 'parts\_footer.html') -Raw -Encoding UTF8

# actieve/inactieve staat van de menu-items
$navOn  = 'px-4 py-2 text-sm font-medium transition-colors duration-200 relative text-[#FACC15]'
$navOff = 'px-4 py-2 text-sm font-medium transition-colors duration-200 relative text-[#94A3B8] hover:text-white'
$mobOn  = 'block px-4 py-3 text-base font-medium rounded-sm transition-colors text-[#FACC15] bg-[#1E293B]'
$mobOff = 'block px-4 py-3 text-base font-medium rounded-sm transition-colors text-[#94A3B8] hover:text-white hover:bg-[#1E293B]'
$underline = '<div class="absolute bottom-0 left-4 right-4 h-0.5 bg-[#FACC15]"></div>'

function Chrome($file) {
  # desktopmenu: het item van deze pagina krijgt de gele kleur + onderstreping
  $h = [regex]::Replace($header,
        '<a class="' + [regex]::Escape($navOff) + '" href="' + [regex]::Escape($file) + '">([^<]*)</a>',
        { param($m) '<a class="' + $navOn + '" href="' + $file + '">' + $m.Groups[1].Value + $underline + '</a>' })
  # mobiel menu: alleen de kleur wisselt
  $m2 = $mobile.Replace('<a class="' + $mobOff + '" href="' + $file + '">',
                        '<a class="' + $mobOn  + '" href="' + $file + '">')
  @{ header = $h; mobile = $m2 }
}

function Build($file, $title, $desc, $body) {
  $c = Chrome $file
  $page = @"
<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>$title</title>
<meta name="description" content="$desc">
<meta name="keywords" content="bouwbedrijf Den Haag, renovatie, schilderwerk, stucwerk, timmerwerk, badkamer renovatie, aannemer Zuid-Holland">
<link rel="icon" type="image/png" href="images/0e842c66d_logo.png">
<meta property="og:title" content="$title">
<meta property="og:description" content="$desc">
<meta property="og:image" content="images/0e842c66d_logo.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Dobosh Bouwwerken">
<link rel="stylesheet" href="css/site.css">
<link rel="stylesheet" href="css/app.css">
<script>document.documentElement.className += ' js';</script>
</head>
<body>
<div id="root">
<div class="min-h-screen flex flex-col">

<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-[#0F172A]/95 backdrop-blur-md py-4">
$($c.header)
$($c.mobile)
</nav>

$body

$footer

</div>
</div>
<script src="js/app.js"></script>
</body>
</html>
"@
  [System.IO.File]::WriteAllText((Join-Path $root $file), $page, $enc)
  Write-Host ("  {0,-16} {1,8} bytes" -f $file, $page.Length)
}

$pages = @(
  @{ file='index.html';     title='Dobosh Bouwwerken';                desc='Allround bouwbedrijf in Den Haag voor schilderwerk, stucwerk, timmerwerk, badkamers, installatie en complete renovaties. Vakmanschap waar u op kunt bouwen.' },
  @{ file='over-ons.html';  title='Over Ons | Dobosh Bouwwerken';     desc='Het verhaal achter Dobosh Bouwwerken: een allround bouwbedrijf uit Den Haag met ruim 15 jaar ervaring in renovatie en afbouw.' },
  @{ file='diensten.html';  title='Diensten | Dobosh Bouwwerken';     desc='Onze diensten: schilderen, stucen, timmeren, badkamerrenovatie, installatiewerk en volledige woningrenovaties in Den Haag en omstreken.' },
  @{ file='projecten.html'; title='Projecten | Dobosh Bouwwerken';    desc='Een selectie van onze projecten: badkamers, schilderwerk, stucwerk, timmerwerk, isolatie en kunststof ramen.' },
  @{ file='contact.html';   title='Contact | Dobosh Bouwwerken';      desc='Neem contact op met Dobosh Bouwwerken in Den Haag. Bel 06-84932216 of mail ons voor een vrijblijvende offerte.' }
)

Write-Host "Pagina's bouwen:"
foreach ($p in $pages) {
  $name = [System.IO.Path]::GetFileNameWithoutExtension($p.file)
  $body = Get-Content (Join-Path $root "parts\$name.html") -Raw -Encoding UTF8
  Build $p.file $p.title $p.desc $body.Trim()
}
Write-Host 'Klaar.'
