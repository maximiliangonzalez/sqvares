const {User, Topic} = require('../models/models');

module.exports = {
  signup(req, res, next) {
    const {name, password} = req.body;
    User.findOne({name}, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        User.create({name, password}, (err, user) => {
          if (err) {
            return next(err);
          }
          res.locals.user = user;
          return next();
        });
      } else {
        return next('username not unique');
      }
    })
  },

  login(req, res, next) {
    let {name, password} = req.body;
    // login() is used as middleware in different locations
    // if there is a token property on res.locals, this means the previous middleware was checkToken()
    // this means that we're logging the user in automatically because they have a valid JWT
    // in that case, we want to take the information from the previous middleware rather than from the request body
    if (res.locals.token) {
      name = res.locals.token.username;
      password = res.locals.password;
    }

    User.findOne({name}, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user || user.password !== password) {
        return next('incorrect credentials');
      }

      res.locals.user = user;
      return next();
    });
  },

  addTopic(req, res, next) {
    console.log('adding topic');
    const {topicName, tags} = req.body;
    console.log({topicName, tags})
    Topic.create({name: topicName, tags}, (err, topic) => {
      if (err) {
        return next(err);
      }
      if (!topic) {
        return next('nothing created');
      }
      console.log(topic);
      res.locals.topic = topic;
      next();
    });
  },

  followTopic(req, res, next) {
    console.log('follow topic');
    User.findOneAndUpdate(
      {name: req.body.username},
      {$push: {following: res.locals.topic}},
      {new: true, useFindAndModify: false},
      (err, user) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return next('user not found');
        }
        res.locals.user = user;
        return next();
    });
  }
};