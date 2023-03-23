const argv = require("../index.js")(['-c', 'example', '--dev', '0', '--random', '-576.6545'])
    .option("c", { alias: "config-path", describe: "Path to config file if not in working directory", type: "string" })
    .option("random", { describe: "Put a number!", type: "number" })
    .option("dev", { describe: "Enters dev mode", type: "boolean", default: false })
    .strict()
    .help()
    .version("5.0.4")
    .argv;




console.log(argv.c);
if (argv.random) {
    console.log(argv.random);
} else { console.log("random not provided"); }
console.log(argv.dev);
if (argv.dev) { console.log("Entering dev mode!"); }