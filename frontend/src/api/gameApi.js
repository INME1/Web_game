import axios from 'axios';

// .env.production 혹은 환경변수에서 가져오기
const BASE_URL = process.env.REACT_APP_API_URL; // Railway 백엔드 URL

export const startGame = async (difficulty) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/start_game/`, { difficulty });
    console.log('게임 시작 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('게임 시작 에러:', error.response?.data || error.message);
    throw error;
  }
};

export const openCell = async (gameId, x, y) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/open_cell/${gameId}/`, { x, y });
    return res.data;
  } catch (error) {
    console.error('셀 열기 에러:', error.response?.data || error.message);
    throw error;
  }
};

export const flagCell = async (gameId, x, y) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/flag_cell/${gameId}/`, { x, y });
    return res.data;
  } catch (error) {
    console.error('플래그 설정 에러:', error.response?.data || error.message);
    throw error;
  }
};
