import request from 'supertest';
import app from '../src/app';

describe('auth', () => {
  it('registers and logs in', async () => {
    const register = await request(app).post('/api/auth/register').send({
      username: 'alice',
      password: 'password123',
    });
    expect(register.status).toBe(200);
    expect(register.body.token).toBeTruthy();

    const login = await request(app).post('/api/auth/login').send({
      username: 'alice',
      password: 'password123',
    });
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
  });

  it('returns current user', async () => {
    const register = await request(app).post('/api/auth/register').send({
      username: 'bob',
      password: 'password123',
    });

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${register.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.username).toBe('bob');
  });
});
