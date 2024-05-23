import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Appbar from './appbar';
import SearchResult from './SearchResult';
import './Search.css'; // Stilleri içe aktar

const Search = () => {
    const { searchTerm } = useParams();
    const [matchingFiles, setMatchingFiles] = useState([]);

    useEffect(() => {
        const fetchMatchingFiles = async () => {
            try {
                const response = await fetch(`http://localhost:3001/search/${searchTerm}`);
                if (!response.ok) {
                    throw new Error('Backend isteği başarısız.');
                }
                const data = await response.json();
                const processedFiles = await processMatchingFiles(data);
                setMatchingFiles(processedFiles);
            } catch (error) {
                console.error('Backend isteği hatası:', error);
            }
        };

        fetchMatchingFiles();
    }, [searchTerm]);

    const processMatchingFiles = async (files) => {
        const processedFiles = [];

        for (const fileInfo of files) {
            const { keyFile, txtContent, keyContent } = fileInfo;
            const titles = extractTitles(txtContent);
            const summaries = extractSummaries(txtContent);
            const keyDetails = await getKeyDetails(keyContent);
            processedFiles.push({ keyFile, titles, summaries, keyDetails });
        }

        return processedFiles;
    };

    const extractTitles = (content) => {
        const titles = [];
        const lines = content.split('\n');
        let currentTitle = null;

        for (const line of lines) {
            if (line.trim() === '--T') {
                currentTitle = '';
            } else if (line.trim() === '--A') {
                if (currentTitle !== null) {
                    titles.push(currentTitle.trim());
                }
                currentTitle = null;
            } else if (currentTitle !== null) {
                currentTitle += line + '\n';
            }
        }

        return titles;
    };

    const extractSummaries = (content) => {
        const summaries = [];
        const lines = content.split('\n');
        let currentSummary = null;

        for (const line of lines) {
            if (line.trim() === '--A') {
                currentSummary = '';
            } else if (line.trim() === '--B') {
                if (currentSummary !== null) {
                    summaries.push(currentSummary.trim());
                }
                currentSummary = null;
            } else if (currentSummary !== null) {
                currentSummary += line + '\n';
            }
        }

        return summaries;
    };

    const getKeyDetails = async (keyContent) => {
        const details = [];
        const lines = keyContent.split('\n');

        for (const line of lines) {
            if (line.trim().length > 0) {
                details.push(line.trim());
            }
        }

        return details;
    };

    const handleTitleClick = (fileInfo) => {
        const { titles, summaries, keyDetails } = fileInfo;

        localStorage.setItem('selectedTitle', titles[0]);
        localStorage.setItem('selectedSummaries', JSON.stringify(summaries));
        localStorage.setItem('selectedKeyDetails', JSON.stringify(keyDetails));

        window.location.href = '/details'; // Yeni sayfanın URL'ini buraya girin
    };

    return (
        <div>
            <Appbar />
            <div className="search-container">
                <h1>Arama Terimi: {searchTerm}</h1>
                <div className="search-results">
                    {matchingFiles.map((fileInfo, index) => (
                        <SearchResult
                            key={index}
                            title={fileInfo.titles && fileInfo.titles.length > 0 ? fileInfo.titles[0] : 'Başlık Bulunamadı'}
                            summary={fileInfo.summaries && fileInfo.summaries.length > 0 ? fileInfo.summaries[0] : 'Özet Bulunamadı'}
                            keyDetails={fileInfo.keyDetails}
                            onClick={() => handleTitleClick(fileInfo)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Search;
