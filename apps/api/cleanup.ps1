Write-Host "Backend temizligi basliyor..." -ForegroundColor Cyan

# TEST & DEBUG DOSYALARI
Write-Host "Test dosyalari siliniyor..." -ForegroundColor Yellow
Remove-Item check-backend.js -ErrorAction SilentlyContinue
Remove-Item check-exp-schema.js -ErrorAction SilentlyContinue
Remove-Item check-full.js -ErrorAction SilentlyContinue
Remove-Item check-schema.js -ErrorAction SilentlyContinue
Remove-Item test-api.js -ErrorAction SilentlyContinue
Remove-Item test-cities.js -ErrorAction SilentlyContinue
Remove-Item src\test-generate.html -ErrorAction SilentlyContinue

# BACKUP DOSYALARI
Write-Host "Backup dosyalari siliniyor..." -ForegroundColor Yellow
Remove-Item gateway\index.js.backup -ErrorAction SilentlyContinue
Remove-Item schema.sq -ErrorAction SilentlyContinue
Remove-Item schema.sql -ErrorAction SilentlyContinue

# PRISMA TAMAMEN
Write-Host "Prisma tamamen kaldiriliyor..." -ForegroundColor Yellow
Remove-Item -Recurse -Force prisma -ErrorAction SilentlyContinue
Remove-Item db\prisma.js -ErrorAction SilentlyContinue

# NEXT.JS KARISMASI
Write-Host "Next.js sayfasi siliniyor..." -ForegroundColor Yellow
Remove-Item -Recurse -Force src\pages -ErrorAction SilentlyContinue

# DUPLICATE ROUTES
Write-Host "Duplicate route'lar siliniyor..." -ForegroundColor Yellow
Remove-Item src\routes\ai.ts -ErrorAction SilentlyContinue
Remove-Item src\routes\user-backup.js -ErrorAction SilentlyContinue
Remove-Item src\routes\users.js -ErrorAction SilentlyContinue

# UNUSED VALIDATORS
Write-Host "Kullanilmayan validator siliniyor..." -ForegroundColor Yellow
Remove-Item src\validators\ai.validator.js -ErrorAction SilentlyContinue

Write-Host