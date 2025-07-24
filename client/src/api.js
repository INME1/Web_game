import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const startNewHand = async (player_name) => {
    try {
        const response = await api.post('start_new_hand/', { player_name });
        return response.data;
    } catch (error) {
        console.error('Error starting new hand:', error.response?.data || error);
        throw error;
    }
};

export const playerAction = async (action, amount, gameState, cpuModel = 'basic') => {
    try {
        const response = await api.post('player_action/', {
            action,
            amount,
            cpu_model: cpuModel, // ✅ 추가
            game_data: gameState,
        });
        return response.data;
    } catch (error) {
        console.error('Error processing player action:', error.response?.data || error);
        throw error;
    }
};


// 핸드 족보 평가 요청
export const getHandEvaluation = async (cards) => {
    try {
        const response = await api.post('get_hand_evaluation/', { cards });
        return response.data.hand_evaluation;
    } catch (error) {
        console.error('Error getting hand evaluation:', error.response?.data || error);
        throw error;
    }
};

// 핸드 비교 요청
export const compareHands = async (player_cards, cpu_cards) => {
    try {
        const response = await api.post('compare_hands/', { player_cards, cpu_cards });
        return response.data.comparison_result;
    } catch (error) {
        console.error('Error comparing hands:', error.response?.data || error);
        throw error;
    }
};

// 게임 로그 저장 요청
export const saveGameLog = async (logData) => {
    try {
        const response = await api.post('save_game_log/', logData);
        return response.data;
    } catch (error) {
        console.error('Error saving game log:', error.response?.data || error);
        throw error;
    }
};
