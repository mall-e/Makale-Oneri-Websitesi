import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                backgroundColor: '#f7f7f7',
                textAlign: 'center',
                padding: 4
            }}
        >
            <Typography variant="h2" component="h1" gutterBottom>
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Oops! The page you are looking for doesn’t exist.
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
                It might have been moved or deleted. Let’s get you back home.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/')}>
                Return Home
            </Button>
        </Box>
    );
}

export default NotFoundPage;
