var toolkit = require('./toolkit');

// constant definition
var HEADER_CONSTRAINTS = {
  FIXED_SIZE: 8,
  MAGIC_VALUE: 'dtn!',
  DEFAULT_VERSION: 1,
  FLAGS: { segmentAcknowledge: 0x01, reactiveFragmentation: 0x02,
    bundleRefusalSupport: 0x04, sendLengthMessages: 0x08 },
  FIELD_SIZES: { MAGIC: 4, VERSION: 1, FLAGS: 2, KEEPALIVE: 1 },
  FIELD_INDEXES: { MAGIC: 0, VERSION: 4, FLAGS: 5, KEEPALIVE: 6 }
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
      bufferData = bufferData | HEADER_CONSTRAINTS.FLAGS[flag];
    }
  }
  return new Buffer([bufferData]);
};

var getKeepAliveIntervalBuffer = function (interval) {
  // TODO: ensure the buffer is two-bytes long
  // fill the first byte with zeros if necessary
  return getConstrainedNumberAsBuffer(interval, 65536,
    ERROR_MESSAGES.INTERVAL_TOO_HIGH);
};


// Constructor

var ContactHeader = function (options) { 
  // ensure the options value is defined
  options = options || { };
  // set the instance variables representing the header fieds
  // the magic field always contains the same value
  this.magic = new Buffer(HEADER_CONSTRAINTS.MAGIC_VALUE);
  // if the version is not specified it defaults to 1
  this.version = getVersionBuffer(options.version || 
    HEADER_CONSTRAINTS.DEFAULT_VERSION);
  // set convergence layer transmission options as header flags
  this.flags = getFlagBuffer(options.flags || {
    segmentAcknowledge: false,
    reactiveFragmentation: false,
    bundleRefusalSupport: false,
    sendLengthMessages: false
  });
  // set the interval betweetn keepalive message transmissions
  this.keepAliveInterval = getKeepAliveIntervalBuffer(
    options.keepAliveInterval || 10);
};


// Instance methods

ContactHeader.prototype.valueOf = function () {
  // create a new buffer with the required base size
  var result = new Buffer(HEADER_CONSTRAINTS.FIXED_SIZE);
  // copy contents from the in-memory buffer
  this.magic.copy(result, HEADER_CONSTRAINTS.FIELD_INDEXES.MAGIC, 0, 
    HEADER_CONSTRAINTS.FIELD_SIZES.MAGIC);
  this.version.copy(result, HEADER_CONSTRAINTS.FIELD_INDEXES.VERSION, 0, 
    HEADER_CONSTRAINTS.FIELD_SIZES.VERSION);
  this.flags.copy(result, HEADER_CONSTRAINTS.FIELD_INDEXES.FLAGS, 0, 
    HEADER_CONSTRAINTS.FIELD_SIZES.FLAGS);
  // this.keepAliveInterval.copy(result, 6, 0, 2);
  // return it
  return result;
};


// Export API
module.exports = ContactHeader;