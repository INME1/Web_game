import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './reducers/gameReducer'; // src/reducers/gameReducer.js

const store = configureStore({
    reducer: {
        game: gameReducer,
    },
});

export default store;