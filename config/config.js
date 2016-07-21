// default app configuration
module.exports = {
  db: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost/nodeProject",
  port: process.env.PORT || "3000"
};
