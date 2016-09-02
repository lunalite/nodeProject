'use strict';


/**
 * pageHandler for all pages that are non existing
 */
module.exports.pageErrHandler = function (req, res, next) {
    var err = new Error('Page Not Found');
    err.remedy = {
        1: "Check the URL link",
        2: "Check the REST method if it is valid"
    };
    err.status = 404;
    next(err);
};

/**
 * devErrHandler that handles all error thrown downwards while printing
 * error message and remedy message
 *
 * status 200: ok
 * status 201: created
 * status 204: no context available to be shown
 * status 400: bad request
 * status 401: unauthorized
 * status 403: Forbidden response isAdmin checks
 * status 404: no page found
 * status 500: Internal service error / all other errors
 */
module.exports.devErrHandler = function(err, req, res, next) {
  if (process.env.NODE_ENV === 'development' || 'test') {
      // console.log("Error occurred!!!\n" + err.stack);
      res.status(err.status || 500).send({
          message: err.message,
          remedy: err.remedy ? err.remedy : ""
      });
  }
};