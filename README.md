[![Build Status](https://travis-ci.org/ElectronicManuel/VideoSyncer.svg?branch=master)](https://travis-ci.org/ElectronicManuel/VideoSyncer)
[![Dependency Status](https://david-dm.org/ElectronicManuel/VideoSyncer/status.svg)](https://david-dm.org/ElectronicManuel/VideoSyncer)
[![Dev Dependency Status](https://david-dm.org/ElectronicManuel/VideoSyncer/dev-status.svg)](https://david-dm.org/ElectronicManuel/VideoSyncer?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/ElectronicManuel/VideoSyncer/badge.svg)](https://snyk.io/test/github/ElectronicManuel/VideoSyncer)

# Documentation
Documentation can be found [here](https://doc.vsync.ch)

# How to build
## Local (already downloaded source)
```shell
#!/bin/bash
#Set version here
VERSION="X.X.X"
npm i
npm run build -- -r $VERSION
cd dist/archives
```
## Checkout from github
```shell
#!/bin/bash
git clone https://github.com/ElectronicManuel/VideoSyncer.git
cd VideoSyncer
#Set version here
VERSION="X.X.X"
git checkout "tags/v$VERSION"
npm i
npm run build -- -r $VERSION
cd dist/archives
```
