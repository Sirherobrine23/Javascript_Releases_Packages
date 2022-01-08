const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

function CreateControlFile(ControlConfig = {name: "javascript_releases_packages", version: "1.0.0", description: "", author: "", license: "", homepage: "", repository: "", archs: "amd64", depends: ["nodejs"], preDepends: [], recommends: [], suggests: [], conflicts: [], replaces: []}) {
  const ConfigBuild = [
    `Package: ${ControlConfig.name}`,
    `Version: ${ControlConfig.version}`,
    `Maintainer: ${ControlConfig.author || "Sirherobrien23 <srherobrine23@gmail.com>"}`,
    `Architecture: ${ControlConfig.archs}`
  ];
  return ConfigBuild.join("\n");
}

module.exports.main = async function main(CliOptions = {configFile: "../config.yml", tmpDir: "../tmp", outputDir: "../dist", verbose: false}, Config = {name: "javascript_releases_packages", version: "1.0.0", description: "", author: "", license: "", homepage: "", repository: "", build_with_nexe: false, build: {deb: {build: true, archs: ["amd64", "arm64", "armhf"], depends: ["nodejs"], preDepends: [], recommends: [], suggests: [], conflicts: [], replaces: []}, rpm: { message: "Not implemented yet", build: false, depends: [] }}}) {
  for (const Arch of Config.build.deb.archs) {
    const DebControl = CreateControlFile({
      name: Config.name,
      version: Config.version,
      description: Config.description,
      author: Config.author,
      license: Config.license,
      homepage: Config.homepage,
      repository: Config.repository,
      archs: Arch,
      depends: Config.build.deb.depends,
      preDepends: Config.build.deb.preDepends,
      recommends: Config.build.deb.recommends,
      suggests: Config.build.deb.suggests,
      conflicts: Config.build.deb.conflicts,
      replaces: Config.build.deb.replaces
    });
    if (!(fs.existsSync(path.resolve(CliOptions.tmpDir, "deb", Arch, "DEBIAN")))) {
      if (CliOptions.verbose) console.log(`Creating directory ${path.resolve(CliOptions.tmpDir, "deb", Arch, "DEBIAN")}`);
      fs.mkdirSync(path.resolve(CliOptions.tmpDir, "deb", Arch, "DEBIAN"), {recursive: true});
    }
    fs.writeFileSync(path.resolve(CliOptions.tmpDir, "deb", Arch, "DEBIAN", "control"), DebControl);
    fs.writeFileSync(path.resolve(CliOptions.tmpDir, "deb", "Dockerfile"), ([
      "FROM ghcr.io/sirherobrine23/javascript_releases_packages:nightly",
      `COPY ./${Arch}/ ./`,
      "RUN dpkg-deb --build --verbose . /tmp/Package.deb"
    ]).join("\n"));
    child_process.execFileSync("docker", ["buildx", "build", ".", "--output", path.resolve(CliOptions.tmpDir, "deb", Arch, "DockerImage")], {cwd: path.resolve(CliOptions.tmpDir, "deb"), stdio: CliOptions.verbose ? "inherit" : "ignore"});
    fs.copyFileSync(path.resolve(CliOptions.tmpDir, "deb", Arch, "DockerImage", "tmp/Package.deb"), path.resolve(CliOptions.outputDir, `deb_${Config.name}_${Config.version}_${Arch}.deb`));
    fs.rmSync(path.resolve(CliOptions.tmpDir, "deb", Arch, "DockerImage"), {recursive: true});
  }
}