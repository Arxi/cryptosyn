var admin = require('firebase-admin');
var serviceAccount = require("./service-account-private-key.json");

const setClaims = async (userId) => {
    console.log(`--- Setting admin = true for user ${userId}`);
    await admin.auth().setCustomUserClaims(userId, {admin: true});
    console.log(`--- Custom claims set!`);
    console.log(` `);

    // Lookup the user associated with the specified uid.
    await admin.auth().getUser(userId).then((userRecord) => {
        // The claims can be accessed on the user record.
        console.log(userRecord);
        console.log(` `);
        console.log(`--- Admin claim: ${userRecord.customClaims.admin}`);
    });
}

// get user ID here:
// https://console.firebase.google.com/u/0/project/cryptosyn/authentication/users
const userId = process.argv[2];

if (!userId) {
    console.log(`--- Please provide User UID as the argument. Get it here:`);
    console.log(`https://console.firebase.google.com/u/0/project/cryptosyn/authentication/users`);
} else {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });

    setClaims(userId);
}



