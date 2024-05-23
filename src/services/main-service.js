const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/fetch-articles', async (req, res) => {
    const userId = req.body.user_id;

    try {
        const fastTextResponse = await axios.post('http://localhost:3002/api/fasttext', { user_id: userId });
        const fastTextArticles = fastTextResponse.data;

        const sciBertResponse = await axios.post('http://localhost:3003/api/scibert', { user_id: userId });
        const sciBertArticles = sciBertResponse.data;

        res.send({
            fastTextArticles,
            sciBertArticles
        });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).send('Error fetching articles');
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Main service running on port ${port}`);
});
