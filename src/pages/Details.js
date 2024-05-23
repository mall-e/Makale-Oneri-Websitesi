import React, { useEffect, useState } from 'react';
import './Details.css'; // Stil dosyasını ekleyin

const Details = () => {
    const [selectedTitle, setSelectedTitle] = useState('');
    const [selectedSummaries, setSelectedSummaries] = useState([]);
    const [selectedKeyDetails, setSelectedKeyDetails] = useState([]);

    useEffect(() => {
        const title = localStorage.getItem('selectedTitle');
        const summaries = JSON.parse(localStorage.getItem('selectedSummaries'));
        const keyDetails = JSON.parse(localStorage.getItem('selectedKeyDetails'));

        setSelectedTitle(title);
        setSelectedSummaries(summaries);
        setSelectedKeyDetails(keyDetails);
    }, []);

    return (
        <div className="details-container">
            <h1 className="details-title">{selectedTitle}</h1>
            <div className="details-section">
                <ul className="details-list">
                    {selectedSummaries.map((summary, index) => (
                        <li key={index} className="details-item">{summary}</li>
                    ))}
                </ul>
            </div>
            <div className="details-section">
                <h2 className="details-subtitle">Anahtar Kelimeler</h2>
                <ul className="details-keywords">
                    {selectedKeyDetails.map((detail, index) => (
                        <li key={index} className="details-keyword">{detail}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Details;
