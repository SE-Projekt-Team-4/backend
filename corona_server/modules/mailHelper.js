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


const a_placeholders = [
    '#f_name#',
    '#l_name#',
    '#opponent#',
    '#date#',
    '#verificationCode#',
    '#QRCode#',
    '#today#',
    '#link_homepage#',
    '#link_match#'
];

const s_linkHome = 'https://.............................TODO'
const s_linkBaseMatch = 'https://.......TODO'


async function f_sendMailFromTemplate(fName, lName, matchId, opponent, matchDate, verificationCode, eMail) {
    const s_QRCodeDataUrl = await QRCode.toDataURL(verificationCode);
    const s_QRCodeHTML = '<div> <img src="' + s_QRCodeDataUrl + '" alt="QR-Code" title="QR-Code" style="display:block" width="200" height="200"> </div>'
    let s_html = await f_getMailTemplate();

    const o_dateFormat = { year: 'numeric', month: 'numeric', day: 'numeric' };
    const s_dateNow = new Date(Date.now()).toLocaleDateString('de-DE', o_dateFormat);

    s_html = s_html.replace(a_placeholders[0], fName);
    s_html = s_html.replace(a_placeholders[1], lName);
    s_html = s_html.replace(a_placeholders[2], opponent);
    s_html = s_html.replace(a_placeholders[3], matchDate.substring(0, 10));
    s_html = s_html.replace(a_placeholders[4], verificationCode);
    s_html = s_html.replace(a_placeholders[5], s_QRCodeHTML);
    s_html = s_html.replace(a_placeholders[6], s_dateNow);
    s_html = s_html.replace(a_placeholders[7], s_linkHome);
    s_html = s_html.replace(a_placeholders[8], s_linkBaseMatch + matchId);

    const mailOptions = {
        from: 'NoReply.FG08Mutterstadt@gmail.com',
        to: eMail,
        subject: 'Buchungsbestätigung FG 08 Mutterstadt - ' + matchDate.substring(0, 10),
        attachDataUrls: true,
        html: s_html // html body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            throw(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    return true;
}

function f_getMailTemplate() {
    return new Promise(
        (resolve, reject) => {
            fs.readFile('./mailTemplate.html', 'utf8',
                function (err, html) {
                    if (err) {
                        reject(err);
                    }
                    resolve(html);
                });
        });
}

module.exports.sendConfirmationMail = f_sendMailFromTemplate;


