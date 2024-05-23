const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3004;
const keyFilesDirectory = '/Users/mali/Desktop/Krapivin2009/keys';
const txtFilesDirectory = '/Users/mali/Desktop/Krapivin2009/docsutf8';

app.use(cors());
app.use(express.json());

app.get('/search/:searchTerm', async (req, res) => {
    const searchTerm = req.params.searchTerm;

    try {
        const files = await readKeyFileNames(); // Dosya isimlerini async olarak al
        const matchingFiles = [];

        // Her dosya için içeriği kontrol et
        for (const file of files) {
            const filePath = path.join(keyFilesDirectory, file);
            const fileContent = await readFileContent(filePath); // Dosya içeriğini async olarak al

            // Aranan terim dosya içeriğinde bulunuyorsa dosya adını ekle
            if (fileContent.includes(searchTerm)) {
                const txtFilePath = path.join(txtFilesDirectory, `${file.split('.')[0]}.txt`);
                const txtFileContent = await readFileContent(txtFilePath); // .txt dosya içeriğini async olarak al
                const keyContent = await getKeyFileContent(file); // Key dosya içeriğini al
                matchingFiles.push({ keyFile: file, txtContent: txtFileContent, keyContent });
            }
        }

        res.json(matchingFiles);
    } catch (error) {
        console.error('Dosya okuma hatası:', error);
        res.status(500).json({ error: 'Dosya okuma hatası' });
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

// Dosya içeriğini async olarak döndüren fonksiyon
const readFileContent = async (filePath) => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        return fileContent;
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

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
