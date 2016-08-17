// default app configuration
module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://admin:admin9309@ds139675.mlab.com:39675/nodeproject993",
  port: process.env.PORT || "3000",
  testDb: "mongodb://localhost/test",
  secret: "bukitPanjang998"
};
