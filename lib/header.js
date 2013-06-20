var toolkit = require('./toolkit');

// constant definition
var HEADER_CONSTRAINTS = {
  BASE_SIZE: 8,
  MAGIC_VALUE: 'dtn!',
  FLAG_MAPPING: {
    segmentAcknowledge: 0x01,
    reactiveFragmentation: 0x02,
    bundleRefusalSupport: 0x04,
    sendLengthMessages: 0x08
  }
};

var ERROR_MESSAGES = {
  INVALID_INPUT: 'the argument must be an Integer or Integer-based String',
  VERSION_NOT_SUPPORTED: 'the version number is not supported by the protocol',
  UNACCEPTABLE_INTERVAL: 'the time interval is too high'
};


// Private Helper functions

var getConstrainedNumberAsBuffer = function (num, threshold, err) {
  if (toolkit.isInteger(num) || toolkit.isIntegerBasedString(num)) {
    var effectiveInteger = parseInt(num, 10);
    if (effectiveInteger < threshold) {
      return new Buffer([effectiveInteger]);
    }
    throw err;
  }
  throw new Error(ERROR_MESSAGES.INVALID_INPUT);
};

var getVersionBuffer = function (version) {
  return getConstrainedNumberAsBuffer(version, 256, 
    ERROR_MESSAGES.VERSION_NOT_SUPPORTED);
};

var forceSegmentAcknowledmentForBundleRefusal = function (flags) {
  if ('bundleRefusalSupport' in flags) {
    flags.segmentAcknowledge = true;
  }
};

var getFlagBuffer = function (flags) {
  var bufferData = 0;
  forceSegmentAcknowledmentForBundleRefusal(flags);
  for (var flag in flags) {
    if (flags[flag] === true) {
      bufferData = bufferData | HEADER_CONSTRAINTS.FLAG_MAPPING[flag];
    }
  }
  return new Buffer([bufferData]);
};

var getKeepaliveIntervalBuffer = function (interval) {
  // TODO: ensure the buffer is two-bytes long
  // fill the first byte with zeros if necessary
  return getConstrainedNumberAsBuffer(interval, 65536,
    ERROR_MESSAGES.UNACCEPTABLE_INTERVAL);
};


// Constructor

var ContactHeader = function (options) { 
  // ensure the options value is defined
  options = options || { };
  // set the instance variables
  this.magic = new Buffer(HEADER_CONSTRAINTS.MAGIC_VALUE);
  this.version = getVersionBuffer(options.version || 1);
  this.flags = getFlagBuffer(options.flags || {
    segmentAcknowledge: false,
    reactiveFragmentation: false,
    bundleRefusalSupport: false,
    sendLengthMessages: false
  });
  this.keepaliveInterval = getKeepaliveIntervalBuffer(options.keepaliveInterval || 10);
};


// Instance methods

ContactHeader.prototype.valueOf = function () {
  // create a new buffer with the required base size
  var result = new Buffer(HEADER_CONSTRAINTS.BASE_SIZE);
  // copy contents from the in-memory buffer
  this.magic.copy(result, 0, 0, 4);
  this.version.copy(result, 4, 0, 1);
  this.flags.copy(result, 5, 0, 1);
  // this.keepaliveInterval.copy(result, 6, 0, 2);
  // return it
  return result;
};


// Export API
module.exports = ContactHeader;