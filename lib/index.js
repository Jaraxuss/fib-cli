#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const fs = require('fs');
const Path = require('path');
const ncp = require('ncp').ncp;
const packageJson = require('../package.json');
const version = packageJson.version;
const cwd = process.cwd();
const readline = require('readline')
const rl = readline.createInterface(process.stdin, process.stdout);
const template_model_path = __dirname + '/../src/templates/model.js';
const template_sdk_path = __dirname + '/../src/templates/sdk.js';
const template_testcase_path = __dirname + '/../src/templates/testcase.js';
const project_path = __dirname + '/../src/project';

let tempModelName = 'TestModel';
let tempAppName = 'MyFibApp';

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function replaceModelName(modelName, data) {
    let lowerModelName = lowerFirstLetter(tempModelName);
    let upperName = capitalizeFirstLetter(modelName);
    let lowerName = lowerFirstLetter(modelName);

    let regex = new RegExp(tempModelName, 'g');
    data = data.replace(regex, upperName);
    regex = new RegExp(lowerModelName, 'g');
    data = data.replace(regex, lowerName);

    return data;
}

function createModel(path, name) {
    let lowerName = lowerFirstLetter(name);
    let realPath = `${path}/${lowerName}.js`;

    fs.readFile(template_model_path, (err, data) => {
        if (err) throw err;
        let fileString = data.toString();
        fileString = replaceModelName(name, fileString);

        fs.writeFile(`${realPath}`, fileString, function () {
            console.log(`  - Create model: ${lowerName} at (${realPath})`);
            let dstSdkPath = Path.join(path, `../test/sdk/${lowerName}.js`);

            fs.readFile(template_sdk_path, (err, data) => {
                if (err) throw err;

                fileString = data.toString();
                fileString = replaceModelName(name, fileString);
                fs.writeFile(dstSdkPath, fileString, () => {
                    console.log(`  - Create sdk: ${lowerName} at (${dstSdkPath})`);

                    let dstTestCasePath = Path.join(path, `../test/case/${lowerName}.js`);
                    fs.readFile(template_testcase_path, (err, data) => {
                        if (err) throw err;

                        fileString = data.toString();
                        fileString = replaceModelName(name, fileString);
                        fs.writeFile(dstTestCasePath, fileString, () => {
                            console.log(`  - Create test case: ${lowerName} at (${dstTestCasePath})`);
                        });
                    })
                });
            });
        });
    });
}

function createProject(path, name) {
    let upperName = capitalizeFirstLetter(name);
    let realPath = `${path}/${upperName}`;

    ncp(project_path, realPath, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log(`  - Create project: ${upperName} at (${realPath})`);
        // todo change file name
    });
}

program
    .version(`${version}`, '-v, --version')
    .option(`-i, --init [name]', Create fib-app: [${tempAppName}] at (${cwd})`, `${tempAppName}`)
    .option(`-n, --newmodel [name]', Create model: [${tempModelName}] at (${cwd})`, `${tempModelName}`)
    .parse(process.argv);

if (program.newmodel) {
    console.log(`This utility will walk you through creating a model file based on fib-orm.\n`);
    console.log(`Press ^C at any time to quit.`);
    rl.question(`model name: (${tempModelName}) `, function (answer) {
        rl.close();
        if (answer.length) {
            createModel(cwd, answer);
        } else {
            createModel(cwd, tempModelName);
        }
    });
}

if (program.init) {
    console.log(`This utility will walk you through creating a basic project based on fib-app.\n`);
    console.log(`Press ^C at any time to quit.`);
    rl.question(`project name: (${tempAppName}) `, function (answer) {
        rl.close();
        if (answer.length) {
            createProject(cwd, answer);
        } else {
            createProject(cwd, tempAppName);
        }
    });
}