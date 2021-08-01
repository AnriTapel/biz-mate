const fs = require('fs-extra');

if (fs.pathExistsSync('dist')) {
  fs.removeSync('dist');
}
