// default app configuration
module.exports = {
    db: (process.env.NODE_ENV == 'test') ? "mongodb://localhost/test" :
    process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/nodeProject",
    port: process.env.PORT || "3000",
    //TODO: Set up in environment the secret to prevent it from being leaked.
    secret: process.env.NODE_SECRET,
    jwtExpiryTime: "3h"
};


