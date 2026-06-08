// backend/test/restaurants.test.js
// Unit tests for restaurantController, using sinon to stub Mongoose methods.
// No database connection required.

const chai = require('chai');
const sinon = require('sinon');
const Restaurant = require('../models/Restaurant');
const {
  listRestaurants,
  getRestaurantBySlug,
  createRestaurant,
} = require('../controllers/restaurantController');

const expect = chai.expect;

describe('restaurantController (unit tests, sinon)', () => {
  afterEach(() => {
    sinon.restore();
  });

  // --- Test 1: listRestaurants happy path ---
  it('listRestaurants returns 200 with paginated restaurants', async () => {
    const fakeRestaurants = [
      { _id: 'r1', name: 'Saigon & Smoke', slug: 'saigon-smoke', cuisine: 'Vietnamese BBQ' },
      { _id: 'r2', name: 'Nori & Nora', slug: 'nori-nora', cuisine: 'Japanese Italian' },
    ];

    // Restaurant.find(filter).sort(...).skip(...).limit(...) — stub the whole chain.
    const chainStub = {
      sort: sinon.stub().returnsThis(),
      skip: sinon.stub().returnsThis(),
      limit: sinon.stub().resolves(fakeRestaurants),
    };
    sinon.stub(Restaurant, 'find').returns(chainStub);
    sinon.stub(Restaurant, 'countDocuments').resolves(2);

    const req = { query: {} };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await listRestaurants(req, res);

    expect(res.json.calledOnce).to.be.true;
    const body = res.json.firstCall.args[0];
    expect(body).to.have.property('items').that.deep.equals(fakeRestaurants);
    expect(body).to.have.property('total', 2);
    expect(body).to.have.property('page', 1);
    expect(body).to.have.property('totalPages').that.is.a('number');
  });

  // --- Test 2: getRestaurantBySlug happy path ---
  it('getRestaurantBySlug returns 200 + restaurant when slug exists', async () => {
    const fakeRestaurant = {
      _id: 'r1',
      name: 'Saigon & Smoke',
      slug: 'saigon-smoke',
      cuisine: 'Vietnamese BBQ',
    };
    sinon.stub(Restaurant, 'findOne').resolves(fakeRestaurant);

    const req = { params: { slug: 'saigon-smoke' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getRestaurantBySlug(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal(fakeRestaurant);
  });

  // --- Test 3: getRestaurantBySlug 404 path ---
  it('getRestaurantBySlug returns 404 when slug is unknown', async () => {
    sinon.stub(Restaurant, 'findOne').resolves(null);

    const req = { params: { slug: 'does-not-exist' } };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await getRestaurantBySlug(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('message');
  });

  // --- Test 4: createRestaurant happy path (admin) ---
  it('createRestaurant returns 201 when admin creates a valid restaurant', async () => {
    const newRestaurant = {
      _id: 'r99',
      name: 'Test Bistro',
      slug: 'test-bistro',
      cuisine: 'Modern Australian',
      location: 'Sydney, NSW',
    };
    sinon.stub(Restaurant, 'create').resolves(newRestaurant);

    const req = {
      body: {
        name: 'Test Bistro',
        slug: 'test-bistro',
        cuisine: 'Modern Australian',
        location: 'Sydney, NSW',
        description: 'A new place.',
        imageUrl: 'https://example.com/image.jpg',
      },
      user: { _id: 'admin1', role: 'admin' },
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await createRestaurant(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal(newRestaurant);
  });
});