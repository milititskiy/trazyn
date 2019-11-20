
import task = require('azure-pipelines-task-lib');
import path = require('path');
import nodemailer = require('nodemailer');
task.setResourcePath(path.join(__dirname, 'task.json'));
var fs = require('fs');
var shell = require('shelljs');


let attachment: string = task.getInput('Attachment');
let smtpString: string = task.getInput('SMTP');
let smtpPort: string = task.getInput('Port');
let reciever: string = task.getInput('To');
let sender: string = task.getInput('From');
let subject: string = task.getInput('Subject');
let text: string = task.getInput('Text');
let cliShell: string = task.getInput('CLI');
let checkBox: string = task.getInput('CheckBox');
var check = Boolean(checkBox);

shell.exec('newman  ' + cliShell.toString() + ' --reporter-json-export ');

let buildName = task.getVariable('build.buildNumber');
console.log('Build Name', buildName);
let TotalFailedTests;
async function sendMail() {
    let transport = nodemailer.createTransport({
        host: smtpString,
        secure: false,
        port: parseInt(smtpPort),
        ignoreTLS: true,
        tls:
        {
            rejectUnauthorized: false
        }
    });
    const message = {
        from: sender, // Sender address
        to: reciever,        // List of recipients
        subject: subject,  // Subject theme
        text: text, // Plain text body
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
        } else {
            console.log('Report Was Sent');
        }
    });
}

async function run() {
    //console.log("json check");
    var jsonFolder = task.cwd() + '\\newman';
    //console.log('jsonFolder',jsonFolder);
    
    fs.readdir(jsonFolder, 'utf-8', function read(err: any, files: any)  {
        
        files.forEach((file: string) => {
           // console.log(file);
            fs.readFile(path.join(jsonFolder, file), (err: any, data: string) => {
                if (err) throw err;
                let parsed = JSON.parse(data).run.stats;
                //console.log(parsed);
                var sum: number = 0;
                Object.keys(parsed).forEach(function (key) {
                    var val = parsed[key]['failed'];
                    
                    sum += val;

                })
                //console.log(sum);
                if (checkBox == 'true') {
                    console.log(checkBox);
                    if (sum > 0) {
                        sendMail();
                    }
                    
                    


                }
                if (checkBox == 'false') {
                    console.log(checkBox);
                    sendMail();
                }
            })
        });
    });

    


}





async function buildResultTaskFailed(message: string) {
    task.setResult(task.TaskResult.Failed, message);
    
}






run();