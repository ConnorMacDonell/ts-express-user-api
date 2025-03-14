import express from "express";
import userService from "../services/users.service";
import debug from "debug";

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware {
  async validateEmailUniqueness(req: express.Request, res: express.Response, next: express.NextFunction){
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
      res.status(400).send({error: 'A user with the given email already exists'});
    } else {
      next();
    }
  }
  
  async validateUserExistence(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = await userService.readById(req.params.userId);
    if (user) {
      res.locals.user = user;
      next();
    } else {
      res.status(404).send({ error: `User ${req.params.userId} not found` });
    }
  }

  async validateUserEmailMatchesUserId(req: express.Request, res: express.Response, next: express.NextFunction){
    if(res.locals.user._id === req.params.userId) {
      next();
    } else {
      res.status(400).send({error: "Invalid email"})
    }
  }

  //use arrow function to properly bind `this`
  validatePatchEmail = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.email) {
      log('Validating email', req.body.email);

      this.validateUserEmailMatchesUserId(req, res, next);
    } else {
      next();
    }
  }

  async extractUserId(req: express.Request, res: express.Response, next: express.NextFunction) {
    req.body.id = req.params.userId;
    next();
  }

  async userCantChangePermission(req: express.Request, res: express.Response, next: express.NextFunction) {
    if ('permissionFlags' in req.body && req.body.permissionFlags !== res.locals.user.permissionFlags) {
      res.status(400).send({ errors: ['User cannot changer permission flags'] });
    } else {
      next();
    }
  }
}

export default new UsersMiddleware();