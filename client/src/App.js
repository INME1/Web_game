import React from 'react';
import GameScreen from './components/GameScreen';
import { Provider } from 'react-redux';
import store from './store';

function App() {
    return (
        <Provider store={store}>
            <div className="App">
                <GameScreen />
            </div>
        </Provider>
    );
}

export default App;
