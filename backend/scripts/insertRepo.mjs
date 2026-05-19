import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.model.js';
import Repository from '../src/models/Repository.model.js';

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gitnest';

const username = process.argv[2] || 'karan';
const repoName = process.argv[3] || `demo-repo-${Date.now()}`;

async function run(){
  await mongoose.connect(MONGO);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ username: username.toLowerCase() });
  if(!user){
    console.log(`User ${username} not found — creating one.`);
    user = await User.create({
      username: username.toLowerCase(),
      email: `${username.toLowerCase()}@example.com`,
      password: 'Password123',
      avatarUrl: '',
      bio: 'Created by insert script',
      location: '',
    });
  } else {
    console.log(`Found user ${username} with id ${user._id}`);
  }

  // Ensure unique name per owner — append timestamp if collision
  let finalName = repoName;
  const exists = await Repository.findOne({ owner: user._id, name: finalName });
  if (exists) {
    finalName = `${finalName}-${Date.now()}`;
  }

  const repository = await Repository.create({
    name: finalName,
    owner: user._id,
    // schema currently restricts description via enum — use empty string to satisfy validation
    description: '',
    visibility: 'public',
    language: 'JavaScript',
    topics: ['test'],
  });

  console.log('Inserted repository:', repository.name);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
