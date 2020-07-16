/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import 'reflect-metadata';
import config from './config';
import express, {Application} from 'express';
import cors from 'cors';
import * as dbConfig from "./ormconfig";
import * as path from 'path';
import {morganLogger} from './middleware/logger';
import bodyParser from 'body-parser';
import container from './config.inversify';
import {TYPES} from './types';
import errorHandler from './middleware/errorHandler';
import {UserController} from './controllers/userController';
import {ChatsController} from './controllers/chatsController';
import {AuthController} from './controllers/authController';
import {SocketRouter} from './controllers/socketRouter';
import * as Sentry from '@sentry/node';
import {AuthWebController} from './controllers/authWebController';
import {loginRequireMiddleware} from './middleware/loginRequired';
import {ConnectionOptions, createConnection} from "typeorm/index";

export function createApp(): Promise<Application> {
  return new Promise<Application>(async (resolve) => {

    console.log(dbConfig);
    try {
      // @ts-ignore
      await createConnection(dbConfig as ConnectionOptions);
    } catch (e) {
      console.log("TypeORM connection error: ", e);
      process.abort();
    }

    const app = express();

    if (process.env.NODE_ENV !== 'development') {
      Sentry.init({
        dsn: config.sentryDSN,
        integrations: [
          new Sentry.Integrations.OnUncaughtException(),
          new Sentry.Integrations.OnUnhandledRejection(),
        ],
      });
      // The request handler must be the first middleware on the app
      app.use(Sentry.Handlers.requestHandler());
      // The error handler must be before any other error middleware
      app.use(Sentry.Handlers.errorHandler());
    }

    app.use(
      cors({
        credentials: true,
        origin: '*',
      }),
    );

    app.use(morganLogger);

    app.use(bodyParser.json());


    const authController = container.get<AuthController>(
      TYPES.AuthController,
    );

    const userController = container.get<UserController>(
      TYPES.UserController,
    );
    const chatsController = container.get<ChatsController>(
      TYPES.ChatsController,
    );


    const loginRequired = loginRequireMiddleware(config.jwt_secret);

    // Users Controller
    app.post('/auth/phone/get_code/', authController.sendCode());
    app.post('/auth/phone/login/', authController.login());
    app.post('/auth/token/refresh/', authController.refresh());
    app.post('/auth/web_auth/', loginRequired, authController.authorize_web());

    // Static files routes
    app.use(express.static(path.join(__dirname, '../web/build/')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + '/web/build/index.html'));
    });

    // ERROR HANDLER
    app.use(errorHandler);

    let server = require('http').Server(app);
    // set up socket.io and bind it to our
    // http server.
    let io = require('socket.io').listen(server, {
      origins: '*:*',
      pingTimeout: 50000,
      pingInterval: 50000,
    });
    try {
      const socketRouter = new SocketRouter([
        userController,
        chatsController,
      ]);

      const webAuthController = container.get<AuthWebController>(
        TYPES.AuthWebController,
      );
      socketRouter.connect(io);
      webAuthController.connect(io);
    } catch (e) {
      console.log('Cant start socket controllers', e);
    }

    resolve(server);
  });
}
