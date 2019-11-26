#!/bin/bash


# png to ico for Windows:  https://convertio.co/png-ico/
# png to icns for Mac OS X:  https://cloudconvert.com/png-to-icns


#---------------------------------------------------------------------------------------------------------------
# package the app

# build for MacOS:
#./node_modules/.bin/electron-packager . --overwrite --platform=darwin --arch=x64 --icon=./osinstallationplanner-32x32.icns --prune=true --out=release-builds
# creates a directory tree totalling 209 MB

# build for Windows:
#./node_modules/.bin/electron-packager . OS-Installation-Planner --overwrite --asar --platform=win32 --arch=ia32 --icon=./osinstallationplanner-32x32.ico --prune=true --out=release-builds --version-string.ProductName="OS Installation Planner"
# FAILS !!!:     spawn wine64 ENOENT

# build for Linux:
#./node_modules/.bin/electron-packager . osinstallationplanner --overwrite --asar --platform=linux --arch=x64 --icon=./osinstallationplanner-32x32.png --prune=true --out=release-builds
# main executable file is 115 MB
# creates a directory tree totalling 183 MB

# executable builds of the app are created under release-builds directory


#---------------------------------------------------------------------------------------------------------------
# make installers for the app

# installer for MacOS:
#./node_modules/.bin/electron-installer-dmg ./release-builds/OS\ Installation\ Planner-darwin-x64/OS\ Installation\ Planner.app OS-Installation-Planner
# FAILS !!!:    Error: Must be run on OSX
# creates a file OS-Installation-Planner.dmg in the root folder of the application

# installer for Windows:
#node installers/windows/createinstaller.js

# installer for Linux
#./node_modules/.bin/electron-installer-debian --src release-builds/osinstallationplanner-linux-x64/ --arch amd64 --config debian.json
# creates a 52 MB .deb file in release-builds directory

