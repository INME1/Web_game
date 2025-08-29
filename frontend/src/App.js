import React, { useState, useEffect } from 'react';
import { startGame, openCell, flagCell } from './api/gameApi';
import './App.css';

function App() {
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);

  useEffect(() => {
    let interval;
    if (!isGameOver && !isGameWon && gameData) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else if (isGameOver || isGameWon) {
      clearInterval(interval); // 게임 오버나 클리어 시 타이머 멈추기
    }
    return () => clearInterval(interval); // 클린업
  }, [gameData, isGameOver, isGameWon]);

  // 게임 시작
  const handleStart = async (difficulty) => {
    try {
      const data = await startGame(difficulty);
      console.log('게임 응답:', data);
      setGameData(data);
      setTimer(0);
      setIsGameOver(false);
      setIsGameWon(false);
    } catch (err) {
      console.error('게임 시작 실패:', err.response?.data || err.message);
    }
  };

  // 셀 클릭 (좌클릭 - 셀 열기)
  const handleCellClick = async (x, y) => {
    if (isGameOver || isGameWon) return; // 게임이 오버되었거나 클리어되었으면 클릭하지 않음
    console.log(`Clicked cell at (${x}, ${y})`);
    try {
      const updatedGame = await openCell(gameData.id, x, y);
      setGameData(updatedGame); // 게임 상태 업데이트

      // 지뢰를 클릭한 경우
      if (updatedGame.is_lost) {
        setIsGameOver(true);
        // 모든 지뢰 표시
        updatedGame.cells.forEach((cell) => {
          if (cell.is_mine) {
            cell.is_open = true; // 지뢰가 있는 셀을 열고
          }
        });
        setGameData({ ...updatedGame });
      } else if (updatedGame.is_won) {
        setIsGameWon(true);
      }
    } catch (err) {
      console.error('셀 열기 실패:', err.response?.data || err.message);
    }
  };

  // 셀 우클릭 (깃발 설정/해제)
  const handleRightClick = async (e, x, y) => {
    e.preventDefault(); // 우클릭 메뉴 방지
  
    if (isGameOver || isGameWon) return; // 게임 끝났으면 리턴
  
    const clickedCell = gameData.cells.find(cell => cell.x === x && cell.y === y);
    if (!clickedCell || clickedCell.is_open) return; // 셀이 열려있으면 깃발 안됨
  
    console.log(`Right clicked on cell at (${x}, ${y})`);
  
    try {
      const updatedGame = await flagCell(gameData.id, x, y);
      setGameData(updatedGame); // 게임 상태 업데이트
    } catch (err) {
      console.error('플래그 설정/해제 실패:', err.response?.data || err.message);
    }
  };
  

  // 게임판 그리기
  const renderGrid = () => {
    if (!gameData || !gameData.grid_size || !gameData.cells) return null;

    const size = gameData.grid_size;
    const rows = [];

    for (let y = 0; y < size; y++) {
      const cells = [];
      for (let x = 0; x < size; x++) {
        const cell = gameData.cells.find((c) => c.x === x && c.y === y);

        const cellText = () => {
          if (cell?.is_open) {
            if (cell.is_mine) {
              return '💣'; // 지뢰가 있는 셀에는 💣 표시
            }
            return cell.adjacent_mines > 0 ? cell.adjacent_mines : '';
          }
          if (cell?.is_flagged) {
            return '🚩'; // 플래그가 설정된 셀에는 🚩 표시
          }
          return '';
        };

        cells.push(
          <div
            key={`${x}-${y}`}
            onClick={() => handleCellClick(x, y)} // 좌클릭
            onContextMenu={(e) => handleRightClick(e, x, y)} // 우클릭
            style={{
              width: 30,
              height: 30,
              border: '1px solid black',
              display: 'inline-block',
              textAlign: 'center',
              lineHeight: '30px',
              backgroundColor: cell?.is_open ? '#ddd' : '#aaa',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {cellText()}
          </div>
        );
      }
      rows.push(<div key={y}>{cells}</div>);
    }

    return <div>{rows}</div>;
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Minesweeper</h1>
      <button onClick={() => handleStart('EASY')}>쉬움 시작</button>
      <button onClick={() => handleStart('MEDIUM')}>보통 시작</button>
      <button onClick={() => handleStart('HARD')}>어려움 시작</button>

      {gameData && (
        <div style={{ marginTop: 20 }}>
          <p>게임 ID: {gameData.id}</p>
          <p>시간: {timer}초</p>
          {isGameOver && <p>게임 오버!</p>}
          {isGameWon && <p>게임 클리어!</p>}
          {renderGrid()}
        </div>
      )}
    </div>
  );
}

export default App;
