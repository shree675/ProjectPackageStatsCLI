const chalk = require("chalk");

var finalpaths = [];
var name = "";
var description = "";
var directories = "";
var version = "";
var homepage = "";
var license = "";
var author = "";
var man = "";
var repository = "";

const health = async () => {
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
  });
};

const searchFiles = async (directories) => {
  const fs = require("fs").promises;
  for (var i = 0; i < directories.length; i++) {
    path = directories[i];
    if (!path.includes("node_modules") && !path.includes(".git")) {
      var files = await fs.readdir(process.cwd() + "/" + path).catch((err) => console.log(chalk.red("ERR: ") + err));
      if (files.indexOf("package-lock.json") > -1) {
        finalpaths.push(path);
      }
    }
    if (directories.indexOf(path) >= directories.length - 1) {
      extractJSON();
    }
  }
};

const extractJSON = async () => {
  const fs = require("fs");
  const util = require("util");
  const readFile = util.promisify(fs.readFile);
  if (finalpaths.length === 0) {
    console.log(chalk.red("ERR: ") + "Could not find a package.json file anywhere in the tree.");
    return;
  }
  console.log("Checking " + chalk.bgWhite(chalk.black(process.cwd() + "/" + finalpaths[0] + "/package.json")));
  var num = 0;
  readFile(process.cwd() + "/" + finalpaths[0] + "/package.json", "utf8").then((data) => {
    const packageJSON = JSON.parse(data);
    if (packageJSON.name && packageJSON.name !== "") {
      name = packageJSON.name;
      console.log(chalk.green("✔ ") + "Name");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Name (missing/incomplete)");
    }
    if (packageJSON.version && packageJSON.version !== "") {
      version = packageJSON.version;
      console.log(chalk.green("✔ ") + "Version");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Version (missing/incomplete)");
    }
    if (packageJSON.description && packageJSON.description !== "") {
      description = packageJSON.description;
      console.log(chalk.green("✔ ") + "Description");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Description (missing/incomplete)");
    }
    if (packageJSON.directories && packageJSON.directories !== {}) {
      directories = packageJSON.directories;
      console.log(chalk.green("✔ ") + "Directories");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Directories (missing/incomplete)");
    }
    if (packageJSON.homepage && packageJSON.homepage !== "") {
      homepage = packageJSON.homepage;
      console.log(chalk.green("✔ ") + "Homepage URL");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Homepage URL (missing/incomplete)");
    }
    if (packageJSON.license && packageJSON.license !== "") {
      license = packageJSON.license;
      console.log(chalk.green("✔ ") + "License");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "License (missing/incomplete)");
    }
    if (packageJSON.author && packageJSON.author !== "" && packageJSON.author !== {}) {
      author = packageJSON.author;
      console.log(chalk.green("✔ ") + "Author/Contributors");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Author/Contributors (missing/incomplete)");
    }
    if (packageJSON.man && packageJSON.man !== "" && packageJSON.man != []) {
      man = packageJSON.man;
      console.log(chalk.green("✔ ") + "Manual");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Manual (missing/incomplete)");
    }
    if (packageJSON.repository && packageJSON.repository !== {}) {
      repository = packageJSON.repository;
      console.log(chalk.green("✔ ") + "Repository URL");
      num++;
    } else {
      console.log(chalk.red("✘ ") + "Repository URL (missing/incomplete)");
    }
    if (num === 9) {
      console.log("Your package.json seems to have been updated well. It is ready for release.");
    } else if (num >= 7) {
      console.log("Your package.json could be improved. However, it is ready for release.");
    } else {
      console.log(
        "Your package.json needs to be updated and is currently not ready for release. Please have a look at https://nodejs.dev/learn/the-package-json-guide."
      );
    }
  });
};

module.exports = health;
