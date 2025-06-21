[![Apache License, Version 2.0, January 2004](https://img.shields.io/github/license/apache/maven.svg?label=License)][license]
[![build workflow](https://github.com/elomagic/elo-agent/actions/workflows/build.yml/badge.svg)](https://github.com/elomagic/elo-agent/actions)
[![Latest](https://img.shields.io/github/release/elomagic/elo-agent.svg)](https://github.com/elomagic/elo-agent/releases)
![GitHub stars](https://img.shields.io/github/stars/elomagic/elo-agent?color=fa6470)
[![GitHub issues](https://img.shields.io/github/issues/elomagic/elo-agent?color=d8b22d)](https://github.com/elomagic/elo-agent/issues)
[![Required Node.JS >= 22.12.0 || >=22.99.0](https://img.shields.io/static/v1?label=node&message=22.12.0%20||%20%3E=22.99.0&logo=node.js&color=3f893e)](https://nodejs.org/about/releases)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/elomagic/elo-agent/graphs/commit-activity)
[![Buymeacoffee](https://badgen.net/badge/icon/buymeacoffee?icon=buymeacoffee&label)](https://www.buymeacoffee.com/elomagic)

![](/doc/header.png "Logo")

## 👀 Overview

The frontend tool for identifying (un-)used JAR libraries. 

## 🚀 Features

* Find unused JAR libraries in your project
* Identify multiple versions of same libraries of the same project

## 📸 Screenshots

![](/doc/screenshot-01.png "Screenshot")
 

---

## ❔ FAQ

### Meaning of the columns in the table

| Column          | Meaning                                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------------------|
| `In Use`        | Indicates whether the JAR library is loaded by the Java Runtime or not. If not, this would be a candidate for removal. |
| `Overloaded`    | tbd                                                                                                                    |
| `Elapsed Time` | The time in milliseconds after the Java Runtime Environment was started that the JAR file was loaded.                  |
| `Filename`      | Name of the JAR file                                                                                                   |    
| `POM`           | Checked if at least one POM properties file was found in the JAR                                                       |
| `File`          | Full qualified path of the JAR file                                                                                    |    


- [C/C++ addons, Node.js modules - Pre-Bundling](https://github.com/electron-vite/vite-plugin-electron-renderer#dependency-pre-bundling)
- [dependencies vs devDependencies](https://github.com/electron-vite/vite-plugin-electron-renderer#dependencies-vs-devdependencies)


## 🛫 Quick Setup

```sh
# clone the project
git clone https://github.com/elomagic/elo-agent.git

# enter the project directory
cd elo-agent

# install dependency
npm install

# develop
npm run dev
```

## 📂 Directory structure

Familiar React application structure, just with `electron` folder on the top :wink:  
*Files in this folder will be separated from your React application and built into `dist-electron`*  

```tree
├── electron                                 Electron-related code
│   ├── main                                 Main-process source code
│   └── preload                              Preload-scripts source code
│
├── release                                  Generated after production build, contains executables
│   └── {version}
│       ├── {os}-{os_arch}                   Contains unpacked application executable
│       └── {app_name}_{version}.{ext}       Installer for the application
│
├── public                                   Static assets
└── src                                      Renderer source code, your React application
```

<!--
## 🚨 Be aware

This template integrates Node.js API to the renderer process by default. If you want to follow **Electron Security Concerns** you might want to disable this feature. You will have to expose needed API by yourself.  

To get started, remove the option as shown below. This will [modify the Vite configuration and disable this feature](https://github.com/electron-vite/vite-plugin-electron-renderer#config-presets-opinionated).

```diff
# vite.config.ts

export default {
  plugins: [
    ...
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
    ...
  ],
}
```
-->

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](../../issues/new).

### Versioning

Versioning follows the semantic of [Semantic Versioning 2.0.0](https://semver.org/)

## License

The Elo Agent tool is distributed under [Apache License, Version 2.0][license]

## Donations

Donations will ensure the following:

* 🔨 Long term maintenance of the project
* 🛣 Progress on the roadmap
* 🐛 Quick responses to bug reports and help requests

[license]: https://www.apache.org/licenses/LICENSE-2.0
