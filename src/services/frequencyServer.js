const fs = require('fs').promises;
const path = require('path');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3003;
const keyFilesDirectory = '/Users/mali/Desktop/Krapivin2009/keys';

app.use(cors());
app.use(express.json());

// Anahtar kelimelerin frekansını hesaplayan endpoint
app.get('/frequencies', async (req, res) => {
    try {
        const files = await readKeyFileNames();
        const keywordFrequency = {};

        for (const file of files) {
            const fileContent = await getKeyFileContent(file);
            const keywords = fileContent.split(/\r?\n/); // Anahtar kelimeleri satır satır ayır

            keywords.forEach(keyword => {
                keyword = keyword.trim();
                if (keyword) {
                    if (keywordFrequency[keyword]) {
                        keywordFrequency[keyword]++;
                    } else {
                        keywordFrequency[keyword] = 1;
                    }
                }
            });
        }

        res.json(keywordFrequency);
    } catch (error) {
        console.error('Frekans analizi hatası:', error);
        res.status(500).json({ error: 'Frekans analizi hatası' });
    }
});

// .key uzantılı dosya isimlerini async olarak döndüren fonksiyon
const readKeyFileNames = async () => {
    try {
        const files = await fs.readdir(keyFilesDirectory);
        return files.filter((file) => path.extname(file).toLowerCase() === '.key');
    } catch (error) {
        throw new Error('Dosya okuma hatası:', error);
    }
};

// Key dosya içeriğini async olarak döndüren fonksiyon
const getKeyFileContent = async (keyFileName) => {
    try {
        const response = await fs.readFile(path.join(keyFilesDirectory, keyFileName), 'utf8');
        return response;
    } catch (error) {
        throw new Error('Key dosya içeriği alınamadı:', error);
    }
};

// Sunucuyu belirtilen port üzerinde dinlemeye başlat
app.listen(port, () => {
    console.log(`Frequency service listening at http://localhost:${port}`);
});
