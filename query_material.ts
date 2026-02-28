import mongoose from 'mongoose';
import connectMongo from './lib/mongoose';
import Material from './lib/models/Material';

const run = async () => {
  await connectMongo();
  const mat = await Material.findOne({ materialId: 'gr5Z__NN2J' }).lean();
  console.log('Material:', mat);
  await mongoose.disconnect();
};
run();
