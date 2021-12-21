const chalk = require("chalk");

var finalpaths = [];
var allpackages = [];
var package = 0;
var name = "";
var packagejson = "";

const check = async () => {
  const fs = require("fs").promises;
  const path = await fs.readFile(
    process.cwd() + "/.gitignore",
    "utf8",
    (err, data) => {
      if (err) {
        console.error(
          chalk.yellow("Warning: ") +
            "You must have a gitignore file to reduce the search space, else the results will not be accurate."
        );
        return null;
      }
      return data;
    }
  );
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
    directories = directories.filter(
      (path) => !path.includes("node_modules") && !path.includes(".git")
    );
    searchFiles(directories);
  });
};

const searchFiles = async (directories) => {
  const fs = require("fs");
  directories.map(async (path) => {
    if (!path.includes("node_modules") && !path.includes(".git")) {
      fs.readdir(process.cwd() + "/" + path, (err, files) => {
        if (err) {
          console.log(chalk.red("ERR: ") + err);
        } else {
          if (files.indexOf("package-lock.json") > -1) {
            finalpaths.push(path);
          }
          if (directories.indexOf(path) >= directories.length - 1) {
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
    console.log(
      chalk.red("ERR: ") +
        "Could not find a package.json file anywhere in the tree."
    );
    return;
  }

  for (var i = 0; i < finalpaths.length; i++) {
    readFile(
      process.cwd() + "/" + finalpaths[i] + "/package.json",
      "utf8"
    ).then((data) => {
      if (packagejson === "") {
        packagejson = data;
      }
      const packageJSON = JSON.parse(data);
      if (name === "") {
        name = packageJSON.name;
      }
      for (dependency in packageJSON.dependencies) {
        if (packageJSON.dependencies.hasOwnProperty(dependency)) {
          allpackages.push(dependency);
        }
      }
      counter++;
      if (counter === finalpaths.length) {
        allpackages = [...new Set(allpackages)];
        console.log(
          "Your dependencies in the project " +
            chalk.bgWhite(chalk.black(name)) +
            ":"
        );
        displayPackages();
      }
    });
  }
};

const displayPackages = () => {
  console.log(chalk.yellow(package + 1 + "."), allpackages[package]);
  if (package < allpackages.length - 1) {
    package++;
    displayPackages();
  }
};

module.exports = check;
