param(
  [string]$ExcelPath = "C:\Users\drivero\OneDrive - GRUPODISAL\Escritorio\Listado de Instrumentos de Medición(plan de Calibración)-Backup 07052026.xlsx"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$DataDir = Join-Path $Root "data"
New-Item -ItemType Directory -Force -Path $DataDir | Out-Null

if (-not (Test-Path -LiteralPath $ExcelPath)) {
  throw "No se encontro el archivo Excel: $ExcelPath"
}

$excel = $null
$wb = $null

try {
  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false
  $wb = $excel.Workbooks.Open($ExcelPath)
  $ws = $wb.Worksheets.Item("INSTRUMENTOS")
  $used = $ws.UsedRange
  $rows = $used.Rows.Count
  $cols = $used.Columns.Count

  $headers = @()
  for ($c = 1; $c -le $cols; $c++) {
    $header = [string]($used.Cells.Item(2, $c).Text)
    if ([string]::IsNullOrWhiteSpace($header)) {
      $header = "Columna_$c"
    }
    $headers += $header.Trim()
  }

  $items = New-Object System.Collections.Generic.List[object]
  for ($r = 3; $r -le $rows; $r++) {
    $obj = [ordered]@{}
    $hasData = $false
    for ($c = 1; $c -le $cols; $c++) {
      $value = [string]($used.Cells.Item($r, $c).Text)
      $value = $value.Trim()
      if (-not [string]::IsNullOrWhiteSpace($value)) {
        $hasData = $true
      }
      $obj[$headers[$c - 1]] = $value
    }

    if ($hasData -and -not [string]::IsNullOrWhiteSpace($obj["Codigo"]) -or -not [string]::IsNullOrWhiteSpace($obj["Código"])) {
      $items.Add([pscustomobject]$obj)
    }
  }

  $payload = [ordered]@{
    fuente = $ExcelPath
    hoja = "INSTRUMENTOS"
    generado = (Get-Date).ToString("s")
    filas = $items.Count
    columnas = $headers
    instrumentos = $items
  }

  $jsonPath = Join-Path $DataDir "instrumentos.json"
  $jsPath = Join-Path $DataDir "instrumentos.js"
  $columnsPath = Join-Path $DataDir "columnas.txt"
  $json = $payload | ConvertTo-Json -Depth 6
  Set-Content -LiteralPath $jsonPath -Value $json -Encoding UTF8
  Set-Content -LiteralPath $jsPath -Value ("window.METROLOGIA_DATA = " + $json + ";") -Encoding UTF8
  Set-Content -LiteralPath $columnsPath -Value $headers -Encoding UTF8

  Write-Host "Datos actualizados: $($items.Count) instrumentos"
  Write-Host $jsPath
}
finally {
  if ($wb) {
    $wb.Close($false)
  }
  if ($excel) {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
  }
}
