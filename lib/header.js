var SDNV = require('sdnv');
var toolkit = require('./toolkit');
var pkg = require('../package.json');

var PACKAGE_VERSION = parseInt(pkg.version.slice(0, pkg.version.indexOf('.')), 10);

var CONSTRAINTS = {
  FIXED_SIZE: 8,
  FIELDS: {
    MAGIC: {
      INDEX: 0,
      SIZE: 4,
      VALUE: 'dtn!'
    },
    VERSION: {
      INDEX: 4,
      SIZE: 1,
      VALUE: PACKAGE_VERSION > 0 ? PACKAGE_VERSION : 1,
      MAX: 255
    },
    FLAGS: {
      INDEX: 5,
      SIZE: 2,
      OPTIONS: {
        SEGMENT_ACKNOWLEDGE: 0x01,
        REACTIVE_FRAGMENTATION: 0x02,
        BUNDLE_REFUSAL_SUPPORT: 0x04,
        SEND_LENGTH_MESSAGES: 0x08
      }
    },
    KEEPALIVE: {
      INDEX: 6,
      SIZE: 2,
      DEFAULT: 30,
      MAX: 65535
    },
    EID_LENGTH: {
      INDEX: 8
    }
  }
};

var ERROR_MESSAGES = {
  INVALID_INPUT: 'the argument must be an Integer or Integer-based String',
  VERSION_NOT_SUPPORTED: 'the version number is not supported by the protocol',
  INTERVAL_TOO_HIGH: 'the time interval is higher than the acceptable'
};


// Private Helper functions

var buildFlagBuffer = function (flags) {
  var bufferData = 0;
  forceSegmentAcknowledmentForBundleRefusal(flags);
  for (var flag in flags) {
    if (flags[flag] === true) {
      bufferData = bufferData | CONSTRAINTS.FIELDS.FLAGS.OPTIONS[flag];
    }
  }
  return new Buffer([bufferData]);
};

var forceSegmentAcknowledmentForBundleRefusal = function (flags) {
  if ('BUNDLE_REFUSAL_SUPPORT' in flags) {
    flags.SEGMENT_ACKNOWLEDGE = true;
  }
};

var buildKAIBuffer = function (interval) {
  var buffer = getConstrainedNumberAsBuffer(interval, 
    CONSTRAINTS.FIELDS.KEEPALIVE.MAX, 
    ERROR_MESSAGES.INTERVAL_TOO_HIGH);
  if (buffer.length < 2) {
    return new Buffer([0, buffer[0]]);
  }
  return buffer;
};

var getConstrainedNumberAsBuffer = function (num, threshold, err) {
  if (toolkit.isInteger(num) || toolkit.isIntegerBasedString(num)) {
    var effectiveInteger = parseInt(num, 10);
    if (effectiveInteger <= threshold) {
      return new Buffer([effectiveInteger]);
    }
    throw err;
  }
  throw new Error(ERROR_MESSAGES.INVALID_INPUT);
};

var buildEIDBuffer = function () {
  return new Buffer(process.env.EID);
};

var buildEIDLengthBuffer = function () {
  return new SDNV(new Buffer([buildEIDBuffer().length]));
};

var wrapAsBuffer = function (options) {
  var magic, version, flags, keepAlive, eidLength, eid;
  var buff, defaults, lengthFieldSize, eidFieldSize, eidFieldIndex, totalSize;

  options = options || {};
  defaults = CONSTRAINTS.FIELDS;
  
  magic = new Buffer(defaults.MAGIC.VALUE);
  version = new Buffer([defaults.VERSION.VALUE]);

  flags = buildFlagBuffer(options.flags || {
    SEGMENT_ACKNOWLEDGE: false,
    REACTIVE_FRAGMENTATION: false,
    BUNDLE_REFUSAL_SUPPORT: false,
    SEND_LENGTH_MESSAGES: false
  });

  keepAlive = buildKAIBuffer(options.keepAlive || defaults.KEEPALIVE.DEFAULT);

  eidLength = buildEIDLengthBuffer();
  eid = buildEIDBuffer();

  lengthFieldSize = eidLength.length;
  
  eidFieldIndex = defaults.EID_LENGTH.INDEX + lengthFieldSize;
  eidFieldSize = eid.length;

  totalSize = CONSTRAINTS.FIXED_SIZE + lengthFieldSize + eidFieldSize;

  buff = new Buffer(totalSize);
  copyField(magic, buff, defaults.MAGIC.INDEX, defaults.MAGIC.SIZE);
  copyField(version, buff, defaults.VERSION.INDEX, defaults.VERSION.SIZE);
  copyField(flags, buff, defaults.FLAGS.INDEX, defaults.FLAGS.SIZE);
  copyField(keepAlive, buff, defaults.KEEPALIVE.INDEX, defaults.KEEPALIVE.SIZE);
  copyField(eidLength, buff, defaults.EID_LENGTH.INDEX, lengthFieldSize);
  copyField(eid, buff, eidFieldIndex, eidFieldSize);

  return buff;
};

var copyField = function (src, dst, start, end) {
  src.copy(dst, start, 0, end);
};


// Constructor

var ContactHeader = function (options) {
  var self = wrapAsBuffer(options);

  self.getMagic = function () {
    return magic;
  };
  self.getVersion = function () {
    return version;
  };
  self.getFlags = function () {
    return flags;
  };
  self.setFlags = function (flagSet) {
    flags = buildFlagBuffer(flagSet);
    return self;
  };
  self.getKeepAliveInterval = function () {
    return keepAliveInterval;
  };
  self.setKeepAliveInterval = function (interval) {
    keepAliveInterval = buildKAIBuffer(interval);
    return self;
  };
  self.getEIDLength = function () {
    return eidLength;
  };
  self.getEID = function () {
    return eid;
  };

  return self;
};


// Export API
module.exports = ContactHeader;