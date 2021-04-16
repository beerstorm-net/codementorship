const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const mgTransport = require('nodemailer-mailgun-transport');

const regionName = 'europe-west3';
const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '256MB'
}
const uuid = require("uuid");
const moment = require('moment');

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp();

const redirectUrl = "https://codementorship.web.app";
let actionCodeSettings = {
  // URL you want to redirect back to. The domain (www.example.com) for
  // this URL must be whitelisted in the Firebase Console.
  //url: 'https://codementorship.web.app',
  // This must be true for email link sign-in.
  handleCodeInApp: false,
  /*iOS: {
    bundleId: 'com.example.ios'
  },
  android: {
    packageName: 'com.example.android',
    installApp: true,
    minimumVersion: '12'
  },
  // FDL custom domain.
  dynamicLinkDomain: 'coolapp.page.link'
  */
};
const emailFrom = functions.config().app.email_sender;
// This is your API key that you retrieve from www.mailgun.com/cp (free up to 10K monthly emails)
const mailgunAuth = {
  auth: {
    api_key: functions.config().app.mailgun_apikey,
    domain: functions.config().app.mailgun_domain
    //domain: 'one of your domain names listed at your https://mailgun.com/app/domains'
  }
  //host: 'api.eu.mailgun.net' // e.g. for EU region
}
const mailgunNodemailer = nodemailer.createTransport(mgTransport(mailgunAuth));
/*const emailTransporter = nodemailer.createTransport({
  //host: 'smtp.gmail.com',
  //port: 465,
  //secure: true,
  //service: 'gmail',
  //auth: {
  //  user: emailFrom,
  //  pass: functions.config().app_email_sender_pwd
  //}*
  //service: 'SendGrid',
  auth: {
    user: functions.config().app.sendgrid_username,
    pass: functions.config().app.sendgrid_password,
  }
});*/
/*function sendEmailValidation(emailTo, emailLink) {
  console.log('emailFrom', emailFrom, 'emailTo', emailTo);

  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    subject: 'Please verify your email address',
    html: `<h1>Email address verification</h1>
     <p> <b>Email: </b>${emailTo} </p>
     <p> <b>Click this link to verify:</b>${emailLink} </p>`
  };

  return emailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('ERROR while emailing Verification link', error)
      return
    } else {
      console.log('OK Verification link sent via email!', info.response);
    }

    return true;
  });
}*/
function sendEmailValidation(emailTo, emailLink) {
  console.log('emailFrom', emailFrom, 'emailTo', emailTo);

  const mailOptions = {
    from: emailFrom,
    to: emailTo,
    subject: 'Please verify your email address',
    template: 'verify_email',
    'h:X-Mailgun-Variables': JSON.stringify({email_link: emailLink})
  };

  return mailgunNodemailer.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('ERROR while emailing Verification link', JSON.stringify(error))
      return
    } else {
      console.log('OK Verification link sent via email!', info.response);
    }

    return true;
  });
}

// new user requires email validation
exports.newUserRequiresEmailValidation = functions
  .runWith(runtimeOpts)
  .region(regionName)
  .firestore.document('users/{refId}')
  .onWrite(async (snap, context) => {

    const userRecord = snap.after.data();
    const refId = context.params.refId;
    if (userRecord === undefined) {
      console.log('userRecord doesNOT exist! maybe already deleted');
      return true;
    }
    console.log('new userRecord: ', refId, JSON.stringify(userRecord));
    if (userRecord['email'] === undefined) {
      console.log('userRecord doesNOT contain email!');
      return true;
    } else if (userRecord['emailVerified'] === true) {
      console.log('userRecord email already verified!', userRecord['email']);
      return true;
    } else if (userRecord['emailVerificationSentAt'] !== undefined) {
      console.log('verification link already sent!');
      return true;
    }
    console.log('userRecord email requires verification, lets begin!', userRecord['email']);

    // Admin SDK API to generate the sign in with email link.
    actionCodeSettings.url = redirectUrl + "?refId="+refId;
    const emailLink = await firebaseAdmin.auth().generateSignInWithEmailLink(userRecord['email'], actionCodeSettings);
    if (emailLink !== undefined && emailLink.startsWith('https://')) {

      // Construct sign-in with email link template, embed the link and send using custom SMTP server.
      await sendEmailValidation(userRecord['email'], emailLink);

      // update collection with link status
      await firebaseAdmin
        .firestore()
        .collection('users')
        .doc(refId)
        .set({
          'emailVerificationSentAt': firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          'emailVerification': emailLink
        }, {merge: true});

    } else {
      // Some error occurred.
      console.log('ERROR generateSignInWithEmailLink', error);
    }
    /*
    firebaseAdmin.auth().generateSignInWithEmailLink(userRecord['email'], actionCodeSettings)
      .then(async (link) => {
        console.log('OK generateSignInWithEmailLink', link);

        // update collection with link status
        await firebaseAdmin
          .firestore()
          .collection('users')
          .doc(refId)
          .set({
            'emailVerificationSentAt': firebaseAdmin.firestore.FieldValue.serverTimestamp(),
            'emailVerification': link
          }, {merge: true});

        // Construct sign-in with email link template, embed the link and send using custom SMTP server.
        // FIXME return sendSignInEmail(usremail, displayName, link);
        return true;
      })
      .catch((error) => {
        // Some error occurred.
        console.log('ERROR generateSignInWithEmailLink', error);
      });
    */

    return true;
  });

// trigger on newFirestoreRecord
exports.newFirestoreRecord = functions
    .runWith(runtimeOpts)
    .region(regionName)
    .firestore.document('codementorship/{docId}')
    .onCreate(async (snap, context) => {

        const firestoreRecord = snap.data();
        console.log('newFireStoreRecord: ', snap.id, JSON.stringify(firestoreRecord))

        // perform desired operations ...
        // as an example: lets create this record on realtime db as well
        const db = firebaseAdmin.database();
        const ref = db.ref();

        // NB! child is the docId of the record we are inserting!
        let recordId = snap.id;
        if (recordId === undefined) {
            recordId = uuid.v4();
        }
        const dbRef = ref.child(recordId);
        // here, optionally, you can pick and store only
        await dbRef.set(firestoreRecord
        , function(error) {
            if (error) {
                console.log('Error while setting data', error)
            } else {
                console.log('all is well done')
            }
        })
        console.log('DONE')

      /*
      // ... example using moment.js ...
      const prevMonth = moment().clone().subtract(1, 'months');
      // First day of the previous month
      const startPrevMonth = prevMonth.startOf('month').toDate();
      // Last day of the previous month
      const endPrevMonth = prevMonth.endOf('month').toDate();
      // const end = moment().startOf('month').subtract(1, 'days');
      console.log('startPrevMonth', startPrevMonth, 'endPrevMonth', endPrevMonth);
      */

        return true;
    });

// trigger on newDbRecord
exports.newDbRecord = functions
    .runWith(runtimeOpts)
    .region(regionName)
    .database.ref('/codementorship/{recordId}')
    .onCreate(async (snap, context) => {

        const dbRecord = snap.val();
        console.log('newDbRecord: ', context.params.recordId, dbRecord);

        let firestoreRecord = {};
        firestoreRecord.id = context.params.recordId;
        if (firestoreRecord.id === undefined) {
            firestoreRecord.id = uuid.v4();
        }
        firestoreRecord.dbData = dbRecord.toJSON();

        await firebaseAdmin
            .firestore()
            .collection('codementorship_copy')
            .add(firestoreRecord);

        return true;
    });