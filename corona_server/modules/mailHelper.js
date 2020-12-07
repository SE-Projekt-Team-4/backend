var nodemailer = require('nodemailer');
var QRCode = require('qrcode');
var fs = require('fs');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.fg08mutterstadt@gmail.com',
        pass: 'FG=(MUTTERSTADT'
    }
});






QRCode.toDataURL('I am a pony!')
    .then(url => {
        return url;
    })
    .catch(err => {
        console.error(err)
    })
    .then(
        (img) => {

            fs.readFile('./mailTemplate.html', 'utf8' ,function (err, html) {
                if (err) {
                    throw err;
                }

                html = html.replace('#v1#', 'v1');
                html = html.replace('#v2#', 'v2');
                html = html.replace('#v3#', 'v3');
                html = html.replace('#v4#', 'v4');
                html = html.replace('#v5#', 'v5');
                html = html.replace('#v6#', 'v6');
                html = html.replace('#v7#', '<div> <img src="' + img + '" alt="QR-Code" title="QR-Code" style="display:block" width="200" height="200"> </div>');
                html = html.replace('#v8#', 'v8');


                var mailOptions = {
                    from: 'NoReply.FG08Mutterstadt@gmail.com',
                    to: 'melsteffen2000@gmail.com',
                    subject: 'Buchungsbestätigung FG 08 Mutterstadt',
                    attachDataUrls: true,
                    html: html // html body
                };


                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });


            });

        }
    )


