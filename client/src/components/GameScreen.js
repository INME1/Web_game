import React, { useEffect, useState } from 'react';
import { startNewHand, playerAction } from '../api'; 
import './GameScreen.css'; // 스타일도 여기 연결

function GameScreen() {
    const [gameData, setGameData] = useState(null);
    const [raiseAmount, setRaiseAmount] = useState(0);
    const [message, setMessage] = useState('');
    const [cpuModel, setCpuModel] = useState('basic');
    const [showdownVisible, setShowdownVisible] = useState(false);
    const [winnerInfo, setWinnerInfo] = useState(null);  // ⭐ 추가 (누가 어떤 패로 이겼는지 저장)

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const data = await startNewHand("플레이어");
            setGameData(data);
            setMessage("플레이어 턴입니다.");
            setShowdownVisible(false);
            setWinnerInfo(null);  // ⭐ 승리 박스 없애기
        } catch (error) {
            console.error("초기화 실패:", error);
        }
    };

    const handleAction = async (selectedAction) => {
        if (!selectedAction) return alert('Action을 선택하세요.');
        if (selectedAction === 'raise' && (!raiseAmount || raiseAmount <= 0)) {
            return alert('Raise 금액을 입력하세요.');
        }

        try {
            const data = await playerAction(selectedAction, raiseAmount, gameData, cpuModel);
            setGameData(data);
            setRaiseAmount(0);

            if (data.game_over) {
                setShowdownVisible(true);
                setWinnerInfo({    // ⭐ 승리 정보 저장
                    winner: data.winner,
                    playerHand: data.player.hand_rank,
                    cpuHand: data.cpu.hand_rank
                });
                setTimeout(() => fetchInitialData(), 5000); // 5초 후 재시작
            } else {
                if (data.current_player === 0) {
                    setMessage("플레이어 턴입니다.");
                } else {
                    setMessage("CPU 턴입니다.");
                }
            }
        } catch (error) {
            console.error("액션 실패:", error);
        }
    };

    const selectCpuModel = (model) => {
        setCpuModel(model);
    };

    if (!gameData) return <div>Loading...</div>;

    return (
        <div className="table-background">
            {/* 왼쪽 패널 */}
            <div className="left-panel">
                {/* CPU 모델 선택 */}
                <div className="cpu-model-buttons">
                    <button 
                        onClick={() => selectCpuModel('basic')}
                        className={cpuModel === 'basic' ? 'selected-model' : ''}
                    >
                        Basic
                    </button>
                    <button 
                        onClick={() => selectCpuModel('q_learning')}
                        className={cpuModel === 'q_learning' ? 'selected-model' : ''}
                    >
                        Q-Learning
                    </button>
                </div>

                {/* 액션 버튼 */}
                <div className="action-buttons">
                    <button onClick={() => handleAction('fold')}>Fold</button>
                    <button onClick={() => handleAction('call')}>Call</button>
                    <input
                        type="number"
                        min="1"
                        placeholder="Raise 금액"
                        value={raiseAmount}
                        onChange={(e) => setRaiseAmount(Number(e.target.value))}
                    />
                    <button onClick={() => handleAction('raise')}>Raise</button>
                </div>
            </div>

            {/* 테이블 중앙 */}
            <div className="center-area">
                {/* CPU 카드 */}
                <div className="cpu-area">
                    <div>CPU</div>
                    <div className="hand">
                        {gameData.cpu.hand.map((card, idx) => (
                            <div key={idx} className="card" style={{ backgroundColor: 'white', color: 'white' }}>
                                {showdownVisible ? `${card.suit}${card.rank}` : ''}
                            </div>
                        ))}
                    </div>
                    <div>스택: {gameData.cpu.stack}</div>
                </div>

                {/* 테이블 카드 */}
                <div className="table-cards">
                    {gameData.table.cards.map((card, idx) => (
                        <div key={idx} className="card">
                            {card.suit}{card.rank}
                        </div>
                    ))}
                </div>

                {/* 플레이어 카드 */}
                <div className="player-area">
                    <div>플레이어</div>
                    <div className="hand">
                        {gameData.player.hand.map((card, idx) => (
                            <div key={idx} className="card">
                                {card.suit}{card.rank}
                            </div>
                        ))}
                    </div>
                    <div>스택: {gameData.player.stack}</div>
                </div>

                {/* ⭐ 승리 박스 추가 */}
                {winnerInfo && (
                    <div className="winner-box">
                        <h2>🏆 {winnerInfo.winner} 승리! 🏆</h2>
                        <p>플레이어 핸드: {winnerInfo.playerHand}</p>
                        <p>CPU 핸드: {winnerInfo.cpuHand}</p>
                    </div>
                )}
            </div>

            {/* 오른쪽 상태창 */}
            <div className="right-status">
                <div>Pot: {gameData.table.pot}</div>
                <div>Round: {gameData.table.round}</div>
                <div>Small Blind: {gameData.sb}</div>
                <div>Big Blind: {gameData.bb}</div>
                <div>{message}</div>
            </div>
        </div>
    );
}

export default GameScreen;
