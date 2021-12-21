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
            extractJSON();
          }
        }
      });
    }
  });
};

const extractJSON = async () => {
  const fs = require("fs");
  const util = require("util");
  const readFile = util.promisify(fs.readFile);
  if (finalpaths.length === 0) {
    console.log(
      chalk.red("ERR: ") +
        "Could not find a package.json file anywhere in the tree."
    );
    return;
  }
  console.log(
    "Checking " +
      chalk.bgWhite(
        chalk.black(process.cwd() + "/" + finalpaths[0] + "/package.json")
      )
  );

  readFile(process.cwd() + "/" + finalpaths[0] + "/package.json", "utf8").then(
    (data) => {
      const packageJSON = JSON.parse(data);
      if (packageJSON.name && packageJSON.name !== "") {
        name = packageJSON.name;
        console.log(chalk.green("✔ ") + "Name");
      } else {
        console.log(chalk.red("✘ ") + "Name");
      }
      if (packageJSON.version && packageJSON.version !== "") {
        version = packageJSON.version;
        console.log(chalk.green("✔ ") + "Version");
      } else {
        console.log(chalk.red("✘ ") + "Version");
      }
      if (packageJSON.description && packageJSON.description !== "") {
        description = packageJSON.description;
        console.log(chalk.green("✔ ") + "Description");
      } else {
        console.log(chalk.red("✘ ") + "Description");
      }
      if (packageJSON.directories && packageJSON.directories !== {}) {
        directories = packageJSON.directories;
        console.log(chalk.green("✔ ") + "Directories");
      } else {
        console.log(chalk.red("✘ ") + "Directories");
      }
      if (packageJSON.homepage && packageJSON.homepage !== "") {
        homepage = packageJSON.homepage;
        console.log(chalk.green("✔ ") + "Homepage URL");
      } else {
        console.log(chalk.red("✘ ") + "Homepage URL");
      }
      if (packageJSON.license && packageJSON.license !== "") {
        license = packageJSON.license;
        console.log(chalk.green("✔ ") + "License");
      } else {
        console.log(chalk.red("✘ ") + "License");
      }
      if (
        packageJSON.author &&
        packageJSON.author !== "" &&
        packageJSON.author !== {}
      ) {
        author = packageJSON.author;
        console.log(chalk.green("✔ ") + "Author/Contributors");
      } else {
        console.log(chalk.red("✘ ") + "Author/Contributors");
      }
      if (packageJSON.man && packageJSON.man !== "" && packageJSON.man != []) {
        man = packageJSON.man;
        console.log(chalk.green("✔ ") + "Manual");
      } else {
        console.log(chalk.red("✘ ") + "Manual");
      }
      if (packageJSON.repository && packageJSON.repository !== {}) {
        repository = packageJSON.repository;
        console.log(chalk.green("✔ ") + "Repository URL");
      } else {
        console.log(chalk.red("✘ ") + "Repository URL");
      }
    }
  );
};

module.exports = health;
