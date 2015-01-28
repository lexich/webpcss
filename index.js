/*
 * webpcss
 * https://github.com/lexich/webpcss
 *
 * Copyright (c) 2014 Efremov Alexey
 * Licensed under the MIT license.
 */
'use strict';

require('6to5/register')({
  only: /lib/
});

module.exports = require("./lib/main.js");
