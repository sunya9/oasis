const passport = require('koa-passport')
const { Strategy } = require('passport-github')

const {
  CLIENT_ID: clientID,
  CLIENT_SECRET: clientSecret,
  PORT: port = 5121
} = process.env

module.exports = app => {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    try {
      done(null, user)
    } catch(err) {
      done(err)
    }
  })
  passport.use(new Strategy({
    clientID, clientSecret,
    callbackURL: `http://127.0.0.1:${port}/auth/callback`,
    scope: ['repo']
  }, (token, refreshToken, profile, cb) => {
    const res = Object.assign({}, profile._json, {
      token
    })
    cb(null, res)
  }))
}
