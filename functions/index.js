const admin = require('firebase-admin');
const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const XLSX = require('xlsx');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.firestore();

const getUsers = async () => {
  try {
    const users = db.collection('users');
    const marketableUsers = users.where('marketingConsent', '==', true);
    const finalUsers = await marketableUsers.get();
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push('Marketing');
    marketingSheet = [];
    marketingSheet.push(['Email', 'Source', 'Time']);
    finalUsers.docs.forEach(doc => {
      const timeCreated = new Date(doc.createTime.seconds * 1000);
      const data = doc.data();
      marketingSheet.push([data.email, data.sources[0], timeCreated.toLocaleString()])
    });
    const marketingWS = XLSX.utils.aoa_to_sheet(marketingSheet);
    wb.Sheets["Marketing"] = marketingWS;
    const storage = new Storage();
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const bucket = storage.bucket(functions.config().config.bucket);
    const file = bucket.file('marketing.xlsx');
    await file.save(buffer);
    const config = {
      version: 'v2',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    const [url] = await file.getSignedUrl(config);
    return url;
  } catch (error) {
    console.log(error);
  }
};

exports.marketing = functions.https.onCall((data, context) => {
  if (context.auth.token.admin === true) {
    return getUsers();
  }
  else {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be authenticated.');
  }
});

const getRaffle = async (id) => {
  try {
    const raffles = await db.collection('quiz').doc('web-client').collection('raffles').doc(id).collection('subscribers').get();
    const wb = XLSX.utils.book_new();
    wb.SheetNames.push("Raffle");
    raffleSheet = [];
    raffleSheet.push(['First Name', 'Last Name', 'Email', 'Winner']);
    raffles.docs.forEach(doc => {
      const data = doc.data();
      raffleSheet.push([data.firstName, data.lastName, data.email, data.winner || ""]);
    });
    const raffleWS = XLSX.utils.aoa_to_sheet(raffleSheet);
    wb.Sheets["Raffle"] = raffleWS;
    const storage = new Storage();
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const bucket = storage.bucket(functions.config().config.bucket);
    const file = bucket.file(`${id}.xlsx`);
    await file.save(buffer);
    const config = {
      version: 'v2',
      action: 'read',
      expires: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    };
    const [url] = await file.getSignedUrl(config);
    return url;
  } catch (error) {
    console.log(error);
  }
}

exports.raffle = functions.https.onCall((data, context) => {
  if (context.auth.token.admin === true) {
    try {
      return getRaffle(data.id);
    }
    catch (error) {
      console.log(error);
    }
  }
  else {
    throw new functions.https.HttpsError('failed-precondition', 'The function must be authenticated.');
  }
});
