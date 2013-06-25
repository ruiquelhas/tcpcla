var SDNV = require('sdnv');
var toolkit = require('./toolkit');


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
      DEFAULT: 1,
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

var getVersionBuffer = function (version) {
  return getConstrainedNumberAsBuffer(version, 
    CONSTRAINTS.FIELDS.VERSION.MAX, 
    ERROR_MESSAGES.VERSION_NOT_SUPPORTED);
};

var forceSegmentAcknowledmentForBundleRefusal = function (flags) {
  if ('BUNDLE_REFUSAL_SUPPORT' in flags) {
    flags.SEGMENT_ACKNOWLEDGE = true;
  }
};

var getFlagBuffer = function (flags) {
  var bufferData = 0;
  forceSegmentAcknowledmentForBundleRefusal(flags);
  for (var flag in flags) {
    if (flags[flag] === true) {
      bufferData = bufferData | CONSTRAINTS.FIELDS.FLAGS.OPTIONS[flag];
    }
  }
  return new Buffer([bufferData]);
};

var getKeepAliveIntervalBuffer = function (interval) {
  var buffer = getConstrainedNumberAsBuffer(interval, 
    CONSTRAINTS.FIELDS.KEEPALIVE.MAX, 
    ERROR_MESSAGES.INTERVAL_TOO_HIGH);
  if (buffer.length < 2) {
    return new Buffer([0, buffer[0]]);
  }
  return buffer;
};

var getSingletonEIDBuffer = function () {
  return new Buffer(process.env.EID);
};

var getSingletonEIDLengthSDNV = function () {
  return new SDNV(new Buffer([getSingletonEIDBuffer().length]));
};


// Constructor

var ContactHeader = function (options) { 
  // ensure the options value is defined
  options = options || {};
  // set the instance variables representing the header fieds
  // the magic field always contains the same value
  this.magic = new Buffer(CONSTRAINTS.FIELDS.MAGIC.VALUE);
  // if the version is not specified it defaults to 1
  this.version = getVersionBuffer(options.version || 
    CONSTRAINTS.FIELDS.VERSION.DEFAULT);
  // set convergence layer transmission options as header flags
  this.flags = getFlagBuffer(options.flags || {
    SEGMENT_ACKNOWLEDGE: false,
    REACTIVE_FRAGMENTATION: false,
    BUNDLE_REFUSAL_SUPPORT: false,
    SEND_LENGTH_MESSAGES: false
  });
  // set the interval betweetn keepalive message transmissions
  this.keepAliveInterval = getKeepAliveIntervalBuffer(
    options.keepAliveInterval || CONSTRAINTS.FIELDS.KEEPALIVE.DEFAULT);
  // set the eid length field
  this.eidLength = getSingletonEIDLengthSDNV();
  // set the eud contents field
  this.eid = getSingletonEIDBuffer();
};


// Instance methods

ContactHeader.prototype.valueOf = function () {
  // determine the size of the variable length fields
  var eidLengthFieldSize = getSingletonEIDLengthSDNV().length;
  var eidFieldSize = getSingletonEIDBuffer.length;
  // determine the index of the eid contents field
  var eidFieldIndex = CONSTRAINTS.FIELDS.EID_LENGTH.INDEX + eidLengthFieldSize;
  // create a new buffer with the required size
  var totalSize = CONSTRAINTS.FIXED_SIZE + eidLengthFieldSize + eidFieldSize;
  var result = new Buffer(totalSize);
  // copy contents from the in-memory buffer
  this.magic.copy(result, CONSTRAINTS.FIELDS.MAGIC.INDEX, 0, 
    CONSTRAINTS.FIELDS.MAGIC.SIZE);
  this.version.copy(result, CONSTRAINTS.FIELDS.VERSION.INDEX, 0, 
    CONSTRAINTS.FIELDS.VERSION.SIZE);
  this.flags.copy(result, CONSTRAINTS.FIELDS.FLAGS.INDEX, 0, 
    CONSTRAINTS.FIELDS.FLAGS.SIZE);
  this.keepAliveInterval.copy(result, CONSTRAINTS.FIELDS.KEEPALIVE.INDEX, 0, 
    CONSTRAINTS.FIELDS.KEEPALIVE.SIZE);
  this.eidLength.copy(result, CONSTRAINTS.FIELDS.EID_LENGTH.INDEX, 0, 
    eidLengthFieldSize);
  this.eid.copy(result, eidFieldIndex, 0, eidFieldSize);
  // return it
  return result;
};


// Export API
module.exports = ContactHeader;