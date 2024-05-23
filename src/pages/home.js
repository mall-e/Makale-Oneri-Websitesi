import React, { useEffect, useState } from 'react';
import Appbar from '../components/appbar';
import { Card, CardContent, Typography, CircularProgress, Grid, Checkbox, Button } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [totalSelections, setTotalSelections] = useState({ fastText: 0, sciBERT: 0 });
  const [correctSelections, setCorrectSelections] = useState({ fastText: 0, sciBERT: 0 });

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('http://localhost:3002/recommendations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: currentUser.uid })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRecommendations();
    }
  }, [currentUser]);

  const handleSelectArticle = (model, title) => {
    setSelectedArticles((prevSelected) => {
      if (prevSelected.includes(title)) {
        return prevSelected.filter((t) => t !== title);
      } else {
        return [...prevSelected, title];
      }
    });
  };

  const handleNewRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3002/new-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selectedArticles })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch new recommendations');
      }

      const data = await response.json();

      // Seçilen makalelerin doğruluğunu kontrol et ve state'i güncelle
      selectedArticles.forEach((title) => {
        if (recommendations.fastText.some((rec) => rec.title === title)) {
          setCorrectSelections((prev) => ({ ...prev, fastText: prev.fastText + 1 }));
        }
        if (recommendations.sciBERT.some((rec) => rec.title === title)) {
          setCorrectSelections((prev) => ({ ...prev, sciBERT: prev.sciBERT + 1 }));
        }
      });

      setTotalSelections((prev) => ({
        fastText: prev.fastText + recommendations.fastText.length,
        sciBERT: prev.sciBERT + recommendations.sciBERT.length,
      }));

      setRecommendations(data); // Sadece yeni önerileri göster
      setSelectedArticles([]);  // Yeni öneriler alındıktan sonra seçimleri sıfırla
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrecision = (model) => {
    if (totalSelections[model] === 0) return 0;
    return (correctSelections[model] / totalSelections[model]) * 100;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!recommendations) {
    return <div>No recommendations found</div>;
  }

  return (
    <div>
      <Appbar />
      <h1>Home Page</h1>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom component="div">
            FastText Recommendations (Precision: {calculatePrecision('fastText').toFixed(2)}%)
          </Typography>
          {recommendations.fastText.map((rec, index) => (
            <Card key={index} style={{ margin: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent style={{ flexGrow: 1 }}>
                <Typography variant="h5">{rec.title}</Typography>
                <Typography variant="body2">{rec.abstract}</Typography>
                <Typography color="text.secondary">
                  Similarity: {Math.round(rec.similarity * 100)}%
                </Typography>
              </CardContent>
              <Checkbox
                checked={selectedArticles.includes(rec.title)}
                onChange={() => handleSelectArticle('fastText', rec.title)}
                style={{ alignSelf: 'flex-end', margin: '10px' }}
              />
            </Card>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom component="div">
            SciBERT Recommendations (Precision: {calculatePrecision('sciBERT').toFixed(2)}%)
          </Typography>
          {recommendations.sciBERT.map((rec, index) => (
            <Card key={index} style={{ margin: '10px', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent style={{ flexGrow: 1 }}>
                <Typography variant="h5">{rec.title}</Typography>
                <Typography variant="body2">{rec.abstract}</Typography>
                <Typography color="text.secondary">
                  Similarity: {Math.round(rec.similarity * 100)}%
                </Typography>
              </CardContent>
              <Checkbox
                checked={selectedArticles.includes(rec.title)}
                onChange={() => handleSelectArticle('sciBERT', rec.title)}
                style={{ alignSelf: 'flex-end', margin: '10px' }}
              />
            </Card>
          ))}
        </Grid>
      </Grid>
      <Button variant="contained" color="primary" onClick={handleNewRecommendations}>
        Get New Recommendations
      </Button>
    </div>
  );
};

export default Home;
