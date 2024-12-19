/*
 * Copyright (c) 2020-2024 LG Electronics Inc.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

// filebrowser.js
// is simple service, based on low-level luna-bus API

// eslint-disable-next-line import/no-unresolved
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const fs = require('fs');
const path = require('path');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

const service = new Service(pkgInfo.name); // Create service by service name on package.json
const logHeader = "[" + pkgInfo.name + "]";

const userInfoPath = path.join(__dirname, "/user_info.json");
const userDirPath = path.join(__dirname, "/user_dir");

function maketoken(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

service.register("listFiles", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/listFiles");
    try {
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullPath = path.join(userDirPath, user.username, message.payload.path);
            fs.readdir(fullPath, "utf8", (err, files) => {
                if (err) throw err;
                message.respond({
                    success: true,
                    files: files.map((file) => {
                        const filepath = path.join(fullPath, file);
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
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullPath = path.join(userDirPath, user.username, message.payload.path);
            fs.readFile(fullPath, "utf8", (err, data) => {
                if (err) throw err;
                message.respond({
                    success: true,
                    content: data
                });
            });
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullPath = path.join(userDirPath, user.username, message.payload.path);
            fs.writeFile(fullPath, message.payload.content, "utf8", (err) => {
                if (err) throw err;
                message.respond({
                    success: true
                });
            });
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullPath = path.join(userDirPath, user.username, message.payload.path);
            fs.rm(fullPath, (err) => {
                if(err) throw err;
                message.respond({
                    success: true
                });
            });
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullOldPath = path.join(userDirPath, user.username, message.payload.oldpath);
            const fullNewPath = path.join(userDirPath, user.username, message.payload.newpath);
            fs.rename(fullOldPath, fullNewPath, (err) => {
                if(err) throw err;
                message.respond({
                    success: true
                });
            });
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const user = users.find(user => user.token === message.payload.token);
        if (user) {
            const fullPath = path.join(userDirPath, user.username, message.payload.path);
            fs.mkdir(fullPath, (err) => {
                if(err) throw err;
                message.respond({
                    success: true
                })
            })
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "PERMISSION_DENIED",
                    message: "Invalid token"
                }
            });
        }
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

service.register("login", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/login");
    try {
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const username = message.payload.username;
        const password = message.payload.password;
        const user = users.find(user => user.username === username);
        if (user) {
            if (user.password === password) {
                message.respond({
                    success: true,
                    token: user.token,
                    expiresIn: 3600
                });
            }
            else {
                message.respond({
                    success: false,
                    error: {
                        code: "UNKNOWN_ERROR",
                        message: "Login Error: Invalid user or password",
                    }
                });
            }
        }
        else {
            message.respond({
                success: false,
                error: {
                    code: "UNKNOWN_ERROR",
                    message: "Login Error: Invalid user or password",
                }
            });
        }
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

service.register("signup", function(message) {
    console.log(logHeader, "SERVICE_METHOD_CALLED:/signup");
    try {
        if (!fs.existsSync(userInfoPath)) {
            fs.writeFileSync(userInfoPath, "[]", "utf8");
        }
        const userInfoString = fs.readFileSync(userInfoPath, "utf8");
        const users = JSON.parse(userInfoString);
        const username = message.payload.username;
        const password = message.payload.password;
        const existingUser = users.find(user => user.username === username);
        if (existingUser) {
            message.respond({
                success: false,
                error: {
                    code: "UNKNOWN_ERROR",
                    message: "Signup Error: User already exists"
                }
            })
        }
        else {
            const token = maketoken(8);
            users.push({username: username, password: password, token: token});
            fs.mkdirSync(path.join(userDirPath, username), { recursive: true });
            fs.writeFile(userInfoPath, JSON.stringify(users), "utf8", (err) => {
                if (err) throw err;
                message.respond({
                    success: true
                });
            })
        }
    }
    catch (err) {
        console.log(err);
        message.respond({
            success: false,
            error: {
                code: "UNKNOWN_ERROR",
                message: err.name + ": " + err.message
            }
        })
    }
});