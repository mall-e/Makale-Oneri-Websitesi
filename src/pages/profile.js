import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Paper, Chip, MenuItem, Select, InputLabel, FormControl, Box, AppBar } from '@mui/material';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from '../contexts/AuthContext';
import Appbar from '../components/appbar';
import { getFrequencies } from '../services/frequencyService';
import { toast } from 'react-toastify';

const Profile = () => {
    const { currentUser } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [birthday, setBirthday] = useState('');
    const [gender, setGender] = useState('');
    const [interests, setInterests] = useState([]);
    const [newInterest, setNewInterest] = useState('');
    const [frequencies, setFrequencies] = useState({});
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser || !currentUser.uid) {
                console.error("User is not authenticated or missing UID.");
                return;
            }

            const userRef = doc(db, "users", currentUser.uid);
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setEmail(currentUser.email || '');
                    setName(userData.name || '');
                    setSurname(userData.surname || '');
                    setBirthday(userData.birthday || '');
                    setGender(userData.gender || '');
                    setInterests(userData.interests || []);
                } else {
                    console.error("User document not found.");
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        fetchUserData();
    }, [currentUser]);

    useEffect(() => {
        const fetchFrequencies = async () => {
            const data = await getFrequencies();
            setFrequencies(data);
        };

        fetchFrequencies();
    }, []);

    useEffect(() => {
        const filterSuggestions = () => {
            if (newInterest.length === 0) {
                setSuggestions([]);
                return;
            }

            const filteredSuggestions = Object.keys(frequencies).filter(keyword =>
                keyword.toLowerCase().startsWith(newInterest.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        };

        // Filtreleme işlemini 200ms gecikmeyle yaparak gereksiz tekrarları önler
        const timeoutId = setTimeout(filterSuggestions, 200);

        return () => clearTimeout(timeoutId);
    }, [newInterest, frequencies]);

    const handleUpdateProfile = async () => {
        if (!name.trim() || !surname.trim() || !birthday.trim() || !gender.trim()) {
            console.error("Fields cannot be empty!");
            return;
        }

        const userRef = doc(db, "users", currentUser.uid);
        try {
            await updateDoc(userRef, {
                name: name,
                surname: surname,
                birthday: birthday,
                gender: gender,
                interests: interests
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast.error("Failed to update profile");
        }
    };

    const handleAddInterest = () => {
        if (!newInterest.trim() || interests.includes(newInterest)) return;

        const updatedInterests = [...interests, newInterest];
        setInterests(updatedInterests);
        setNewInterest('');
        setSuggestions([]);
    };

    const handleDeleteInterest = (interestToDelete) => {
        const updatedInterests = interests.filter(interest => interest !== interestToDelete);
        setInterests(updatedInterests);
    };

    return (
        <div>
            <Appbar />
            <Container>
                <Paper sx={{ alignItems: 'center', justifyContent: 'center', marginLeft: '10%', marginRight: '10%', padding: '5%', marginTop: '5%' }}>
                    <h1>Profile Page</h1>
                    <TextField
                        label="Email"
                        value={email}
                        margin="normal"
                        fullWidth
                        disabled
                    />
                    <TextField
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        margin="normal"
                        fullWidth
                    />
                    <TextField
                        label="Birthday"
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        margin="normal"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select
                            labelId="gender-label"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            label="Gender"
                        >
                            <MenuItem value="Erkek">Erkek</MenuItem>
                            <MenuItem value="Kadın">Kadın</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Add Interest"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        margin="normal"
                        fullWidth
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {suggestions.map((suggestion, index) => (
                            <Chip
                                key={index}
                                label={`${suggestion} (${frequencies[suggestion]})`}
                                onClick={() => {
                                    if (!interests.includes(suggestion)) {
                                        setInterests((interests) => [...interests, suggestion]);
                                    }
                                }}
                                style={{ margin: '4px' }}
                            />
                        ))}
                    </Box>
                    <Button onClick={handleAddInterest} variant="contained" color="primary">Add Interest</Button>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {interests.map((interest, index) => (
                            <Chip
                                key={index}
                                label={interest}
                                onDelete={() => handleDeleteInterest(interest)}
                                color="primary"
                            />
                        ))}
                    </Box>
                    <Button onClick={handleUpdateProfile} variant="contained" color="primary" sx={{ mt: 3 }}>Update Profile</Button>
                </Paper>
            </Container>
        </div>
    );
};

export default Profile;
