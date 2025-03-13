const mockDelFunction = jest.fn();
jest.mock('openai', () => {
    return {
        OpenAI: jest.fn().mockImplementation(() => ({
            beta: {
                threads: {
                    del: mockDelFunction,
                },
            },
        })),
    };
});


const request = require('supertest');
const app = require('../../app');
const MngThread = require('../../src/models/threadSchema');
const { disconnectDB } = require('./db');
require('./setup');


describe('Thread Routes', () => {

    describe('Get /threads ', () => {
        beforeEach(async () => {
            const testThreads = [
                {
                    "thread_id": "thread_4QNozAkaaOX6ekPfOMJzbQiN",
                    "created_at": "1738485019",
                    "title": "javascript method example"
                },
                {
                    "thread_id": "thread_t5wFRdrTdv6EuooQHGaCoRT1",
                    "created_at": 1738766064,
                    "title": "can you tell me a joke"
                }
            ];
            await MngThread.insertMany(testThreads);
        });

        it('Should return all threads', async () => {
            const res = await request(app).get('/threads');
            console.log(res.body);
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

    });

    describe('Put /threads/update-title', () => {

        beforeEach(async () => {
            const thread = {
                "thread_id": "thread_4QNozAkaaOX6ekPfOMJzbQiN",
                "created_at": "1738485019",
                "title": "thread title"
            };
            await MngThread.insertOne(thread);
        });

        it('should update thread title', async () => {
            const resp = await request(app).put('/threads/update-title').send({ thread_id: 'thread_4QNozAkaaOX6ekPfOMJzbQiN', title: 'new title' });
            expect(resp.statusCode).toBe(200);
            expect(resp.body).toHaveProperty('message', 'Thread title updated successfully');
        });

        it('should return 400 if thread_id or title is missing', async () => {
            const respNoTitle = await request(app).put('/threads/update-title').send({ thread_id: 'any_id' });
            expect(respNoTitle.statusCode).toBe(400);
            expect(respNoTitle.body).toHaveProperty('error', 'Thread ID and title are required');
            const respNoId = await request(app).put('/threads/update-title').send({ title: 'new title' });
            expect(respNoId.statusCode).toBe(400);
            expect(respNoId.body).toHaveProperty('error', 'Thread ID and title are required');
        });

        it('should return 404 for non-existent thread', async () => {
            const respNoTitle = await request(app).put('/threads/update-title').send({ thread_id: 'not_exist_thread_id', title: 'new title' });
            expect(respNoTitle.statusCode).toBe(404);
            expect(respNoTitle.body).toHaveProperty('error', 'Thread not found');
        });

        it('should return 500 if an error occurs during update', async () => {

            await disconnectDB();
            const resp = await request(app)
                .put('/threads/update-title')
                .send({ thread_id: 'thread_4QNozAkaaOX6ekPfOMJzbQiN', title: 'new title' });

            expect(resp.statusCode).toBe(500);
            expect(resp.body.error).toContain('Failed to update thread title');

            // Restore the original function after the test
            jest.restoreAllMocks();
        });
    });

    describe('Delete /threads', () => {

        beforeEach(async () => {
            const thread = {
                "thread_id": "thread_4QNozAkaaOX6ekPfOMJzbQiN",
                "created_at": "1738485019",
                "title": "thread title"
            };
            await MngThread.insertOne(thread);
            mockDelFunction.mockReset();
        });

        it('Should delete thread', async () => {
            mockDelFunction.mockResolvedValue({ success: true });
            const resp = await request(app).delete('/threads/thread_4QNozAkaaOX6ekPfOMJzbQiN');
            expect(resp.status).toBe(200);
        })

        it('Should return an error when openAi fails to delete thread', async () => {
            mockDelFunction.mockImplementation(() => {
                throw new Error("500 Internal Server Error");
            });
            const resp = await request(app).delete('/threads/thread_4QNozAkaaOX6ekPfOMJzbQiN');
            expect(resp.status).toBe(500);
        })


        it.only('Should return 404 error when thread id doesnt exist in openai', async () => {
            mockDelFunction.mockImplementation(() => {
                throw new Error("404 No thread found with id");
            });
            const resp = await request(app).delete('/threads/thread_id_not_exist');
            expect(resp.status).toBe(404);
        })

    })

});