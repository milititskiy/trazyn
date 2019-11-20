import task = require('azure-pipelines-task-lib/task');
import path = require('path');
import nodemailer = require('nodemailer');
task.setResourcePath(path.join(__dirname, 'task.json'));
var fs = require('fs');
var shell = require('shelljs');
var cheerio = require("cheerio");

let attachment: string = task.getInput('Attachment');
let smtpString: string = task.getInput('SMTP');
let smtpPort: string = task.getInput('Port');
let reciever: string = task.getInput('To');
let sender: string = task.getInput('From');
let subject: string = task.getInput('Subject');
let text: string = task.getInput('Text');
//SMTP Shell + Newman Arguments
let cliShell: string = task.getInput('CLI');
let checkBox :string = task.getInput('CheckBox');
var check = Boolean(checkBox);
shell.exec("newman  "+cliShell.toString());

async function mailer() 
{
    let transport = nodemailer.createTransport({
        host: smtpString,
        secure: false,
        port: parseInt(smtpPort),
        ignoreTLS: true,
        tls: {
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
async function run() 
{
    var testFolder = attachment;
    
   
    fs.readFile(testFolder, { encoding: 'utf-8' }, function read(err: any, html: any) {
        if (err) {
            buildResultTaskFailed(err);
            throw err;
        }
        if (!html) {
            console.log('Report Does Not Exist');
            buildResultTaskFailed('Report Does Not Exist');
            throw new Error;
        } else {
            console.log("Report Is Present");
            var $ = cheerio.load(html);
            var items: any[] = [];
            $(".row").children().each(function (i: number, e: any) {
                items[i] = $(e).text();
                
            });
            var sum: number = 0;
            //check the columns that represent amount of errors
            var arr = [13,16,19,22,25];
            arr.forEach(function (value) {
                var num = parseInt(items[value]);
                sum += num;
                
            });
            
            
            if(check){
                if (sum > 0) {
                    mailer();
                }
            }
            if(!check){
                mailer();
            }
            
        }
    })
}
async function buildResultTaskFailed(message:string)
{
    task.setResult(task.TaskResult.Failed,message);
}
run();