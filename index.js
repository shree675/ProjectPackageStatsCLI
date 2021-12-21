#!/usr/bin/env node

const { program } = require("commander");
const check = require("./commands/check");

program.command("check").description("Goes through all the dependencies").action(check);
program.parse();
