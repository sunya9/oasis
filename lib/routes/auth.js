const passport = require('koa-passport')

module.exports = router => {
  router.get('/auth/login', passport.authenticate('github'))
  router.get('/auth/callback', passport.authenticate('github', {
    successRedirect: '/repositories',
    failureRedirect: '/'
  }))
  router.get('/auth/logout', ctx => {
    ctx.logout()
    ctx.redirect('/')
  })
}