// backend/test/auth.test.js — unit tests for authentication (register / login)
const chai = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { registerUser, loginUser } = require('../controllers/authController');

const expect = chai.expect;
const mockRes = () => ({ status: sinon.stub().returnsThis(), json: sinon.spy() });

describe('authController (unit tests, sinon)', () => {
  afterEach(() => sinon.restore());

  it('registerUser returns 201 with a token for a new email', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    sinon.stub(User, 'create').resolves({ id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner' });
    const req = { body: { name: 'Ann', email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.firstCall.args[0].token).to.be.a('string');
  });

  it('registerUser returns 400 when the email already exists', async () => {
    sinon.stub(User, 'findOne').resolves({ id: 'u1', email: 'ann@test.com' });
    const req = { body: { name: 'Ann', email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status.calledWith(400)).to.be.true;
  });

  it('loginUser returns 200 with a token for valid credentials', async () => {
    sinon.stub(User, 'findOne').resolves({ id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner', password: 'hashed' });
    sinon.stub(bcrypt, 'compare').resolves(true);
    const req = { body: { email: 'ann@test.com', password: 'secret123' } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.json.firstCall.args[0].token).to.be.a('string');
  });

  it('loginUser returns 401 for an invalid password', async () => {
    sinon.stub(User, 'findOne').resolves({ id: 'u1', name: 'Ann', email: 'ann@test.com', role: 'diner', password: 'hashed' });
    sinon.stub(bcrypt, 'compare').resolves(false);
    const req = { body: { email: 'ann@test.com', password: 'wrong' } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });

  it('loginUser returns 401 when the user does not exist', async () => {
    sinon.stub(User, 'findOne').resolves(null);
    const req = { body: { email: 'nobody@test.com', password: 'x' } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status.calledWith(401)).to.be.true;
  });
});