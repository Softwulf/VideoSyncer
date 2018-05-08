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
mkdir artefact
cd dist/firefox
zip -rq "../../artefact/VideoSyncer_"$VERSION"_firefox.xpi" *
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
mkdir artefact
cd dist/firefox
zip -rq "../../artefact/VideoSyncer_"$VERSION"_firefox.xpi" *
```