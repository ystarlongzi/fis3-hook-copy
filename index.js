var fs = require('fs');
var path = require('path');
var cliArgv = process.argv;
var cwd = fis.processCWD || process.cwd();
var projectPath = fis.project.getProjectPath();
var dest = 'preview';


cliArgv.forEach(function (val, i) {
  if (val === '-d' || val === '--dest') {
    dest = cliArgv[i + 1];
  }
});
dest = normalizePath(dest, projectPath);


// refer to: http://t.cn/Ra8HWUq
function getServerInfo() {
  var conf = path.join(fis.project.getTempPath('server'), 'conf.json');

  if (fis.util.isFile(conf)) {
    return fis.util.readJSON(conf);
  }

  return {};
}

function getServerRoot() {
  var key = 'FIS_SERVER_DOCUMENT_ROOT';
  var serverInfo = getServerInfo();

  if (process.env && process.env[key]) {
    var path = process.env[key];

    if (fis.util.exists(path) && !fis.util.isDir(path)) {
      fis.log.error('invalid environment variable [' + key + '] of document root [' + path + ']');
    }

    return path;
  }

  if (serverInfo['root'] && fis.util.is(serverInfo['root'], 'String')) {
    return serverInfo['root'];
  }

  return fis.project.getTempPath('www');
}

function normalizePath(to, root) {
  if (to[0] === '.') {
    to = fis.util(cwd + '/' + to);
  }
  else if (/^output\b/.test(to)) {
    to = fis.util(root + '/' + to);
  }
  else if (to === 'preview') {
    to = getServerRoot();
  }
  else {
    to = fis.util(to);
  }

  return to;
}

function noop() {}


module.exports = function (fis, opts) {
  var tasks = [];
  var illegalParamsTip = 'fis-hook-copy lack of `from` or `to` property.';

  if (!opts) {
    return;
  }

  if (opts.tasks) {
    tasks = opts.tasks;
  }
  else if (opts.from && opts.to) {
    tasks = [
      {from: opts.from, to: opts.to},
    ];
  }
  else {
    fis.log.error(illegalParamsTip);
    return;
  }


  fis.on('deploy:end', function () {
    tasks.forEach(function (o) {
      var from = o.from;
      var to = o.to;
      var symlink = o.symlink;

      if (!from || !to) {
        fis.log.error(illegalParamsTip);
        return;
      }

      to = normalizePath(to.replace(/DEST_PATH/, dest), projectPath);
      from = path.join(projectPath, from);

      if (!symlink) {
        fis.util.copy(from, path.join(to, o.from));
      }
      else if (!fis.util.exists(to)) {
        var symlinkType = fis.util.isFile(from) ? 'file' : 'dir';

        fs.symlinkSync(from, to, symlinkType, noop);
      }
    });
  });
};
