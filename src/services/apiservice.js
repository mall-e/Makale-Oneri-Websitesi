const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { spawn } = require('child_process');
const ps = require('ps-node');

const app = express();
app.use(express.json());
app.use(cors());

const checkMemoryUsage = () => {
    return new Promise((resolve, reject) => {
        ps.lookup({ pid: process.pid }, (err, resultList) => {
            if (err) {
                return reject(err);
            }
            const processInfo = resultList[0];
            const memoryUsage = processInfo.memory;
            resolve(memoryUsage);
        });
    });
};

const executePythonScript = (pythonCommand, pythonArgs, res) => {
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
};

app.post('/api/scibert', async (req, res) => {
    try {
        const memoryUsage = await checkMemoryUsage();
        console.log(`Memory usage before SciBERT: ${memoryUsage}`);
        if (memoryUsage > 500000) { // Example threshold
            return res.status(500).send({ error: 'Memory usage too high to process request' });
        }

        const userId = req.body.user_id;
        const pythonCommand = `python3`;
        const pythonArgs = [`/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/scibertres.py`, userId];

        executePythonScript(pythonCommand, pythonArgs, res);
    } catch (error) {
        console.error('Error in /api/scibert:', error);
        res.status(500).send(error.message);
    }
});

app.post('/api/fasttext', async (req, res) => {
    try {
        const memoryUsage = await checkMemoryUsage();
        console.log(`Memory usage before FastText: ${memoryUsage}`);
        if (memoryUsage > 500000) { // Example threshold
            return res.status(500).send({ error: 'Memory usage too high to process request' });
        }

        const userId = req.body.user_id;
        const pythonCommand = `python3`;
        const pythonArgs = [`/Users/mali/Desktop/Yazlab2_3/yazlab2_3/src/preprocessing/fasttextres.py`, userId];

        executePythonScript(pythonCommand, pythonArgs, res);
    } catch (error) {
        console.error('Error in /api/fasttext:', error);
        res.status(500).send(error.message);
    }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
