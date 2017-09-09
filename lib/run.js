'use strict';

const BbPromise = require('bluebird');
const webpack = require('webpack');

module.exports = {
  watch() {
    const functionName = this.options.function;
    this.serverless.cli.log(`Watch function ${functionName}...`);

    const compiler = webpack(this.webpackConfig);

    compiler.watch({}, (err /*, stats */) => {
      if (err) {
        throw err;
      }

      BbPromise.try(() => {  // eslint-disable-line promise/catch-or-return, promise/no-promise-in-callback
        if (this.originalServicePath) {
          process.chdir(this.originalServicePath);
          this.serverless.config.servicePath = this.originalServicePath;
        }

        if (!this.isWatching) {
          this.isWatching = true;
          return BbPromise.resolve();
        }

        this.serverless.cli.log('Sources changed.');
        return this.serverless.pluginManager.spawn('invoke:local');
      })
      .then(() => this.serverless.cli.log('Waiting for changes ...'));
    });
  },
};
