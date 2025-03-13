jest.mock('../../src/config/db', () => require('./db'));
const { connectDB, disconnectDB, mongoose } = require('../../src/config/db');

beforeAll(async () => {
    console.log('beforeAll')
    if (mongoose.connection.readyState !== 0)
        await connectDB();
});

afterAll(async () => {
    await disconnectDB();
});

beforeEach(async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

module.exports = { mongoose }