const mongoose = require('mongoose');
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.FIREBASE_CREDENTIALS))
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const User = mongoose.model('User', new mongoose.Schema({ firebaseUID: String }, { strict: false }));

async function deleteInactiveUsers() {
  try {
    console.log('Fetching active Firebase users...');
    const activeFirebaseUsers = await admin.auth().listUsers();
    const activeUIDs = activeFirebaseUsers.users.map(user => user.uid);

    console.log('Finding users in MongoDB not in Firebase...');
    const usersToDelete = await User.find({ firebaseUID: { $nin: activeUIDs } });

    if (usersToDelete.length === 0) {
      console.log('No orphaned users found.');
      return;
    }

    console.log(`Deleting ${usersToDelete.length} orphaned users...`);
    await User.deleteMany({ firebaseUID: { $nin: activeUIDs } });

    console.log('Orphaned users deleted successfully.');
  } catch (error) {
    console.error('Error cleaning up users:', error);
  } finally {
    mongoose.connection.close();
  }
}

deleteInactiveUsers();
