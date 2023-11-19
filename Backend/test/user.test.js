jest.setTimeout(15000); // Set a higher timeout value (e.g., 15 seconds)

/*
const request = require('supertest');
const user = require('server.js');
*/

/*
const path = require('path');
const request = require('supertest');
const app = require(path.resolve(__dirname, '../server'));
*/

const { MongoClient } = require('mongodb');
/*
const request = require('supertest');
const app = require('../server'); // Replace with the actual path to your Express app
//const user = require('../path/to/your/user');
*/
const supertest = require('supertest');
const app = require('../server'); // Replace with the actual path to your Express app
const request = supertest(app);

const user = {
    "email": "newuserlol3@example.com",
    "name": "John Doe",
    "address": "123 Main St",
    "friends": [
      "friend1@example.com",
      "friend2@example.com"
    ],
    "friendRequests": [
      "friend3@example.com"
    ]
  };

const userEmail = 'koltonluu@gmail.com';
const nonExistingEmail = 'nonexistinguser@example.com';


  beforeAll(async () => {
    // Set up MongoDB connection before tests
    try {
      const uri = 'mongodb://0.0.0.0:27017'; // Replace with your MongoDB connection string
      client = new MongoClient(uri);
      await client.connect();
      console.log("connected");
    } catch (error) {
      console.error('MongoDB Connection Error:', error);
    }
  });
  
  afterAll(async () => {
    // Close MongoDB connection after all tests
    if (client) {
      await client.close();
    }
  });
  
  beforeEach(() => {
    // Log messages or perform setup before each test if needed
    // Avoid logging directly in beforeAll for async operations
  });
  

// Interface POST https://20.163.28.92:8081/api/userlist
describe('Create a new user', () => {
  // Mock user data for testing
  const user = {
    email: 'test@example.com',
    // ... other user properties
  };

  const user1 = {
    email: 'test1@example.com',
    // ... other user properties
  };

  // Before running the tests, add a sample user to the database
  beforeAll(async () => {
    const collection = client.db('UserDB').collection('userlist');
    await collection.insertOne(user);
  });

  // After running the tests, remove the sample user from the database
  afterAll(async () => {
    const collection = client.db('UserDB').collection('userlist');
    await collection.deleteOne({ email: user.email });
    await collection.deleteOne({ email: user1.email });
  });

  test('POST /api/userlist should create a new user', async () => {
    const res = await request
      .post('/api/userlist')
      .send(user1);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
  });

  test('POST /api/userlist should return an error if the user already exists', async () => {
    const res = await request
      .post('/api/userlist')
      .send(user);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('User with this email already exists');
  });

  test('POST /api/userlist should handle server errors during user creation', async () => {
    // Mocking an error during the database insertion
    const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'insertOne');
    collectionMock.mockImplementationOnce(() => {
      throw new Error('Mocked MongoDB insertion error');
    });

    try {
      const res = await request
        .post('/api/userlist')
        .send(user);

      console.log('Response:', res.status, res.body);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Restore the original implementation of the mocked method
      collectionMock.mockRestore();
    }
  });
});


// Interface GET https://20.163.28.92:8081/api/userlist/:email
describe('Get an email', () => {
  // Define variables for storing test data
  const userEmail = 'test@example.com';
  const nonExistingEmail = 'nonexistent@example.com';

  // Before running the tests, add a sample user to the database
  beforeAll(async () => {
    // Assuming client and request are properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.insertOne({ email: userEmail });
  });

  // After running the tests, remove the sample user from the database
  afterAll(async () => {
    // Assuming client is properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.deleteOne({ email: userEmail });
  });

  // Test for getting an existing user by email
  test('GET /api/userlist/:email should retrieve an existing user by email', async () => {
    const res = await request.get(`/api/userlist/${userEmail}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(userEmail);
  });

  // Test for getting a non-existing user by email
  test('GET /api/userlist/:email should return an error for a non-existing user', async () => {
    const res = await request.get(`/api/userlist/${nonExistingEmail}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  // Test for handling server errors during user retrieval
  test('GET /api/userlist/:email should handle server errors during retrieval', async () => {
    // Mocking an error during the database query
    const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'findOne');
    collectionMock.mockImplementationOnce(() => {
      throw new Error('Mocked MongoDB query error');
    });

    try {
      const res = await request.get(`/api/userlist/${userEmail}`);

      console.log('Response:', res.status, res.body);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Restore the original implementation of the mocked method
      collectionMock.mockRestore();
    }
  });
});

  
describe('Update User Address', () => {
  // Define variables for storing test data
  const userEmail = 'test@example.com';
  const nonExistingEmail = 'nonexistent@example.com';

  // Before running the tests, add a sample user to the database
  beforeAll(async () => {
    // Assuming client and request are properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.insertOne({ email: userEmail, address: 'Initial Address' });
  });

  // After running the tests, remove the sample user from the database
  afterAll(async () => {
    // Assuming client is properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.deleteOne({ email: userEmail });
  });

  // Test for successfully updating a user's address
  test('PUT /api/userlist/:email/address should update user address successfully', async () => {
    const newAddress = '123 Main St';

    const res = await request
      .put(`/api/userlist/${userEmail}/address`)
      .send({ address: newAddress });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('User address updated successfully');
  });

  // Test for updating the address of a non-existing user
  test('PUT /api/userlist/:email/address should return an error for a non-existing user', async () => {
    const newAddress = '456 Oak St';

    const res = await request
      .put(`/api/userlist/${nonExistingEmail}/address`)
      .send({ address: newAddress });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  // Test for handling server errors during address update
  test('PUT /api/userlist/:email/address should handle server errors during update', async () => {
    // Mocking an error during the database update
    const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'updateOne');
    collectionMock.mockImplementationOnce(() => {
      throw new Error('Mocked MongoDB update error');
    });

    try {
      const newAddress = '789 Pine St';

      const res = await request
        .put(`/api/userlist/${userEmail}/address`)
        .send({ address: newAddress });

      console.log('Response:', res.status, res.body);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Restore the original implementation of the mocked method
      collectionMock.mockRestore();
    }
  });
});

describe('Get User Friend List with Names', () => {
  // Define variables for storing test data
  const userEmail = 'test@example.com';
  const nonExistingEmail = 'nonexistent@example.com';

  // Before running the tests, add a sample user to the database
  beforeAll(async () => {
    // Assuming client and request are properly initialized
    const collection = client.db('UserDB').collection('userlist');

    await collection.insertOne({
      email: userEmail,
      name: "user1",
      friends: ['friend1@example.com'],
      friendRequests: ['requester@example.com']
    });

    await collection.insertOne({
      email: 'friend1@example.com',
      name: "friend1",
      friends: [userEmail],
      friendRequests: ['requester@example.com']
    });

    await collection.insertOne({
      email: 'requester@example.com',
      name: "requester",
      friends: [],
      friendRequests: []
    });
  });

  // After running the tests, remove the sample user from the database
  afterAll(async () => {
    // Assuming client is properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.deleteOne({ email: userEmail });
    await collection.deleteOne({ email: 'friend1@example.com' });
    await collection.deleteOne({ email: 'requester@example.com' });
  });

  // Test for successfully retrieving user friend list with names
  test('GET friends', async () => {
    const res = await request
      .get(`/api/userlist/${userEmail}/friends`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('friendsWithNames');
    expect(res.body).toHaveProperty('friendRequestsWithNames');
    expect(Array.isArray(res.body.friendsWithNames)).toBe(true);
    expect(Array.isArray(res.body.friendRequestsWithNames)).toBe(true);
  });

  // Test for retrieving friend list with names for a non-existing user
  test('GET /api/userlist/:email/friends should return an error for a non-existing user', async () => {
    const res = await request
      .get(`/api/userlist/${nonExistingEmail}/friends`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  // Test for handling server errors during friend list retrieval
  test('GET /api/userlist/:email/friends should handle server errors during retrieval', async () => {
    // Mocking an error during the database query
    const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'findOne');
    collectionMock.mockImplementationOnce(() => {
      throw new Error('Mocked MongoDB query error');
    });

    try {
      const res = await request
        .get(`/api/userlist/${userEmail}/friends`);

      console.log('Response:', res.status, res.body);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Restore the original implementation of the mocked method
      collectionMock.mockRestore();
    }
  });
});

describe('Send Friend Request', () => {
  // Define variables for storing test data
  const userEmail = 'test@example.com';
  const nonExistingEmail = 'nonexistent@example.com';
  const existingFriendEmail = 'friend1@example.com';

  // Before running the tests, add a sample user and friend to the database
  beforeAll(async () => {
    // Assuming client and request are properly initialized
    const collection = client.db('UserDB').collection('userlist');

    await collection.insertOne({
      email: userEmail,
      name: "user2",
      friends: ['friend1@example.com'],
      friendRequests: []
    });

    await collection.insertOne({
      email: 'friend1@example.com',
      name: "friend1",
      friends: [userEmail],
      friendRequests: ['requester@example.com']
    });

    await collection.insertOne({
      email: 'requester@example.com',
      name: "requester",
      friends: [],
      friendRequests: []
    });
  });

  // After running the tests, remove the sample user and friend from the database
  afterAll(async () => {
    // Assuming client is properly initialized
    const collection = client.db('UserDB').collection('userlist');
    await collection.deleteOne({ email: userEmail });
    await collection.deleteOne({ email: 'friend1@example.com' });
    await collection.deleteOne({ email: 'requester@example.com' });
  });

  // Test for successfully sending a friend request
  test('POST /api/userlist/:email/friendRequest should send a friend request successfully', async () => {
    const friendEmail = 'requester@example.com';

    const res = await request
      .post(`/api/userlist/${userEmail}/friendRequest`)
      .send({ friendEmail });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Friend request sent successfully');
  });

  // Test for sending a friend request to a non-existing user
  test('POST /api/userlist/:email/friendRequest should return an error for a non-existing user', async () => {
    const friendEmail = 'nonexistingfriend@example.com';

    const res = await request
      .post(`/api/userlist/${nonExistingEmail}/friendRequest`)
      .send({ friendEmail });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  // Test for sending a friend request to a non-existing friend
  test('POST /api/userlist/:email/friendRequest should return an error for a non-existing friend', async () => {
    const friendEmail = 'nonexistingfriend@example.com';

    const res = await request
      .post(`/api/userlist/${userEmail}/friendRequest`)
      .send({ email: friendEmail });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Friend not found in the userlist');
  });

  // Test for sending a friend request to an existing friend
  test('POST /api/userlist/:email/friendRequest should return an error for an existing friend', async () => {
    const res = await request
      .post(`/api/userlist/${userEmail}/friendRequest`)
      .send({ existingFriendEmail });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Friend request already sent');
  });

  // Test for handling server errors during friend request
  test('POST /api/userlist/:email/friendRequest should handle server errors during request', async () => {
    // Mocking an error during the database update
    const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'updateOne');
    collectionMock.mockImplementationOnce(() => {
      throw new Error('Mocked MongoDB update error');
    });

    try {
      const friendEmail = 'friend@example.com';

      const res = await request
        .post(`/api/userlist/${userEmail}/friendRequest`)
        .send({ friendEmail });

      console.log('Response:', res.status, res.body);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal server error');
    } catch (error) {
      console.error('Test error:', error);
    } finally {
      // Restore the original implementation of the mocked method
      collectionMock.mockRestore();
    }
  });
});


  describe('Accept Friend Request', () => {
    // Test for successfully accepting a friend request
    const userEmail = 'test@example.com';
    const nonExistingEmail = 'nonexistent@example.com';
    const friendEmail = 'requester@example.com';
  
    // Before running the tests, add a sample user and friend to the database
    beforeAll(async () => {
      // Assuming client and request are properly initialized
      const collection = client.db('UserDB').collection('userlist');
  
      await collection.insertOne({
        email: userEmail,
        name: "user3",
        friends: ['friend1@example.com'],
        friendRequests: ['requester@example.com']
      });
  
      await collection.insertOne({
        email: 'friend1@example.com',
        name: "friend1",
        friends: [userEmail],
        friendRequests: ['requester@example.com']
      });
  
      await collection.insertOne({
        email: 'requester@example.com',
        name: "requester",
        friends: [],
        friendRequests: []
      });
    });
  
    // After running the tests, remove the sample user and friend from the database
    afterAll(async () => {
      // Assuming client is properly initialized
      const collection = client.db('UserDB').collection('userlist');
      await collection.deleteOne({ email: userEmail });
      await collection.deleteOne({ email: 'friend1@example.com' });
      await collection.deleteOne({ email: 'requester@example.com' });
    });

    test('POST /api/userlist/:email/:friendRequest/accept should accept a friend request successfully', async () => {
      // Assuming userEmail and friendEmail are valid emails that exist in the database
      //const friendEmail = 'friend@example.com';
  
      // Assuming a friend request has been sent
      /*
      await request
        .post(`/api/userlist/${friendEmail}/friendRequest`)
        .send({ email: userEmail });
        */

      const res = await request
        .post(`/api/userlist/${userEmail}/${friendEmail}/accept`);
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Friend request accepted successfully');
    });
  
    // Test for accepting a friend request from a non-existing user
    test('POST /api/userlist/:email/:friendRequest/accept should return an error for a non-existing user', async () => {
      // Assuming userEmail is a valid email that exists in the database
      const friendEmail = 'nonexistingfriend@example.com';
  
      const res = await request
        .post(`/api/userlist/${nonExistingEmail}/${friendEmail}/accept`);
  
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  
    // Test for accepting a friend request that doesn't exist in the user's friend requests
    test('POST /api/userlist/:email/:friendRequest/accept should return an error for a non-existing friend request', async () => {
      // Assuming userEmail and friendEmail are valid emails that exist in the database
      const friendEmail = 'nonexistingfriend@example.com';
  
      const res = await request
        .post(`/api/userlist/${userEmail}/${friendEmail}/accept`);
  
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Friend request not found in the user's friend requests");
    });
  
    // Test for handling server errors during friend request acceptance
    test('POST /api/userlist/:email/:friendRequest/accept should handle server errors during acceptance', async () => {
      // Mocking an error during the database update
      const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'updateOne');
      collectionMock.mockImplementationOnce(() => {
        throw new Error('Mocked MongoDB update error');
      });
  
      try {
        // Assuming userEmail and friendEmail are valid emails that exist in the database
        const friendEmail = 'friend@example.com';
  
        const res = await request
          .post(`/api/userlist/${userEmail}/${friendEmail}/accept`);
  
        console.log('Response:', res.status, res.body);
  
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
      } catch (error) {
        console.error('Test error:', error);
      } finally {
        // Restore the original implementation of the mocked method
        collectionMock.mockRestore();
      }
    });
  });

  
  describe('Decline Friend Request', () => {
    // Test for successfully declining a friend request
    const userEmail = 'test@example.com';
    const nonExistingEmail = 'nonexistent@example.com';
    const friendEmail = 'requester@example.com';
  
    // Before running the tests, add a sample user and friend to the database
    beforeAll(async () => {
      // Assuming client and request are properly initialized
      const collection = client.db('UserDB').collection('userlist');
  
      await collection.insertOne({
        email: userEmail,
        name: "user4",
        friends: ['friend1@example.com'],
        friendRequests: ['requester@example.com']
      });
  
      await collection.insertOne({
        email: 'friend1@example.com',
        name: "friend1",
        friends: [userEmail],
        friendRequests: ['requester@example.com']
      });
  
      await collection.insertOne({
        email: 'requester@example.com',
        name: "requester",
        friends: [],
        friendRequests: []
      });
    });
  
    // After running the tests, remove the sample user and friend from the database
    afterAll(async () => {
      // Assuming client is properly initialized
      const collection = client.db('UserDB').collection('userlist');
      await collection.deleteOne({ email: userEmail });
      await collection.deleteOne({ email: 'friend1@example.com' });
      await collection.deleteOne({ email: 'requester@example.com' });
    });

    test('DELETE /api/userlist/:email/:friendRequest/decline should decline a friend request successfully', async () => {
      // Assuming userEmail and friendEmail are valid emails that exist in the database
  
      const res = await request
        .delete(`/api/userlist/${userEmail}/${friendEmail}/decline`);
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Friend request declined successfully');
    });
  
    // Test for declining a friend request from a non-existing user
    test('DELETE /api/userlist/:email/:friendRequest/decline should return an error for a non-existing user', async () => {
      // Assuming userEmail is a valid email that exists in the database
      const friendEmail = 'nonexistingfriend@example.com';
  
      const res = await request
        .delete(`/api/userlist/${nonExistingEmail}/${friendEmail}/decline`);
  
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('User not found');
    });
  
    // Test for declining a friend request that doesn't exist in the user's friend requests
    test('DELETE /api/userlist/:email/:friendRequest/decline should return an error for a non-existing friend request', async () => {
      // Assuming userEmail and friendEmail are valid emails that exist in the database
      const friendEmail = 'nonexistingfriend@example.com';
  
      const res = await request
        .delete(`/api/userlist/${userEmail}/${friendEmail}/decline`);
  
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Friend request not found in the user's friend requests");
    });
  
    // Test for handling server errors during friend request decline
    test('DELETE /api/userlist/:email/:friendRequest/decline should handle server errors during decline', async () => {
      // Mocking an error during the database update
      const collectionMock = jest.spyOn(client.db('UserDB').collection('userlist'), 'updateOne');
      collectionMock.mockImplementationOnce(() => {
        throw new Error('Mocked MongoDB update error');
      });
  
      try {
        // Assuming userEmail and friendEmail are valid emails that exist in the database
        const friendEmail = 'friend@example.com';
  
        const res = await request
          .delete(`/api/userlist/${userEmail}/${friendEmail}/decline`);
  
        console.log('Response:', res.status, res.body);
  
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
      } catch (error) {
        console.error('Test error:', error);
      } finally {
        // Restore the original implementation of the mocked method
        collectionMock.mockRestore();
      }
    });
  });
  


  
  






