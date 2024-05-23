// src/services/frequencyService.js

export const getFrequencies = async () => {
    try {
      const response = await fetch('http://localhost:3003/frequencies');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching frequencies:', error);
      return {};
    }
  };
  