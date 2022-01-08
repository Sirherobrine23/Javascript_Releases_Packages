const fs = require("fs");
const path = require("path");
const js_yaml = require("js-yaml");
const cli_color = require("cli-color");
const yargs = require("yargs");

async function main(CliOptions = {configFile: "./config.yml", tmpDir: "./tmp", outputDir: "./dist", verbose: false}, Config = {name: "javascript_releases_packages", version: "1.0.0", description: "", author: "", license: "", homepage: "", repository: "", build_with_nexe: false, build: {deb: {build: true, archs: ["amd64", "arm64", "armhf"], depends: ["nodejs"], preDepends: [], recommends: [], suggests: [], conflicts: [], replaces: []}, rpm: { message: "Not implemented yet", build: false, depends: [] }}}) {
  const DebBuild = require("./builds/deb/index");
  if (Config.build.deb.build) {
    if (!(fs.existsSync(path.resolve(CliOptions.tmpDir, "deb")))) fs.mkdirSync(path.resolve(CliOptions.tmpDir, "deb"), {recursive: true});
    if (!(fs.existsSync(path.resolve(CliOptions.outputDir, "deb")))) fs.mkdirSync(path.resolve(CliOptions.outputDir, "deb"), {recursive: true});
    await DebBuild.main(CliOptions, Config);
  }
  if (Config.build.rpm.build) {
    throw new Error("Disable rpm build for now");
  }
  return CliOptions.outputDir;
}

if (require.main === module) {
  const argv = yargs.options({
    "config-file": {
      alias: "c",
      type: "string",
      description: "Path to the config file",
      default: path.resolve(process.cwd(), "config.yml")
    },
    "tmp-dir": {
      alias: "t",
      type: "string",
      description: "Path to the tmp directory",
      default: path.resolve(process.cwd(), "tmp")
    },
    "output-dir": {
      alias: "o",
      type: "string",
      description: "Path to the output directory",
      default: path.resolve(process.cwd(), "dist")
    },
    "verbose": {
      alias: "v",
      type: "boolean",
      description: "Verbose output",
      default: false
    }
  }).argv;
  const ArgObject = {
    configFile: argv["config-file"],
    tmpDir: argv["tmp-dir"],
    outputDir: argv["output-dir"],
    verbose: argv["verbose"]
  };
  let YamlConfigObject = {
    "name": path.basename(process.cwd()),
    "version": "1.0.0",
    "description": "",
    "author": "",
    "license": "",
    "homepage": "",
    "repository": "",
    build_with_nexe: false,
    build: {
      "deb": {
        build: true,
        archs: ["amd64", "arm64", "armhf"],
        depends: ["nodejs"],
        preDepends: [],
        recommends: [],
        suggests: [],
        conflicts: [],
        replaces: []
      },
      "rpm": {
        message: "Not implemented yet",
        build: false,
        depends: []
      }
    }
  };
  if (!(fs.existsSync(ArgObject.configFile))) {
    if (fs.existsSync(path.resolve(path.parse(ArgObject.configFile).dir, "package.json"))) {
      const PackageJsonObject = require(path.resolve(path.parse(ArgObject.configFile).dir, "package.json"));
      YamlConfigObject.name = PackageJsonObject.name;
      YamlConfigObject.version = PackageJsonObject.version;
    }
    console.log(`Creating config file at`, (String(ArgObject.configFile)).includes(" ") ? `"${ArgObject.configFile}"` : ArgObject.configFile);
    fs.writeFileSync(ArgObject.configFile, js_yaml.dump(YamlConfigObject));
  }
  YamlConfigObject = js_yaml.load(fs.readFileSync(ArgObject.configFile, "utf8"));
  // if (ArgObject.verbose) {
  //   console.log("Config file:", YamlConfigObject);
  //   console.log("Arguments:", ArgObject);
  // }
  main(ArgObject, YamlConfigObject).then(() => process.exit(0)).catch(Err => {
    console.log("Detect error or crash in main()");
    console.error(cli_color.redBright(Err.stack || String(Err)));
    process.exit(1);
  });
} else module.exports.default = main;