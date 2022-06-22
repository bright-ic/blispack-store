const _ = require('lodash');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require("bcrypt-nodejs");

let _this = this;

exports.uniqid = (prefix = "", more_entropy = false) => {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(13, "0");
    return `${prefix}${id}${more_entropy ? `.${Math.trunc(Math.random() * 100000000)}` : ""}`;
};


/**
 *
 * @param {string} str_data
 * @returns
 */
exports.humanize = (str_data) => {
    if (!_.isString(str_data)) return str_data;
    return this.ucwords(str_data.trim().toLowerCase().replace('/[_]+/', ' '));
}

/**
 * Uppercase the first character of each word in a string
 * @param {string} str
 * @returns
 */
exports.ucwords = (str) => {
    if (!_.isString(str) || !str.trim()) return str;

    const strArray = _.words(str.trim());
    _.forEach(strArray, word => {
        word = _.capitalize(word)
    });
    return strArray.join(' ');
}

/**
 * Reindex a result set/array by a given key
 * @param {array} array Array to be searched
 * @param {string} key Field to search
 * Useful for taking database result sets and indexing them by id or unique_hash
 *
 */
exports.array_reindex = (array, key = 'id') => {
    const indexed_array = {};
    if (_.isArray(array) && !this.empty(array)) {
        _.forEach(array, item => {
            if (this.isObject(item) && _.has(item, key)) {
                indexed_array[item[key]] = item;
            }
        })
        return indexed_array;
    } else {
        return false;
    }
}

exports.isEmail = (data) => {
    try {
        if(typeof data !== "string") return false;
        return validator.isEmail(data);
    } catch(e) {}
    return false;
}
exports.normalizeEmail = (data) => {
    try {
        return validator.normalizeEmail(data);
    } catch(e) {}
    return data;
}

exports.get_ip_address = (req) => {
    let ip = null;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.socket && req.socket.remoteAddress) {
        ip = req.socket.remoteAddress;
    } else {
        ip = req.ip;
    }
    return ip;
};

/**
 * Check for numeric character(s)
 * @todo check for all use cases in PHP's equivalent (check for ASCII values)
 * @param {string} text
 * @returns {boolean} true if every character in the string text is a decimal digit, false otherwise.
 */
exports.ctype_digit = (text) => {
    try {
        return Number.isInteger(Number(text));
    } catch (e) {
        return false;
    }
}

/**
 * Verify phone number
 * @param {string} phone
 * @param {boolean} should_return_data
 * @returns
 */
exports.verify_phone_number = (phone, should_return_data) => {
    let allDigitPhone = phone.replace(/\D/g, "");

    if (!(allDigitPhone.length >= 10 && allDigitPhone.length <= 15 && /^[+]?[0-9]+$/g.test(allDigitPhone)) || (allDigitPhone.length === 10 && allDigitPhone.substr(0, 1) === "+")) {
        return false;
    }
    if (typeof should_return_data !== true) {
        return true;
    }
    if (allDigitPhone.startsWith("+")) {
        allDigitPhone = allDigitPhone.substring(1);
    }
    return allDigitPhone;
};

/**
 * Helper function that checks if supplied parameter is an object type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an object or false if it's not.
 */
exports.isObject = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Object]") ? true : false;
}

/**
 * Helper function that checks if supplied parameter is an array or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an array or false if it's not.
 */
exports.isArray = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Array]") || Array.isArray(data) ? true : false;
}

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
exports.isString = (data = null) => {
    return typeof data === "string";
}

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
exports.isNumber = (value = null) => {
    try {
        // return typeof data === "number" || /[0-9]/.test(data);
        return typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity
    } catch (err) {
        return false;
    }
}

/**
 * Helper function that checks if supplied parameter is a boolean type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a booloean type or false if it's not.
 */
exports.isBoolean = (data = null) => {
    return (typeof data === "boolean" || data === true || data === false);
}

/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
exports.isUndefined = (data = null) => {
    return ((typeof data === "undefined" || data == undefined) ? true : false);
}

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
exports.isDefined = (data = null) => {
    return typeof data !== "undefined";
}

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
exports.isNull = (data = null) => {
    return (data === null ? true : false);
}

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.empty = (data = null) => {
    return this.isEmpty(data);
}

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.isEmpty = (data = null) => {
    let rtn = false;
    if (this.isString(data) && (data === "" || data.trim() === "")) rtn = true;
    else if (this.isNumber(data) && data === 0) rtn = true;
    else if (this.isBoolean(data) && data === false) rtn = true;
    else if (this.isObject(data) && Object.values(data).length === 0) rtn = true;
    else if (this.isArray(data) && data.length === 0) rtn = true;
    else if (this.isUndefined(data)) rtn = true;
    else if (this.isNull(data)) rtn = true;

    return rtn;
}





exports.get_valid_phone_regex = () => {
    return /^[+]?([\d]{0,3})?[\(\.\-\s]?([\d]{3})[\)\.\-\s]*([\d]{3})[\.\-\s]?([\d]{4})$/;
}


exports.escape_csv = (str) => {
    if (!this.isString(str)) return str;

    const _bad = ['"'];
    const _good = ['\''];
    return `"${_.replace(_.trim(str), _bad, _good)}"`;
}

exports.array_to_csv_string = (array, delim = ",", newline = "\n", enclosure = '"') => {
    let out = '';
    // Next blast through the result array and build out the rows
    if (this.isArray(array)) _.forEach(array, row => {
        if (this.isArray(row)) _.forEach(row, item => {
            out += `${enclosure}${_.replace(item, enclosure, enclosure + enclosure)}${enclosure}${delim}`;
        })
        out = _.trimEnd(out);
        out += newline;
    })

    return out;
}


exports.escape_regex = (word) => {
    const replaces = ['\\', '*', '+', '?', '|', '{', '[', '(', ')', '^', '$', '.', '#'];
    _.forEach(replaces, replace => {
        word = _.replace(word, replace, "\\" + replace);
    })
    return word;
}


/**
 *
 * @todo fix DateTimeZone and DateTime functions, date_default_timezone_get function
 * @param {*} remote_tz
 * @param {*} origin_tz
 * @returns
 */
exports.build_timezone_offset = (remote_tz, origin_tz = null) => {
    if (origin_tz === null) {
        if (!this.isString(origin_tz = date_default_timezone_get())) {
            return false; // A UTC timestamp was returned -- bail out!
        }
    }
    const origin_dtz = new DateTimeZone(origin_tz);
    const remote_dtz = new DateTimeZone(remote_tz);
    const origin_dt = new DateTime("now", origin_dtz);
    const remote_dt = new DateTime("now", remote_dtz);
    const offset = origin_dtz.getOffset(origin_dt) - remote_dtz.getOffset(remote_dt);
    return offset / 3600;
}


/**
 * Helper function that converts underscore string|variable to camelCased string|variable
 * @returns {string} - Returns new camelCased variable.
 */
exports.underscoreToCamelcase = (string="") => {
  return string.replace(/(\_\w)/g, function (m) {
    return m[1].toUpperCase();
  });
}

/**
 * Helper function that converts camelCased string|variable to underscore string|variable
 * @returns {string} - Returns new underscore variable.
 */
exports.camelToUnderscore = (string = "") => {
  return string.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**

 * Helper function to get the sha1 hash of a string.  equivalent of PHP sha1
 * @param {string} str
 * @returns
 *
 * Usage example: sha1('Kevin van Zonneveld');
 * returns: '54916d2e62f65b3afa6e192e6a601cdbe5cb5897'
 */
exports.sha1 = (str="") =>{
  let hash
  try {
    const crypto = require('crypto')
    const sha1sum = crypto.createHash('sha1')
    sha1sum.update(str)
    hash = sha1sum.digest('hex')
  } catch (e) {
    hash = undefined
  }
  if (hash !== undefined) {
    return hash
  }
  const _rotLeft = function (n, s) {
    const t4 = (n << s) | (n >>> (32 - s))
    return t4
  }
  const _cvtHex = function (val) {
    let str = ''
    let i
    let v
    for (i = 7; i >= 0; i--) {
      v = (val >>> (i * 4)) & 0x0f
      str += v.toString(16)
    }
    return str
  }
  let blockstart
  let i, j
  const W = new Array(80)
  let H0 = 0x67452301
  let H1 = 0xEFCDAB89
  let H2 = 0x98BADCFE
  let H3 = 0x10325476
  let H4 = 0xC3D2E1F0
  let A, B, C, D, E
  let temp
  // utf8_encode
  str = unescape(encodeURIComponent(str))
  const strLen = str.length
  const wordArray = []
  for (i = 0; i < strLen - 3; i += 4) {
    j = str.charCodeAt(i) << 24 |
      str.charCodeAt(i + 1) << 16 |
      str.charCodeAt(i + 2) << 8 |
      str.charCodeAt(i + 3)
    wordArray.push(j)
  }
  switch (strLen % 4) {
    case 0:
      i = 0x080000000
      break
    case 1:
      i = str.charCodeAt(strLen - 1) << 24 | 0x0800000
      break
    case 2:
      i = str.charCodeAt(strLen - 2) << 24 | str.charCodeAt(strLen - 1) << 16 | 0x08000
      break
    case 3:
      i = str.charCodeAt(strLen - 3) << 24 |
        str.charCodeAt(strLen - 2) << 16 |
        str.charCodeAt(strLen - 1) <<
        8 | 0x80
      break
  }
  wordArray.push(i)
  while ((wordArray.length % 16) !== 14) {
    wordArray.push(0)
  }
  wordArray.push(strLen >>> 29)
  wordArray.push((strLen << 3) & 0x0ffffffff)
  for (blockstart = 0; blockstart < wordArray.length; blockstart += 16) {
    for (i = 0; i < 16; i++) {
      W[i] = wordArray[blockstart + i]
    }
    for (i = 16; i <= 79; i++) {
      W[i] = _rotLeft(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1)
    }
    A = H0
    B = H1
    C = H2
    D = H3
    E = H4
    for (i = 0; i <= 19; i++) {
      temp = (_rotLeft(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 20; i <= 39; i++) {
      temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 40; i <= 59; i++) {
      temp = (_rotLeft(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    for (i = 60; i <= 79; i++) {
      temp = (_rotLeft(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff
      E = D
      D = C
      C = _rotLeft(B, 30)
      B = A
      A = temp
    }
    H0 = (H0 + A) & 0x0ffffffff
    H1 = (H1 + B) & 0x0ffffffff
    H2 = (H2 + C) & 0x0ffffffff
    H3 = (H3 + D) & 0x0ffffffff
    H4 = (H4 + E) & 0x0ffffffff
  }
  temp = _cvtHex(H0) + _cvtHex(H1) + _cvtHex(H2) + _cvtHex(H3) + _cvtHex(H4)
  return temp.toLowerCase()
}


/**
 * Helper function generates random codes.
 * @param {number} number - Represents the number of random codes to generate.
 * @param {number} min_length - Represents the minimum length of the random code to be generated (defaults to 10).
 * @param {number} max_length - Represents the maximum length of the random code to be generated (defaults to 16).
 * @param {string} characters - Represents a string of characters from which the random codes will be generated from (defauls to 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789').
 * @returns {object} - Returns an array of random codes eg array("CD9A9298VGJ7D").
*/
exports.generateRandomCodes = (amount=0, min_length = 10, max_length = 16, characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789") => {
    let str = [];
    for (let j = 0; j < amount; j++) {
      let first_string = '';
      let min = Math.ceil(min_length);
      let max = Math.floor(max_length);
      let random_string_length = Math.floor(Math.random() * (max - min + 1)) + min;
      for (let i = 0; i < random_string_length; i++) {
        first_string += characters[(Math.floor(Math.random() * ((characters.length - 1) - 0 + 1)) + 0)];
      }
      str[j] = typeof str[j] !== "undefined" ? str[j] + first_string : first_string;
    }
    return str;
}

/**
 * Helper function that generates unique ID
 * @returns {string} - Returns generated unique ID.
*/
exports.generateUniqueID = () => {
  var dt = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

exports.format_number = (number) => {
    if(typeof number !== "undefined") {
        number = parseFloat(number)
        number = number.toLocaleString('en-US');
    }
    return number;
}

exports.formatCurrency = (amount, currency) => {
    currency = typeof currency === "string" && currency !== "" ? currency.toUpperCase() : "USD";
    if(typeof amount !== "undefined") {
        amount = new Intl.NumberFormat('en-US', { style: 'currency', currency: currency}).format(amount);
    }
    return amount;
}

exports.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

exports.comparePassword = (password, encryptedPassword) => {
    if (encryptedPassword) {
      return bcrypt.compareSync(password, encryptedPassword);
    } else {
      return false;
    }
};