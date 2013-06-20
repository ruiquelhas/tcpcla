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
  VERSION_NOT_SUPPORTED: 'the version number is not supported by the protocol'
};


// Private Helper functions

var getVersionBuffer = function (version) {
  if (toolkit.isInteger(version) || toolkit.isIntegerBasedString(version)) {
    var effectiveInteger = parseInt(version, 10);
    if (effectiveInteger < 256) {
      return new Buffer([effectiveInteger]);
    }
    throw new Error(ERROR_MESSAGES[VERSION_NOT_SUPPORTED]);
  }
  throw new Error(ERROR_MESSAGES[INVALID_INPUT]);
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
  return null;
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
  var result = new Buffer(HEADER_CONSTRAINTS.BASE_SIZE);
  this.magic.copy(result, 0, 0, 4);
  this.version.copy(result, 4, 0, 1);
  this.flags.copy(result, 5, 0, 1);
  return result;
};


// Export API
module.exports = ContactHeader;