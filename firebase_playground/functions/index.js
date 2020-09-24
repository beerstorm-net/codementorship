const functions = require('firebase-functions');

const regionName = 'europe-west3';
const runtimeOpts = {
    timeoutSeconds: 300,
    memory: '256MB'
}

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
        const ref = db.ref("https://codementorship.firebaseio.com/");
        const dbRef = ref.child("codementorship");
        await dbRef.set({
            docId: newRecord
        })

        return true;
    });
