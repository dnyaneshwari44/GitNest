import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.model.js';

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gitnest';

async function run(){
  await mongoose.connect(MONGO);
  console.log('Connected to MongoDB');

  const username = process.argv[2] || 'karan';
  const followerName = process.argv[3] || 'follower1';

  const update = {
    avatarUrl: 'https://i.pravatar.cc/150?u=karan',
    bio: 'Full-stack developer and student',
    location: 'City, Country',
  };

  const user = await User.findOneAndUpdate({ username }, { $set: update }, { new: true });
  if (!user) {
    console.log('User not found, creating...');
    const created = await User.create({ username, email: `${username}@example.com`, password: 'Password123', ...update });
    console.log('Created user:', created.username);
  } else {
    console.log('Updated user:', user.username);
  }

  // ensure follower exists
  let follower = await User.findOne({ username: followerName });
  if (!follower) {
    follower = await User.create({ username: followerName, email: `${followerName}@example.com`, password: 'Password123' });
    console.log('Created follower:', follower.username);
  }

  // add follower relationship
  await User.updateOne({ username }, { $addToSet: { followers: follower._id } });
  await User.updateOne({ _id: follower._id }, { $addToSet: { following: (await User.findOne({ username }))._id } });

  const updated = await User.findOne({ username }).lean();
  console.log('Final user document:');
  console.log(JSON.stringify(updated, null, 2));

  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
