'use strict';
/**
 * Created by henian.xu on 2021/4/12.
 *
 */

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cjs.prod.js');
} else {
  module.exports = require('./dist/cjs.js');
}
