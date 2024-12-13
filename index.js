const colors = {
    "yellow": "\x1b[33m",
    "reset": "\x1b[0m"
};

function EnsureArgument(argument, name) {
    if (!argument || argument === undefined || argument === null) {
        throw "Error: argument " + name + " is undefined";
    }
}

function IsNumeric(num) { // returns whether a string (or number) is a number 
    if (typeof num === "string") {
        num = num.replace(/\s/g, "");
    }
    return !isNaN(num);
}

function StringToBoolean(str) {
    str = str.toLowerCase();
    return str === "true" || str === "1";
}

function ApplyValue(Option, value) {
    switch (Option.config.type) {
        case "string":
            return String(value);
        case "number":
            return Number(value);
        case "boolean":
            console.log("Boolean " + value + "is " + StringToBoolean(value));
            return StringToBoolean(value);
        default:
            return value;
    }
}

// Compare option to a string
function compVals(option, key) {
    key = key.toLowerCase();
    if (option.name.toLowerCase() === key) {
        return true;
    }
    if (option.config.alias) {
        if (option.config.alias !== "") {
            if (option.config.alias.toLowerCase() === key) {
                return true;
            }
        }
    }
    return false;
}

function Parse(argumentList, OptionsList, GlobalConfig) {
    let argv = {};
    const OptionsLength = OptionsList.length;
    let LastArgumentWasKey = false;
    let LastKeyIndex = 0;

    for (var i = 0; i < argumentList.length; i++) {
        if (LastArgumentWasKey) {
            argv[OptionsList[LastKeyIndex].name] = ApplyValue(OptionsList[LastKeyIndex], argumentList[i]);
            LastArgumentWasKey = false;
        } else {
            let CurrentKey = argumentList[i].replace(/^-*/g, "");

            let SingleToken = false;
            if (CurrentKey.includes("=")) { CurrentKey = CurrentKey.split("=", 2); SingleToken = true; }
            if (CurrentKey.includes(":")) { CurrentKey = CurrentKey.split(":", 2); SingleToken = true; }
            if (SingleToken) {
                for (var j = 0; j < OptionsLength; j++) {
                    if (compVals(OptionsList[j], CurrentKey)) {
                        argv[OptionsList[j].name] = ApplyValue(OptionsList[j], CurrentKey[1]);
                        break;
                    }
                }
            } else {
                let Found = false;
                for (var j = 0; j < OptionsLength; j++) {
                    if (compVals(OptionsList[j], CurrentKey)) {
                        if (OptionsList[j].config.type === "boolean") {
                            if (argumentList[i + 1]) {
                                const temp = argumentList[i + 1].toLowerCase();
                                if (temp !== "true" && temp !== "false" && temp !== "1" && temp !== "0") {
                                    argv[OptionsList[j].name] = true;
                                    Found = true;
                                    break;
                                }
                            } else { argv[OptionsList[j].name] = true; }
                        }
                        LastKeyIndex = j;
                        LastArgumentWasKey = true;
                        Found = true;
                        break;
                        // argv[OptionsList[j].name] = ApplyValue(OptionsList[j], CurrentKey);
                    }
                }

                // Handle unknown arguments
                if (!Found) {
                    if (GlobalConfig.strict) {
                        throw "Error unknown argument: " + CurrentKey;
                    } else if (GlobalConfig.warnUnknown) {
                        console.log(colors.yellow + "Warning! " + colors.reset + "Unknown argument: " + CurrentKey);
                    }
                }
            }

        }
    } for (let i = 0; i < OptionsLength; i++) {
        if (!argv[OptionsList[i].name]) {
            if (OptionsList[i].config.demandOption) {
                throw "Please provide argument: " + OptionsList[i].name;
            }
            if (OptionsList[i].config.default !== null) {
                argv[OptionsList[i].name] = OptionsList[i].config.default;
            }
        }
    }
    return argv;
}

class Option {

    constructor(name, ConfigObject) {
        EnsureArgument(name, "name"); EnsureArgument(ConfigObject, "ConfigObject");
        this.name = name;
        this.config = { alias: "", describe: "", type: "string", default: null, demandOption: false };
        if (!ConfigObject.hasOwnProperty("type")) {
            throw "Error: could not find type of option" + name;
        }
        for (var key in ConfigObject) {
            if (this.config.hasOwnProperty(key)) {
                this.config[key] = ConfigObject[key];

            } else { console.log("Warning: Unknown option " + key); }
        }

    }
}

class ArrowArgs {
    constructor(ArgumentsList) {
        this.options = []; if (ArgumentsList.length > 0) {
            if (ArgumentsList[0].includes("/node") || ArgumentsList[0].includes("\\node")) {
                ArgumentsList = ArgumentsList.slice(2);
            }
        }

        this.ArgumentsList = ArgumentsList;
        this.GlobalConfig = {
            help: false,
            strict: false,
            version: null,
            warnUnknown: false,
        }
    }
    option(name, ConfigObject) {
        this.options.push(new Option(name, ConfigObject));
        return this;
    }
    help() {
        this.GlobalConfig.help = true;
        return this;
    }
    strict() {
        this.GlobalConfig.strict = true;
        return this;
    }
    warnUnknown() {
        this.GlobalConfig.warnUnknown = true;
        return this;
    }

    version(VersionNum) {
        this.GlobalConfig.version = VersionNum;
        return this;
    }
    get argv() {
        return Parse(this.ArgumentsList, this.options, this.GlobalConfig);
    }
}

function Main(ArgumentsList) {

    return new ArrowArgs(ArgumentsList);
}
module.exports = Main;