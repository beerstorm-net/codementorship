const functions = require('firebase-functions');

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


      // ... using moment.js ...
      const prevMonth = moment().clone().subtract(1, 'months');
      // First day of the previous month
      const startPrevMonth = prevMonth.startOf('month').toDate();
      // Last day of the previous month
      const endPrevMonth = prevMonth.endOf('month').toDate();
      // const end = moment().startOf('month').subtract(1, 'days');
      console.log('startPrevMonth', startPrevMonth, 'endPrevMonth', endPrevMonth);

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