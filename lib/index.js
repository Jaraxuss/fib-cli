#!/usr/bin/env node

/**
 * Module dependencies.
 */

const program = require('commander');
const fs = require('fs');
const packageJson = require('../package.json');
const version = packageJson.version;
const cwd = process.cwd();
const readline = require('readline')
const rl = readline.createInterface(process.stdin, process.stdout);
const template_model_path = __dirname.replace('lib', '') + 'src/template_model.js';

let modelName = 'TestModel';
let appName = 'myFibApp';

function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function createModel(path, name) {
    let upperName = capitalizeFirstLetter(name);
    let lowerName = lowerFirstLetter(name);
    let realPath = `${path}/${lowerName}.js`;

    fs.readFile(template_model_path, (err, data) => {
        if (err) throw err;
        let fileString = data.toString();
        let regex = new RegExp(modelName, 'g');
        fileString = fileString.replace(regex, upperName);
        // console.log('fileString', fileString);
        fileString = fileString.replace('testModel', lowerName);
        // console.log('fileString', fileString);
        fs.writeFile(`${realPath}`, fileString, function () {
            console.log(`  - Create model: ${upperName} at (${realPath})`);
        });
    });
}

program
    .version(`${version}`, '-v, --version')
    .option(`-n, --newmodel [name]', Create model: [${modelName}] at (${cwd})`, `${modelName}`)
    .option(`-i, --init [name]', Create fib-app: [${appName}] at (${cwd})`, `${appName}`)
    .parse(process.argv);

if (program.newmodel) {
    console.log(`This utility will walk you through creating a [model].js file based on fib-orm.\n`);
    console.log(`Press ^C at any time to quit.`);
    rl.question(`model name: (${modelName}) `, function (answer) {
        rl.close();
        if (answer.length) {
            createModel(cwd, answer);
        } else {
            createModel(cwd, modelName);
        }
    });
}

if (program.init) {
    console.log('Under development...');
    console.log(`Press ^C at any time to quit.`);
}