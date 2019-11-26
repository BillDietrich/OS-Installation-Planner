#!/bin/bash

# png to ico for Windows:  https://convertio.co/png-ico/
# png to icns for Mac OS X:  https://cloudconvert.com/png-to-icns

# build for MacOS:
electron-packager . --overwrite --platform=darwin --arch=x64 --icon=./osinstallationplanner-32x32.icns --prune=true --out=release-builds

# build for Windows:
#electron-packager . OS-Installation-Planner --overwrite --asar=true --platform=win32 --arch=ia32 --icon=./osinstallationplanner-32x32.ico --prune=true --out=release-builds --version-string.ProductName="OS Installation Planner"

# build for Linux:
#electron-packager . OS-Installation-Planner --overwrite --asar=true --platform=linux --arch=x64 --icon=./osinstallationplanner-32x32.png --prune=true --out=release-builds
