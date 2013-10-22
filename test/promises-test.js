var expect = require('expect.js');
var fs = require('fs');
var Q = require('q');
var FS = require('Q-io/fs');

describe('promises tests', function() {
  var directories;
  beforeEach(function(done) {
    fs.mkdir('./test/test-dir/', function() {
      done();
    });
    directories = [];
  });

  afterEach(function(done) {
    fs.rmdir('./test/test-dir/', function() {
      done();
    });
  });

  it('should complete after a forEach loop', function(done) {
    var values   = [1, 2, 3],
        endValue= 0,
        promises = [],
        assignValue, asyncAdder, completed;

    asyncAdder = function (value, callback) {
      setTimeout(function(result) {
        endValue += value;
        callback(endValue);
      }, 5);
    };

    assignValue = function(value) {
      var deferred = Q.defer();
      asyncAdder(value, function(result) {
        deferred.resolve(result);
      });
      promises.push(deferred.promise);
    };

    completed = function() {
      expect(endValue).to.be(6);
      done();
    };
    values.forEach(assignValue);
    Q.all(promises).then(completed);
  });

  it('should flatten callback tree to remove and create a file directory', function(done){
    var testDir = './test/test-dir/';
    FS.removeTree(testDir)
      .then(function() {
        return FS.makeDirectory(testDir);
      })
      .then(function() {
        return FS.write(testDir + 'hello.txt', 'Hello World!\n');
      })
      .then(function() {
        return FS.read(testDir + 'hello.txt');
      })
      .then(function(hello) {
        expect(hello).to.be('Hello World!\n');
      })
      .done(function() {
        done();
      });
  });
  it('should read a list of directories from a base directory',
  function(done){
    FS.list('.')
      .then(function(files) {
        var deferreds = files.map(function(file) {
          return FS.isDirectory(file)
                   .then(function(result) {
                     if (result === true) {
                       directories.push(file);
                       console.log(directories);
                     }
                   });
          
        });
        return deferreds;
      })
      .then(function(dir) {
        expect(directories.length).to.be(2);
      })
      .done(function() {
        done();
      });
  });
});
