# journey-html-bridge-template

This is intended to use `journey-iframe-client` and give us a single HTML file to upload to the Editor as an HTML asset.

## Workflow:

### Install:
Make sure you have direnv installed and run `direnv allow` once.
```sh
yarn install
```

This currently uses a linked `journey-iframe-client`, so clone that, yarn and yarn link etc. and also run `webpack`.

### Developing
The entrypoint of the project is `src/main.ts`. Other files can be imported (required) from this.

An HTML template is in `src/template.html`. It's title can be set in `webpack.config.js` under `HtmlWebpackPlugin` -> `title`. It is currently "TITLE".

### Building
To build, run:
```sh
webpack
```

This builds a single HTML file to `dist/index.html`. You can set the filename in `webpack.config.js` under `HtmlWebpackPlugin` -> `filename`.

## TODO:
 - Use Editor FileAPI to upload built HTML file with a script.
 - Figure out why relative path was needed in `main.js`.