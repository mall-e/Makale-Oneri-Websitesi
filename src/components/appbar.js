import React, { useState, useEffect } from 'react';
import {
    AppBar, Toolbar, IconButton, Menu, MenuItem, Button, Typography,
    TextField
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authservice';
import { db } from '../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Özel kimlik doğrulama bağlamını içe aktar


const Appbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [userName, setUserName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const { currentUser } = useAuth(); // Mevcut kullanıcıyı almak için useAuth kancasını kullan

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser || !currentUser.uid) return; // Kullanıcı kimliği kontrolü

            const userRef = doc(db, 'users', currentUser.uid);
            try {
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const fullName = `${userData.name || ''} ${userData.surname || ''}`;
                    setUserName(fullName.trim());
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        navigate('/profile');
        handleClose();
    };

    const handleLogout = () => {
        logout(() => navigate('/'));
        handleClose();
    };

    const handleHome = () => {
        navigate('/home');  // Home rotası buraya göre güncellenmeli
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        navigate(`/search/${searchTerm}`); // Arama sonuçları rotası buraya göre güncellenmeli
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <img src='/articlelogo.png' alt="ArticleHub Logo" style={{ height: '40px', marginRight: '20px' }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    ArticleHub
                </Typography>
                
                <TextField
                    variant="outlined"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Makale ara..."
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={handleSearch} color="inherit">
                                <SearchIcon />
                            </IconButton>
                        )
                    }}
                    size="small"
                    style={{ marginRight: '10px', backgroundColor: 'white', borderRadius: '4px' }}
                />
                <Button color="inherit" onClick={handleHome} startIcon={<HomeIcon />}>
                    Home
                </Button>
                <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                >
                    <AccountCircleIcon />
                </IconButton>
                <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleProfile}>Profili Düzenle</MenuItem>
                    <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                </Menu>
                <Typography variant="subtitle1" sx={{ color: 'white',fontWeight: 'bold', marginRight: '20px', marginLeft: '1%' }}>
                    {`${userName}`}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default Appbar;