require('dotenv').config();
const mongoose = require('mongoose');

async function rebuildEmailIndex() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    console.log('\n Current indexes:');
    const indexes = await usersCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)} - ${JSON.stringify(index)}`);
    });

    console.log('\n  Dropping old email indexes...');
    try {
      await usersCollection.dropIndex('email_1');
      console.log('Dropped email_1 index');
    } catch (err) {
      console.log('ℹemail_1 index not found (already dropped or never existed)');
    }

    try {
      await usersCollection.dropIndex({ email: 1 });
      console.log('Dropped { email: 1 } index');
    } catch (err) {
      console.log('ℹNo other email index found');
    }

    console.log('\nCleaning up empty email values...');
    const cleanResult = await usersCollection.updateMany(
      { 
        $or: [
          { email: '' },
          { email: null }
        ]
      },
      { 
        $unset: { email: '' }
      }
    );
    console.log(`Cleaned ${cleanResult.modifiedCount} documents`);

    console.log('\n👥 Current users in database:');
    const users = await usersCollection.find({}).project({ 
      username: 1, 
      email: 1, 
      role: 1,
      _id: 1 
    }).toArray();
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.username} | email: ${user.email || 'undefined'} | role: ${user.role}`);
    });

    console.log('\n Creating new sparse unique index for email...');
    await usersCollection.createIndex(
      { email: 1 },
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { 
          email: { $exists: true, $type: 'string', $ne: '' }
        }
      }
    );
    console.log('Created new sparse unique index');

    console.log('\nUpdated indexes:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach((index, i) => {
      console.log(`${i + 1}. ${JSON.stringify(index.key)}`);
      if (index.key.email) {
        console.log(`   - unique: ${index.unique}`);
        console.log(`   - sparse: ${index.sparse}`);
        console.log(`   - partialFilterExpression: ${JSON.stringify(index.partialFilterExpression)}`);
      }
    });

    console.log('\nEmail index rebuilt successfully!');
    console.log('\nSummary:');
    console.log('   - Old indexes dropped');
    console.log('   - Empty emails cleaned up');
    console.log('   - New sparse unique index created');
    console.log('   - Multiple users can now have no email (undefined)');
    console.log('   - Users with emails must have unique emails');

  } catch (error) {
    console.error('\nError:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

console.log('Starting email index rebuild...\n');
rebuildEmailIndex();