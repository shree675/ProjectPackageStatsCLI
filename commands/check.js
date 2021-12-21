const chalk = require("chalk");
const getSizes = require("package-size");
const stats = require("npm-module-stats");

var finalpaths = [];
var allpackages = [];
var package = 0;

const check = async () => {
  const fs = require("fs").promises;
  const path = await fs.readFile(process.cwd() + "/.gitignore", "utf8", (err, data) => {
    if (err) {
      console.error(
        chalk.yellow("Warning: ") + "You must have a gitignore file to reduce the search space, else the results will not be accurate."
      );
      return null;
    }
    return data;
  });
  var lines = path.split(/\r?\n/);
  // console.log("lines:", lines);
  lines.push(".git");
  searchDirectories(lines);
};

const searchDirectories = async (forbidden) => {
  var finder = require("findit")(".");
  var directories = [];
  finder.on("directory", function (file, stat, stop) {
    if (forbidden.indexOf(file) >= 0 || forbidden.indexOf("/" + file) >= 0) {
      stop();
    } else {
      directories.push(file);
    }
  });
  finder.on("end", function () {
    console.log(chalk.yellowBright("Note: ") + "Big projects may take a while");
    directories = directories.filter((path) => !path.includes("node_modules") && !path.includes(".git"));
    searchFiles(directories);
  });
};

const searchFiles = async (directories) => {
  const fs = require("fs");
  directories.map(async (path) => {
    if (!path.includes("node_modules") && !path.includes(".git")) {
      fs.readdir(process.cwd() + "\\" + path, (err, files) => {
        if (err) {
          console.log(chalk.red("ERR: ") + err);
        } else {
          if (files.indexOf("package-lock.json") > -1) {
            finalpaths.push(path);
          }
          if (directories.indexOf(path) === directories.length - 1) {
            extractPackages();
          }
        }
      });
    }
  });
};

const extractPackages = async () => {
  const fs = require("fs");
  const util = require("util");
  const readFile = util.promisify(fs.readFile);
  var counter = 0;
  if (finalpaths.length === 0) {
    console.log(chalk.red("ERR: ") + "Could not find a package.json file anywhere in the tree.");
    return;
  }
  // getSizes("bootstrap", {})
  //   .then((sizes) => {
  //     console.log(sizes);
  //   })
  //   .catch((err) => console.log("err"));

  stats
    .getStats("glob")
    .then((stack) => {
      let dependencies = Object.keys(stack);
      let totalSize = dependencies.reduce((result, key, index) => {
        return result + stack[key].size;
      }, 0);

      console.log("Total Size in Bytes ", totalSize);
      console.log("Total Dependencies ", dependencies.length - 1);
    })
    .catch((err) => {
      console.error(err);
    });

  for (var i = 0; i < finalpaths.length; i++) {
    readFile(process.cwd() + "\\" + finalpaths[i] + "\\package.json", "utf8").then((data) => {
      const packageJSON = JSON.parse(data);
      for (dependency in packageJSON.dependencies) {
        if (packageJSON.dependencies.hasOwnProperty(dependency)) {
          allpackages.push(dependency);
        }
      }
      counter++;
      if (counter === finalpaths.length) {
        allpackages = [...new Set(allpackages)];
        // console.log(allpackages);
        console.log("Your dependencies in the project:");
        // displayPackages();
      }
    });
  }
};

const displayPackages = () => {
  getSizes(allpackages[package], {})
    .then((data) => {
      console.log(chalk.yellow(package + 1 + "."), allpackages[package] + chalk.grey(" ----- " + data.size));
      if (package !== allpackages.length - 1) {
        package++;
        displayPackages();
      }
    })
    .catch((err) => {
      console.log(chalk.yellow(package + 1 + "."), allpackages[package]);
      if (package !== allpackages.length - 1) {
        package++;
        displayPackages();
      }
    });
};

module.exports = check;
