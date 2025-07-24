import { createReducer } from '@reduxjs/toolkit';
import { setGameState, updateGameState } from '../gameActions'; // src/actions/gameActions.js

const initialState = {
    player_name: '',
    player_hand: [],
    cpu_hand: [],
    table_cards: [],
    pot: 0,
    button: 0,
    player_stack: 200,
    cpu_stack: 200,
    current_player: 0,
    round: 'Preflop', // 초기 라운드
    sb: 1,           // 스몰 블라인드
    bb: 2,           // 빅 블라인드
};

const gameReducer = createReducer(initialState, (builder) => {
    builder
        .addCase(setGameState, (state, action) => {
            return action.payload;
        })
        .addCase(updateGameState, (state, action) => {
            return { ...state, ...action.payload };
        });
});

export default gameReducer;