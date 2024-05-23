import React, { useState, useEffect } from 'react';
import { Button, TextField, Container, Paper, Tabs, Tab, Box, Chip, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { handleLogin, handleSignup } from '../services/authservice';
import { getFrequencies } from '../services/frequencyService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Eğer henüz import edilmemişse

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AuthForm() {
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  const [frequencies, setFrequencies] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFrequencies = async () => {
      const data = await getFrequencies();
      setFrequencies(data);
    };

    fetchFrequencies();
  }, []);

  useEffect(() => {
    const filterSuggestions = () => {
      if (interestInput.length === 0) {
        setSuggestions([]);
        return;
      }

      const filteredSuggestions = Object.keys(frequencies).filter(keyword =>
        keyword.toLowerCase().startsWith(interestInput.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    };

    // Filtreleme işlemini 200ms gecikmeyle yaparak gereksiz tekrarları önler
    const timeoutId = setTimeout(filterSuggestions, 200);

    return () => clearTimeout(timeoutId);
  }, [interestInput, frequencies]);


  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLoginClick = async () => {
    const isLoggedIn = await handleLogin(email, password);
    if (isLoggedIn) {
      navigate('/home');
    } else {
      alert("Giriş başarısız!");
    }
  };

  const getTopFrequencies = () => {
    return Object.entries(frequencies)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([key, value]) => ({ key, value }));
  };

  const handleSignupClick = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const signupSuccess = await handleSignup(email, password, confirmPassword, name, surname, birthday, gender, interests);
    if (signupSuccess) {
      toast.success("Signup successful! Please login.");
      setTabValue(0);
    } else {
      toast.error("Signup failed. Please try again.");
    }
  };

  const handleInterestDelete = (interestToDelete) => () => {
    setInterests((interests) => interests.filter((interest) => interest !== interestToDelete));
  };

  const handleInterestAdd = () => {
    if (interestInput && !interests.includes(interestInput)) {
      setInterests((interests) => [...interests, interestInput]);
      setInterestInput('');
      setSuggestions([]); // Önerileri temizle
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("/bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, backgroundColor: '#333C48', color: 'white' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="login sign-up tabs" variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Login" />
            <Tab label="Sign Up" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email-login"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              variant="filled"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              label="Password"
              type="password"
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, backgroundColor: '#111111' }}
              onClick={handleLoginClick}
            >
              Login
            </Button>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email-signup"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              label="Password"
              type="password"
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              name="confirm-password"
              label="Confirm Password"
              type="password"
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              name="name"
              label="Name"
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              name="surname"
              label="Surname"
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="birthday-signup"
              label="Birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { color: 'white' },
              }}
              sx={{ input: { color: 'white' } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="gender-label" style={{ color: 'white' }}>Gender</InputLabel>
              <Select
                labelId="gender-label"
                id="gender-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                label="Gender"
                variant="filled"
                sx={{ '& .MuiFilledInput-input': { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="Erkek">Erkek</MenuItem>
                <MenuItem value="Kadın">Kadın</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              id="interest-input"
              label="Add Interest"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              variant="filled"
              InputLabelProps={{
                style: { color: 'white' },
              }}
              inputProps={{
                style: { color: 'white' }
              }}
              sx={{ input: { color: 'white' } }}
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
            <Button
              color="primary"
              variant='contained'
              onClick={handleInterestAdd}
              sx={{ mt: 1, mb: 2, color: 'white' }}
            >
              Add Interest
            </Button>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => handleInterestDelete(interest)}
                  color="primary"
                />
              ))}
            </Box>

            <Box sx={{ mt: 2 }}>
              <div style={{ color: 'white', marginBottom: '8px' }}>Top Interests:</div>
              {getTopFrequencies().map((interest, index) => (
                <Chip
                  key={index}
                  label={`${interest.key} (${interest.value})`}
                  onClick={() => setInterestInput(interest.key)}
                  style={{ margin: '4px', backgroundColor: 'white' }}
                />
              ))}
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleSignupClick}
            >
              Sign Up
            </Button>
          </TabPanel>
        </Paper>
      </Container>
    </div>
  );
}

export default AuthForm;
