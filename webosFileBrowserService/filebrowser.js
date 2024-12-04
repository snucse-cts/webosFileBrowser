/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// helloworld_webos_service.js
// is simple service, based on low-level luna-bus API

// eslint-disable-next-line import/no-unresolved
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const fs = require('fs');
const path = require('path');

const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

service.register("listFiles", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/listFiles");
    try {
        fs.readdir(message.payload.path, "utf8", (err, files) => {
            if (err) throw err;
            message.respond({
                success: true,
                files: files.map((file) => {
                    const filepath = path.join(message.payload.path, file);
                    const stats = fs.statSync(filepath)
                    if (stats.isDirectory()) {
                        return {
                            name: file,
                            type: "directory"
                        };
                    }
                    else {
                        return {
                            name: file,
                            type: "file",
                            size: stats.size
                        };
                    }
                })
            });
        });
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});

service.register("readFile", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/readFile");
    try {
        fs.readFile(message.payload.path, "utf8", (err, data) => {
            if (err) throw err;
            message.respond({
                success: true,
                content: data
            });
        });
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});

service.register("writeFile", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/writeFile");
    try {
        fs.writeFile(message.payload.path, message.payload.content, "utf8", (err) => {
            if (err) throw err;
            message.respond({
                success: true
            });
        });
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});

service.register("deleteFile", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/deleteFile");
    try {
        fs.rm(message.payload.path, (err) => {
            if(err) throw err;
            message.respond({
                success: true
            });
        });
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});

service.register("renameFile", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/renameFile");
    try {
        fs.rename(message.payload.oldpath, message.payload.newpath, (err) => {
            if(err) throw err;
            message.respond({
                success: true
            });
        });
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});

service.register("createDirectory", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/createDirectory");
    try {
        fs.mkdir(message.payload.path, (err) => {
            if(err) throw err;
            message.respond({
                success: true
            })
        })
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        });
    }
});