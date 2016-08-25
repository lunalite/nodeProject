// default app configuration
module.exports = {
    db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/nodeProject",
    port: process.env.PORT || "3000",
    testDb: "mongodb://localhost/test",
    //TODO: Set up in environment the secret to prevent it from being leaked.
    secret: "bukitPanjang993",
    jwtExpiryTime: "3h"
};


