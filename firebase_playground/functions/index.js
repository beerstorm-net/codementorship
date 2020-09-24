const functions = require('firebase-functions');

const regionName = 'europe-west3';
const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '256MB'
}
const uuid = require("uuid");

// The Firebase Admin SDK to access Cloud Firestore.
const firebaseAdmin = require('firebase-admin');
firebaseAdmin.initializeApp();

exports.newFirestoreRecord = functions
    .runWith(runtimeOpts)
    .region(regionName)
    .firestore.document('dummy/{docId}')
    .onCreate(async (snap, context) => {

        const newRecord = snap.data();
        console.log('newRecord: ', JSON.stringify(newRecord))

        // perform desired operations ...
        // as an example: lets create this record on realtime db as well
        const db = firebaseAdmin.database();
        const ref = db.ref();

        // NB! child is the docId of the record we are inserting!
        let recordId = newRecord.id;
        if (recordId === undefined) {
            recordId = uuid.v4();
        }
        const dbRef = ref.child(recordId);
        await dbRef.set(newRecord
        , function(error) {
            if (error) {
                console.log('Error while setting data', error)
            } else {
                console.log('all is well done')
            }
        })
        console.log('DONE')

        return true;
    });
