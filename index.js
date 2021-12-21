#!/usr/bin/env node

const { program } = require("commander");
const check = require("./commands/check");
const health = require("./commands/health");

program
  .command("check")
  .description("Goes through all the dependencies")
  .action(check);
program
  .command("health")
  .description("Goes through package.json")
  .action(health);
program.parse();
