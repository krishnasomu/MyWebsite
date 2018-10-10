@echo off
setlocal EnableDelayedExpansion
set /a count = 120
for %%f in (d:\tmp\photos\*.jpg) do (
    set /a count += 1
    ren %%f !count!.jpg
)