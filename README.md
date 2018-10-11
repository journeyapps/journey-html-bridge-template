# journey-html-bridge-template

This is intended to use `journey-iframe-client` and give us a single HTML file to upload to the Editor as an HTML asset.

## Workflow:

### Install:
Make sure you have direnv installed and run `direnv allow` once.
```sh
yarn install
```

### Developing
The entrypoint of the project is `src/main.ts`. Other files can be imported (required) from this.

An HTML template is in `src/template.html`. It's title can and output filename cang be set in `config.yml`.

### Building
To build, run:
```sh
yarn run build
```

While developing, you can run
```sh
yarn run build --watch
```
This will watch your files for changes, but won't livereload yet. This means that you will have to open your HTML file and then press reload when you have saved your changes.

This builds a single HTML file to `dist` with the filename provided in `config.yml`.

### Uploading automatically
Edit `config.yml` with your app's ID and your Editor Bearer token.

Format:
```yml
token: get from Editor -> Edit Profile
appId: The numeric part of the app's url, eg 580773fc6564696b09002079
apiVersion: v4
outputFileName: index.html
htmlTitle: Title
```

Run `yarn run upload` to build and upload your HTML file to your app. If there is a file with the same name in your app, it will be replaced.