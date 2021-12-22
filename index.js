#!/usr/bin/env node

const { program } = require("commander");
const check = require("./commands/check.js");
const health = require("./commands/health");

program.command("checkdeps").description("Checks all the dependencies installed in the project").action(check);
program.command("pjson").description("Checks the status of package.json defined in your project").action(health);
program.parse();
