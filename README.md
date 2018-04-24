# Documentation
Documentation can be found [here](https://vsync.ch/doc/)

# How to build
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