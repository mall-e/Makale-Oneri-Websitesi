const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');
const serviceAccount = require('/Users/mali/Desktop/articlesuggestion-firebase-adminsdk-cmt89-493bc1648d.json');

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount)
});

const db = firebaseAdmin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/recommendations', async (req, res) => {
  const { userId } = req.body;

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const userInterests = userDoc.data().interest;

    const pythonProcess = spawn('python3', ['/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/cosine_similarity.py', userId, JSON.stringify(userInterests)]);

    let pythonData = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
    });

    pythonProcess.stdout.on('end', () => {
      try {
        const results = JSON.parse(pythonData);
        res.json(results);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Error parsing Python script output');
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python script error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        res.status(500).send('Python script exited with code ' + code);
      }
    });

  } catch (error) {
    console.error('Error fetching user interests:', error);
    res.status(500).send('Error fetching user interests');
  }
});

app.post('/new-recommendations', async (req, res) => {
  const { selectedArticles } = req.body;

  try {
    const pythonProcess = spawn('python3', ['/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/new_cosine_similarity.py', JSON.stringify(selectedArticles)]);

    let pythonData = '';

    pythonProcess.stdout.on('data', (data) => {
      pythonData += data.toString();
    });

    pythonProcess.stdout.on('end', () => {
      try {
        const results = JSON.parse(pythonData);
        res.json(results);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        res.status(500).send('Error parsing Python script output');
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error('Python script error:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        res.status(500).send('Python script exited with code ' + code);
      }
    });

  } catch (error) {
    console.error('Error running new recommendations script:', error);
    res.status(500).send('Error running new recommendations script');
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
