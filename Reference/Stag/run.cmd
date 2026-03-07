echo off

if not exist "node_modules/" (call npm install)
start http://LocalHost
cls

node .

pause >> NUL