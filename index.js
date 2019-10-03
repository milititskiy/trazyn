"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var task = require("azure-pipelines-task-lib/task");
var path = require("path");
var nodemailer = require("nodemailer");
task.setResourcePath(path.join(__dirname, 'task.json'));
var fs = require('fs');
var shell = require('shelljs');
var cheerio = require("cheerio");
var attachment = task.getInput('Attachment');
var smtpString = task.getInput('SMTP');
var smtpPort = task.getInput('Port');
var reciever = task.getInput('To');
var sender = task.getInput('From');
var subject = task.getInput('Subject');
var text = task.getInput('Text');
//SMTP Shell + Newman Arguments
var cliShell = task.getInput('CLI');
var checkBox = task.getInput('CheckBox');
var check = Boolean(checkBox);
shell.exec("newman  " + cliShell.toString());
//console.log("the CLI " +cliShell.toString());
function mailer() {
    return __awaiter(this, void 0, void 0, function () {
        var transport, message;
        return __generator(this, function (_a) {
            transport = nodemailer.createTransport({
                host: smtpString,
                secure: false,
                port: parseInt(smtpPort),
                ignoreTLS: true,
                tls: {
                    rejectUnauthorized: false
                }
            });
            message = {
                from: sender,
                to: reciever,
                subject: subject,
                text: text,
                attachments: [
                    {
                        filename: 'Report.html',
                        path: attachment.toString()
                    }
                ]
            };
            transport.sendMail(message, function (error, info) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log('Report Was Sent');
                }
            });
            return [2 /*return*/];
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var testFolder;
        return __generator(this, function (_a) {
            testFolder = attachment;
            //console.log('testFolder', testFolder);
            fs.readFile(testFolder, { encoding: 'utf-8' }, function read(err, html) {
                if (err) {
                    buildResultTaskFailed(err);
                    throw err;
                }
                if (!html) {
                    console.log('Report Does Not Exist');
                    buildResultTaskFailed('Report Does Not Exist');
                    throw new Error;
                }
                else {
                    console.log("Report Is Present");
                    var $ = cheerio.load(html);
                    var items = [];
                    $(".row").children().each(function (i, e) {
                        items[i] = $(e).text();
                    });
                    var sum = 0;
                    //var arr = [12, 15, 18, 21, 24];
                    var arr = [13, 16, 19, 22, 25];
                    arr.forEach(function (value) {
                        var num = parseInt(items[value]);
                        sum += num;
                    });
                    if (check) {
                        if (sum > 0) {
                            mailer();
                        }
                    }
                    if (!check) {
                        mailer();
                    }
                }
            });
            return [2 /*return*/];
        });
    });
}
function buildResultTaskFailed(message) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            task.setResult(task.TaskResult.Failed, message);
            return [2 /*return*/];
        });
    });
}
run();
