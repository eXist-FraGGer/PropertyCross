var ids = {
  facebook: {
    clientID: 'get_your_own',
    clientSecret: 'get_your_own',
    callbackURL: 'http://127.0.0.1:1337/auth/facebook/callback'
  },
  twitter: {
    consumerKey: 'get_your_own',
    consumerSecret: 'get_your_own',
    callbackURL: "http://127.0.0.1:1337/auth/twitter/callback"
  },
  github: {
    clientID: 'get_your_own',
    clientSecret: 'get_your_own',
    callbackURL: "http://127.0.0.1:1337/auth/github/callback"
  },
  google: {
    clientID: '266852436285-els4rc6r16u0ir2flpntljrrcb97u3ls.apps.googleusercontent.com',
    clientSecret: 'W_oAsaeYRAt-FKwE0dect0gV',
    callbackURL: 'http://localhost:8080/auth/google/callback'
  },
  instagram: {
    clientID: 'get_your_own',
    clientSecret: 'get_your_own',
    callbackURL: 'http://127.0.0.1:1337/auth/instagram/callback'
  }
};

module.exports = ids;