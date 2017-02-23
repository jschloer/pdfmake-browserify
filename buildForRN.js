var execSync = require('child_process').execSync;
var concat = require('concat-files');
var rimraf = require('rimraf');
var cp = require('cp');

function makeBundle() {
  const promise = new Promise(function (resolve, reject) {
    concat(['pdfmake/build/pdfmake.js', 'pdfmake/build/vfs_fonts.js'], 'lib/bundle.js', (err) => {
      if (err) {
        reject(`unable to bundle the js files together: ${err}`);
      };
      resolve('success')
    });
  });
  return promise;
}

function gitPull() {
  return new Promise((resolve, reject) => {
    var cmd = 'git clone https://github.com/bpampuch/pdfmake.git';
    try {
      execSync(cmd);
      console.log('git finished');
      resolve('Successfully cloned')
    } catch (err) {
      reject(`failed to clone repo: ${err}`);
    }
  });
}
function yarnInstall() {
  return new Promise((resolve, reject) => {
    var cmd = 'yarn install';
    try {
      execSync(cmd, { cwd: 'pdfmake' });
      resolve('yarn install success');
    } catch (err) {
      reject(`yarn install failed: ${err}`);
    }
  });
}
function clean() {
  return new Promise((resolve, reject) => {
    rimraf('pdfmake', (err) => {
      if (err) {
        reject(`could not remove pdfmake folder, with error: ${err}`)
      }
      resolve();
    })
  });
}
function copyFileSaver() {
  return new Promise((resolve, reject) => {
    cp('./FileSaver.js', './pdfmake/libs/FileSaver.js/FileSaver.js', (err) => {
      if (err) {
        console.log(err);
        reject(`Failed FileSaver copy: ${err}`);
      } else {
        resolve();
      }
    })
  });
}
function buildPdfMake() {
  return new Promise((resolve, reject) => {
    var cmd = 'yarn run build';
    try {
      execSync(cmd, { cwd: 'pdfmake' });
      resolve('pdfmake build success');
    } catch (err) {
      reject(`pdfmake build failed: ${err}`);
    }
  });
}

function build() {
  // start by cleaning the pdfmake directory
  clean()
  // pull pdfmake from git
    .then(gitPull)
    // copy our stubbed in dead FileSaver so React Native doesn't choke
    .then(copyFileSaver)
    // download dependencies
    .then(yarnInstall)
    // run the pdf make build process
    .then(buildPdfMake)
    // bundle our resources
    .then(makeBundle)
    .catch((err) => {
      console.log(`Failed with Error: ${err}`);
    });
}

build();
