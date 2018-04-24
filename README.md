# Documentation
Documentation can be found [here](https://vsync.ch/doc/)

# How to build
```shell
git clone https://github.com/ElectronicManuel/VideoSyncer.git
cd VideoSyncer
npm i
npm run build -- -r $version
mkdir artefact
cd dist/firefox
zip -rq "../../artefact/VideoSyncer_"$version"_firefox.zip" *
```