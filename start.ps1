$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

py -3 -m venv backend/.venv
. .\backend\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","app.main:app","--reload","--port","8000" -WorkingDirectory "$root/backend"
Start-Process -FilePath "npm.cmd" -ArgumentList "install" -WorkingDirectory "$root/frontend"
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev","--","--host","0.0.0.0" -WorkingDirectory "$root/frontend"
