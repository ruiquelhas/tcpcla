var MAGIC_VALUE = 'dtn!';

var ContactHeader = function () { 
  this.magic = new Buffer(MAGIC_VALUE);
};

ContactHeader.prototype.valueOf = function () {
  return new Buffer(this.magic);
};

module.exports = ContactHeader;