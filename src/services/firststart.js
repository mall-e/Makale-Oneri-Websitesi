const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./mongodb');
const { spawn } = require('child_process');
const Article = require('../models/Article');

const app = express();
connectDB();

app.use(bodyParser.json());

app.get('/run-scripts', async (req, res) => {
    const userId = req.query.userId;

    const fastTextProcess = spawn('python3', ['/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/services/fasttextmongo.py', userId]);
    const sciBertProcess = spawn('python3', ['/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/services/scibertmongo.py', userId]);

    fastTextProcess.stdout.on('data', async (data) => {
        const articles = JSON.parse(data.toString());
        for (const article of articles) {
            const newArticle = new Article({
                title: article.title,
                similarity: article.similarity,
                model: 'fasttext',
                userId: userId
            });
            await newArticle.save();
        }
    });

    sciBertProcess.stdout.on('data', async (data) => {
        const articles = JSON.parse(data.toString());
        for (const article of articles) {
            const newArticle = new Article({
                title: article.title,
                similarity: article.similarity,
                model: 'scibert',
                userId: userId
            });
            await newArticle.save();
        }
    });

    fastTextProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).send('FastText process failed');
        }
    });

    sciBertProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).send('SciBERT process failed');
        } else {
            res.status(200).send('Articles generated successfully');
        }
    });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
