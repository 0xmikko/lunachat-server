/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {createApp} from './app';
import config from './config';
import {ErrorHandler} from './middleware/errorHandler';

process.on('uncaughtException', (e) => {
  ErrorHandler.captureException(e);
  process.exit(1);
});

process.on('unhandledRejection', (e) => {
  ErrorHandler.captureException(new Error('unhandledRejection ' + e));
  process.exit(1);
});

config.validate().then(() =>
  createApp().then((server) => {
    server.listen(config.port, () =>
      ErrorHandler.captureMessage(`Listening on port ${config.port}...`),
    );
  }),
);
