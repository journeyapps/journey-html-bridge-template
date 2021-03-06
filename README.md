# journey-html-bridge-template

This is intended to use `journey-iframe-client` and give us a single HTML file to upload to the Editor as an HTML asset.

[Node.js](https://nodejs.org) is required to build the project.


## Installation

Make sure you have [direnv](https://direnv.net) installed and run `direnv allow` once.

Install dependencies:

```sh
yarn install
```


## Development

Copy and paste `config_template.yml` and rename it to `config.yml`. This file is ignored by Git and will contain authentication tokens.

The entrypoint of the project is `src/main.ts`. Other files can be imported (required) from this.

An HTML template is in `src/template.html`. It's title can and output filename can be set in `config.yml`.


## Building

To build, run:

```sh
yarn build
```

This builds a single HTML file to `dist` with the filename provided in `config.yml`.

While developing, you can run:

```sh
# watch files
yarn build --watch
```

This will watch your files for changes, but will not live-reload yet. This means that you will have to open your HTML file and then press reload when you have saved your changes.

Development builds without minification can be done by running the following (the `--watch` flag can also be used):

```sh
yarn build:dev
```

## Publishing

Edit `config.yml` with your app's ID and your Editor Bearer token.

Format:

```yaml
token: get from Editor -> Edit Profile
appId: The numeric part of the app's url, eg 580773fc6564696b09002079
apiVersion: v4
outputFileName: index.html
htmlTitle: Title
```

Run `yarn upload` to build and upload your HTML file to your app. If there is a file with the same name in your app, it will be replaced.

If the `branch` field is set in `config.yml` and the app has branching enabled, then the file will be uploaded to that branch. If the `branch` field is not set but branching is enabled, then the file will be uploaded to the `master` branch. The branch will then be deployed after the upload is complete.

If branching is not enabled for the app, then the "testing" environment will be deployed after uploading the file.
