const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/scibert', (req, res) => {
    const userId = req.body.user_id;
    const pythonCommand = `python3`;
    const pythonArgs = [`/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/scibertres.py`, userId];

    const process = spawn(pythonCommand, pythonArgs);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    process.on('close', (code) => {
        if (code !== 0) {
            console.error(`Process exited with code ${code}`);
            console.error(`stderr: ${stderr}`);
            return res.status(500).send(stderr);
        }
        console.log(`stdout: ${stdout}`);
        try {
            res.send(JSON.parse(stdout));
        } catch (parseError) {
            console.error(`JSON parse error: ${parseError}`);
            console.error(`Raw output: ${stdout}`);
            res.status(500).send({ error: 'Invalid JSON response from Python script' });
        }
    });
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`SciBERT service running on port ${port}`);
});
