/**
 * CLI script that prints the output of '--help' to stdout, wrapped for processing as a markdown doc.
 * @module
 */
import buildYargsInstance from "args.js";

const yargsInstance = buildYargsInstance("--help");
const help = await yargsInstance
    .scriptName("git-stat-tracker")
    .wrap(null)
    .getHelp();

console.log("# CLI Usage\n");
console.log("```");
console.log(help);
console.log("```");
