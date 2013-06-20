var ContactHeader = function () { };

ContactHeader.prototype.valueOf = function () {
  return new Buffer('dtn!');
};

module.exports = ContactHeader;