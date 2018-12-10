---
title: "Create React App"
category: "kb"
---

# Create React App

[**Create React App**](https://github.com/facebookincubator/create-react-app) is a new officially supported way to create single-page React applications. It offers a modern build setup with no configuration.

## Installation

```bash
npm install -g create-react-app
cd my-app/
create-react-app my-app
npm start
```

Then open [http://localhost:3000/ ](http://localhost:3000/ )to see your app.

When you’re ready to deploy to production, create a minified bundle with:

```bash
npm run build
```

# React Material Design

This project's goal is to be able to create a fully accessible material design styled website using React Components and Sass. With the separation of styles in Sass instead of inline styles, it should hopefully be easy to create custom components with the existing styles.

Website: [https://react-md.mlaursen.com/](https://react-md.mlaursen.com/)

Git: [https://github.com/mlaursen/react-md](https://github.com/mlaursen/react-md)

## Installation

```
yarn add react-md
```

reat-dm requires a CSS preprocessor: [installation instructions.](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-a-css-preprocessor-sass-less-etc)

Now you can rename `src/App.css` to `src/App.scss` and run `npm run watch-css`. The watcher will find every Sass file in `src` subdirectories, and create a corresponding CSS file next to it, in our case overwriting `src/App.css`. Since `src/App.js` still imports `src/App.css`, the styles become a part of your application. You can now edit `src/App.scss`, and `src/App.css` will be regenerated.

# Parity

Watching build mode on Create React App

[https://gist.github.com/int128/e0cdec598c5b3db728ff35758abdbafd](https://gist.github.com/int128/e0cdec598c5b3db728ff35758abdbafd)

We need to create a symbolic link in the dapp folder to our build folder:

```
ln -s $PWD/build/ $HOME/.local/share/io.parity.ethereum/dapps/material-dapp
```

Example on srv03.endpoint.network:

    cd /home/rigoblock/cluster/parity-config/dapps
    ln -s /home/rigoblock/html/appdev.endpoint.network/public_html/rigoblock-david/build/ rigoblock-dev

We will make some changes to make the environment compatible with Gavcoin dapp.

```
yarn add react@^15
yarn add react-dom@^15
yarn add bignumber
yarn add react-tap-event-plugin
yarn add prop-types
yarn add bignumber.js
```

## ethapi-js

A thin, fast, low-level Promise-based wrapper around the Ethereum APIs.

[https://github.com/paritytech/parity/tree/master/js/src/api](https://github.com/paritytech/parity/tree/master/js/src/api)

```
yarn add ethapi-js
```

## Web3.js

```
yarn add web3
```


