const request = require('supertest');
const app = require('../../app');

describe('Thread Routes',()=>{
  it('Should return all threads', ()=>{
    const res = request(app).get('/threads');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  })
});