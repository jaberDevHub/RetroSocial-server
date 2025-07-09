const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.osatkz4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let postsCollection;

async function run() {
  try {
    await client.connect();
    const db = client.db('retro_social_db');
    postsCollection = db.collection('posts');

    console.log('Connected to MongoDB');

    // API endpoints

    // Add a new post
    app.post('/posts', async (req, res) => {
      try {
        const post = req.body;
        const result = await postsCollection.insertOne(post);
        res.status(201).send({ message: 'Post added successfully', postId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to add post' });
      }
    });

    // Get all posts or filter by userEmail
    app.get('/posts', async (req, res) => {
      try {
        const email = req.query.userEmail;
        let query = {};
        if (email) query = { userEmail: email };

        const posts = await postsCollection.find(query).toArray();
        res.send(posts);
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to fetch posts' });
      }
    });

    // Update a post by ID
    app.put('/posts/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const updatedPost = req.body;

        const result = await postsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedPost }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: 'Post not found' });
        }

        res.send({ message: 'Post updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to update post' });
      }
    });

    // Delete a post by ID
    app.delete('/posts/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const result = await postsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'Post not found' });
        }

        res.send({ message: 'Post deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Failed to delete post' });
      }
    });

    // Health check route
    app.get('/', (req, res) => {
      res.send('Backend server is running');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
  }
}

run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
