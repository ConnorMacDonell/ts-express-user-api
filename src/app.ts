import dotenv from 'dotenv';
const dotenvResult = dotenv.config();
if(dotenvResult.error) {
  throw dotenvResult.error;
}
import express from 'express';
import * as http from 'http';

import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { CommonRoutesConfig } from './common/common.routes.config';
import { UsersRoutes } from './users/users.routes.config';
import { AuthRoutes } from './auth/auth.routes.config';
import debug from 'debug';
import helmet from 'helmet';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

//add middleware to parse all incoming requests as JSON
app.use(express.json());

//add middleware to allow cross-origin requests
app.use(cors());

//library for protectnig against common security vulnerabilities
app.use(helmet);

// prepare the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({all: true})
  ),
};

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

if(!process.env.DEBUG) {
  loggerOptions.meta = false; //make terse when not in debug env
  if(typeof global.it === 'function') {
    loggerOptions.level = 'http' //no logging for non-debug tests
  }
}

// add the UserRoutes to our array
// after sending the Express.js application object to have the routes added to the app
routes.push(new UsersRoutes(app));
routes.push(new AuthRoutes(app));

// route to make sure everything is working properly
const runningMessage = `Server running at http://localhost:${port}`;
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

export default server.listen(port, () => {
  routes.forEach((route: CommonRoutesConfig) => {
    debugLog((`Routes configured for ${route.getName()}`))
  });
  console.log(runningMessage);
});