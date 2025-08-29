// src/api/gameApi.js
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

export const startGame = async (difficulty) => {
  try {
    const response = await axios.post('http://localhost:8000/api/start_game/', { difficulty });
    console.log('게임 시작 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('게임 시작 에러:', error.response?.data || error.message);
    throw error;
  }
};

export const openCell = async (gameId, x, y) => {
    const res = await axios.post(`http://localhost:8000/api/open_cell/${gameId}/`, { x, y });
    return res.data;
  };

export const flagCell = async (gameId, x, y) => {
    try {
        const res = await axios.post(`http://localhost:8000/api/flag_cell/${gameId}/`, { x, y });
        return res.data;
    } catch (error) {
        console.error('플래그 설정 에러:', error.response?.data || error.message);
        throw error;
    }
};