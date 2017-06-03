const fs = require('fs');
const path = require('path');

const cliArgv = process.argv;
const cwd = fis.processCWD || process.cwd();
const projectPath = fis.project.getProjectPath();
const fileReg = /([^/]+?)$/;
let dest = 'preview';


function noop() {}

// refer to: http://t.cn/Ra8HWUq
function getServerInfo() {
  const conf = path.join(fis.project.getTempPath('server'), 'conf.json');

  if (fis.util.isFile(conf)) {
    return fis.util.readJSON(conf);
  }

  return {};
}

function getServerRoot() {
  const key = 'FIS_SERVER_DOCUMENT_ROOT';
  const serverInfo = getServerInfo();

  if (process.env && process.env[key]) {
    const rootPath = process.env[key];

    if (fis.util.exists(rootPath) && !fis.util.isDir(rootPath)) {
      fis.log.error(`invalid environment variable [${key}] of document root [${rootPath}].`);
    }

    return rootPath;
  }

  if (serverInfo.root && fis.util.is(serverInfo.root, 'String')) {
    return serverInfo.root;
  }

  return fis.project.getTempPath('www');
}

function normalizePath(to, root) {
  let _to;

  if (to[0] === '.') {
    _to = fis.util(`${cwd}/${to}`);
  }
  else if (/^output\b/.test(to)) {
    _to = fis.util(`${root}/${to}`);
  }
  else if (to === 'preview') {
    _to = getServerRoot();
  }
  else {
    _to = fis.util(to);
  }

  return _to;
}


cliArgv.forEach((val, i) => {
  if (val === '-d' || val === '--dest') {
    dest = cliArgv[i + 1];
  }
});
dest = normalizePath(dest, projectPath);


module.exports = (fis, opts) => {
  const illegalParamsTip = 'fis-hook-copy lack of `from` or `to` property.';
  let tasks = [];

  if (!opts) {
    return;
  }

  if (opts.tasks) {
    tasks = opts.tasks;
  }
  else if (opts.from && opts.to) {
    tasks = [
      Object.assign({}, opts),
    ];
  }
  else {
    fis.log.error(illegalParamsTip);
    return;
  }

  fis.on('deploy:end', () => {
    tasks.forEach(o => {
      let { from, to, symlink } = o;

      if (!from || !to) {
        fis.log.error(illegalParamsTip);
        return;
      }

      to = normalizePath(to.replace(/DEST_PATH/, dest), projectPath);
      from = path.join(projectPath, from);

      if (!symlink) {
        if (fis.util.isFile(from)) {
          fis.util.copy(from, path.join(to, from.match(fileReg)[1]));
        }
        else {
          fis.util.copy(from, path.join(to, o.from));
        }
      }
      else if (!fis.util.exists(to)) {
        const symlinkType = fis.util.isFile(from) ? 'file' : 'dir';

        fs.symlinkSync(from, to, symlinkType, noop);
      }
    });
  });
};
