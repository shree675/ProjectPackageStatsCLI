const chalk = require("chalk");
var latest = require("latest");
var EventEmitter = require("events");

var finalpaths = [];
var allpackages = [];
var package1 = 0;
var name = "";
var packagejson = "";

const check = async () => {
  const fs = require("fs").promises;
  const path = await fs.readFile(process.cwd() + "/.gitignore", "utf8", (err, data) => {
    if (err) {
      console.error(
        chalk.yellow("Warning: ") +
          "You must have a gitignore file to reduce the search space, else the results will not be accurate."
      );
      return null;
    }
    return data;
  });
  var lines = path.split(/\r?\n/);
  lines.push(".git");
  console.log(chalk.yellowBright("Note: ") + "Big projects may take a while");
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
    directories = directories.filter((path) => !path.includes("node_modules") && !path.includes(".git"));
    searchFiles(directories);
    console.log();
  });
};

const searchFiles = async (directories) => {
  const fs = require("fs").promises;
  for (var i = 0; i < directories.length; i++) {
    var path = directories[i];
    if (!path.includes("node_modules") && !path.includes(".git")) {
      var files = await fs.readdir(process.cwd() + "/" + path).catch((err) => console.log(chalk.red("ERR: ") + err));
      if (files.indexOf("package-lock.json") > -1) {
        finalpaths.push(path);
      }
    }
    if (directories.indexOf(path) >= directories.length - 1) {
      extractPackages();
    }
  }
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

  for (var i = 0; i < finalpaths.length; i++) {
    readFile(process.cwd() + "/" + finalpaths[i] + "/package.json", "utf8").then((data) => {
      if (packagejson === "") {
        packagejson = data;
      }
      const packageJSON = JSON.parse(data);
      if (name === "") {
        name = packageJSON.name;
      }
      for (var dependency in packageJSON.dependencies) {
        if (packageJSON.dependencies.hasOwnProperty(dependency)) {
          allpackages.push([dependency, packageJSON.dependencies[dependency]]);
        }
      }
      counter++;
      if (counter === finalpaths.length) {
        allpackages = [...new Set(allpackages)];
        console.log("Please keep your dependencies upto date and remove unused packages before release");
        console.log("Your dependencies in the project " + chalk.bgWhite(chalk.black(name)) + ":");
        const emitter = new EventEmitter();
        emitter.setMaxListeners(0);
        displayPackages();
      }
    });
  }
};

const displayPackages = () => {
  latest(allpackages[package1][0], function (err, version) {
    console.log(
      chalk.yellow((package1 + 1 + ".").padEnd(3, " ")),
      (allpackages[package1][0] + " ").padEnd(30, "-"),
      chalk.bold(allpackages[package1][1].padEnd(12, "-")) + "->",
      version.slice(0, allpackages[package1][1].length) > allpackages[package1][1].slice(1)
        ? chalk.red("^" + version)
        : chalk.greenBright("^" + version)
    );
    if (package1 < allpackages.length - 1) {
      package1++;
      displayPackages();
    }
  });
};

module.exports = check;
