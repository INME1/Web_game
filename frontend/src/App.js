import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Chip,
  Box,
  LinearProgress,
  ThemeProvider,
  createTheme,
  CssBaseline
} from '@mui/material';
import { Flag, AccessTime, Refresh, EmojiEvents, MoodBad } from '@mui/icons-material';
import { startGame, openCell, flagCell } from './api/gameApi';

// 다크 테마 설정
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#9c27b0', // 보라색
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    secondary: {
      main: '#e91e63',
    },
    background: {
      default: '#0a0a0a',
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
          border: '1px solid #333',
        },
      },
    },
  },
});

function App() {
  const [gameData, setGameData] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [animatingCells, setAnimatingCells] = useState(new Set());

  // 타이머 로직
  useEffect(() => {
    let interval;
    if (!isGameOver && !isGameWon && gameData) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    } else if (isGameOver || isGameWon) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
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
      setAnimatingCells(new Set());
    } catch (err) {
      console.error('게임 시작 실패:', err.response?.data || err.message);
    }
  };

  // 셀 클릭 (좌클릭 - 셀 열기)
  const handleCellClick = async (x, y) => {
    if (isGameOver || isGameWon) return;
    
    const cellKey = `${x}-${y}`;
    setAnimatingCells(prev => new Set([...prev, cellKey]));
    
    console.log(`Clicked cell at (${x}, ${y})`);
    try {
      const updatedGame = await openCell(gameData.id, x, y);
      setGameData(updatedGame);

      // 지뢰를 클릭한 경우
      if (updatedGame.is_lost) {
        setIsGameOver(true);
        updatedGame.cells.forEach((cell) => {
          if (cell.is_mine) {
            cell.is_open = true;
          }
        });
        setGameData({ ...updatedGame });
      } else if (updatedGame.is_won) {
        setIsGameWon(true);
      }
    } catch (err) {
      console.error('셀 열기 실패:', err.response?.data || err.message);
    }
    
    // 애니메이션 정리
    setTimeout(() => {
      setAnimatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }, 300);
  };

  // 셀 우클릭 (깃발 설정/해제)
  const handleRightClick = async (e, x, y) => {
    e.preventDefault();
    
    if (isGameOver || isGameWon) return;
    
    const clickedCell = gameData.cells.find(cell => cell.x === x && cell.y === y);
    if (!clickedCell || clickedCell.is_open) return;
    
    console.log(`Right clicked on cell at (${x}, ${y})`);
    
    try {
      const updatedGame = await flagCell(gameData.id, x, y);
      setGameData(updatedGame);
    } catch (err) {
      console.error('플래그 설정/해제 실패:', err.response?.data || err.message);
    }
  };

  // 시간 포맷팅
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 셀 렌더링
  const renderCell = (cell, cellSize = 32) => {
    const cellKey = `${cell.x}-${cell.y}`;
    const isAnimating = animatingCells.has(cellKey);
    
    const getCellContent = () => {
      if (cell.is_flagged) return '🚩';
      if (!cell.is_open) return '';
      if (cell.is_mine) return '💣';
      if (cell.adjacent_mines > 0) return cell.adjacent_mines;
      return '';
    };
    
    const getNumberColor = () => {
      const colors = {
        1: '#2196f3', // 파랑
        2: '#4caf50', // 초록
        3: '#f44336', // 빨강
        4: '#9c27b0', // 보라
        5: '#ff9800', // 주황
        6: '#795548', // 갈색
        7: '#000000', // 검정
        8: '#607d8b'  // 회색
      };
      return colors[cell.adjacent_mines] || '#ffffff';
    };
    
    // 셀 크기에 따른 폰트 크기 조정
    const fontSize = Math.max(Math.floor(cellSize * 0.4), 10);
    
    const cellStyle = {
      width: `${cellSize}px`,
      height: `${cellSize}px`,
      minWidth: `${cellSize}px`,
      minHeight: `${cellSize}px`,
      maxWidth: `${cellSize}px`,
      maxHeight: `${cellSize}px`,
      border: '2px solid',
      borderColor: cell.is_flagged ? '#e91e63' : 
                   cell.is_open ? '#424242' : '#7b1fa2',
      backgroundColor: cell.is_flagged ? '#4a148c' : 
                      cell.is_open ? (cell.is_mine ? '#d32f2f' : '#1e1e1e') : '#6a1b9a',
      color: cell.is_open ? getNumberColor() : '#ffffff',
      cursor: cell.is_open ? 'default' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${fontSize}px`,
      fontWeight: 'bold',
      borderRadius: '6px',
      userSelect: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      transform: isAnimating ? 'scale(0.9) rotateX(180deg)' : 'scale(1) rotateX(0deg)',
      boxShadow: cell.is_open ? 
        'inset 0 2px 4px rgba(0,0,0,0.3)' : 
        '0 4px 8px rgba(156, 39, 176, 0.3), 0 2px 4px rgba(156, 39, 176, 0.2)',
      // 반응형 제거 - 항상 고정 크기
      flexShrink: 0,
      flexGrow: 0
    };

    return (
      <div
        key={cellKey}
        style={cellStyle}
        className="transition-all duration-300 ease-out hover:scale-105"
        onClick={() => handleCellClick(cell.x, cell.y)}
        onContextMenu={(e) => handleRightClick(e, cell.x, cell.y)}
        onMouseEnter={(e) => {
          if (!cell.is_open) {
            e.target.style.transform = 'translateY(-2px) scale(1.05)';
            e.target.style.backgroundColor = '#8e24aa';
          }
        }}
        onMouseLeave={(e) => {
          if (!cell.is_open) {
            e.target.style.transform = 'scale(1)';
            e.target.style.backgroundColor = '#6a1b9a';
          }
        }}
      >
        <span style={{ 
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          transform: isAnimating ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transition: 'transform 0.3s ease'
        }}>
          {getCellContent()}
        </span>
      </div>
    );
  };

  // 게임판 그리기
  const renderGrid = () => {
    if (!gameData || !gameData.grid_size || !gameData.cells) return null;

    const size = gameData.grid_size;
    
    // 화면 크기에 따른 최대 사용 가능한 공간 계산
    const maxWidth = Math.min(window.innerWidth * 0.9, 800); // 화면의 90% 또는 최대 800px
    const maxHeight = Math.min(window.innerHeight * 0.6, 600); // 화면의 60% 또는 최대 600px
    
    // 패딩과 간격을 고려한 사용 가능한 공간
    const padding = 20;
    const gap = 2; // 간격을 줄임
    const availableWidth = maxWidth - (padding * 2) - (gap * (size - 1));
    const availableHeight = maxHeight - (padding * 2) - (gap * (size - 1));
    
    // 셀 크기를 동적으로 계산 (정사각형 유지)
    const maxCellSize = Math.floor(Math.min(availableWidth / size, availableHeight / size));
    const cellSize = Math.max(Math.min(maxCellSize, 40), 20); // 최소 20px, 최대 40px
    
    // 실제 그리드 크기 계산
    const gridWidth = (cellSize * size) + (gap * (size - 1)) + (padding * 2);
    const gridHeight = (cellSize * size) + (gap * (size - 1)) + (padding * 2);
    
    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
      gap: `${gap}px`,
      padding: `${padding}px`,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      border: '2px solid #9c27b0',
      width: `${gridWidth}px`,
      height: `${gridHeight}px`,
      boxShadow: '0 0 30px rgba(156, 39, 176, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
      margin: '0 auto',
      // 스크롤 완전 제거
      overflow: 'visible'
    };

    return (
      <div style={gridStyle}>
        {gameData.cells.map((cell) => renderCell(cell, cellSize))}
      </div>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div className="min-h-screen bg-black" style={{ 
        background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
        padding: '10px',
        overflow: 'hidden' // 전체 페이지 스크롤 방지
      }}>
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <Typography variant="h3" component="h1" className="font-bold mb-2" style={{
              background: 'linear-gradient(45deg, #9c27b0, #e91e63)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(156, 39, 176, 0.5)'
            }}>
              Minesweeper
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
            </Typography>
          </div>

          {/* 게임 컨트롤 패널 */}
          <Card className="mb-6" style={{ 
            background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
            border: '1px solid #9c27b0',
            boxShadow: '0 0 20px rgba(156, 39, 176, 0.2)'
          }}>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 난이도 선택 */}
                <div className="flex flex-col gap-2">
                  <Typography variant="subtitle2" color="text.secondary">
                    난이도 선택
                  </Typography>
                  <div className="flex gap-2">
                    <Button 
                      variant="contained" 
                      onClick={() => handleStart('EASY')}
                      style={{
                        background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                        boxShadow: '0 4px 8px rgba(76, 175, 80, 0.3)'
                      }}
                    >
                      쉬움
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => handleStart('MEDIUM')}
                      style={{
                        background: 'linear-gradient(45deg, #ff9800, #ffb74d)',
                        boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)'
                      }}
                    >
                      보통
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={() => handleStart('HARD')}
                      style={{
                        background: 'linear-gradient(45deg, #f44336, #ef5350)',
                        boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)'
                      }}
                    >
                      어려움
                    </Button>
                  </div>
                </div>

                {/* 게임 정보 */}
                {gameData && (
                  <div className="flex gap-4 flex-wrap">
                    <Chip
                      icon={<Flag style={{ color: '#e91e63' }} />}
                      label={`지뢰: ${gameData.mine_count - (gameData.cells?.filter(c => c.is_flagged).length || 0)}`}
                      style={{
                        backgroundColor: '#4a148c',
                        color: 'white',
                        border: '1px solid #e91e63'
                      }}
                    />
                    <Chip
                      icon={<AccessTime style={{ color: '#2196f3' }} />}
                      label={formatTime(timer)}
                      style={{
                        backgroundColor: '#1565c0',
                        color: 'white',
                        border: '1px solid #2196f3'
                      }}
                    />
                  </div>
                )}

                {/* 새 게임 버튼 */}
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => gameData && handleStart(gameData.difficulty)}
                  disabled={!gameData}
                  style={{
                    background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)'
                  }}
                >
                  새 게임
                </Button>
              </div>

              {/* 진행률 바 */}
              {gameData && (
                <Box className="mt-4">
                  <LinearProgress
                    variant="determinate"
                    value={((gameData.cells?.filter(c => c.is_open && !c.is_mine).length || 0) / 
                            ((gameData.grid_size * gameData.grid_size) - gameData.mine_count)) * 100}
                    style={{
                      height: '8px',
                      borderRadius: '4px',
                      backgroundColor: '#333'
                    }}
                    sx={{
                      '& .MuiLinearProgress-bar': {
                        background: isGameWon ? 
                          'linear-gradient(45deg, #4caf50, #66bb6a)' : 
                          isGameOver ? 
                          'linear-gradient(45deg, #f44336, #ef5350)' :
                          'linear-gradient(45deg, #9c27b0, #ba68c8)'
                      }
                    }}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* 게임 상태 메시지 */}
          {(isGameWon || isGameOver) && (
            <Card className="mb-6" style={{
              background: isGameWon ? 
                'linear-gradient(145deg, #1b5e20, #2e7d32)' : 
                'linear-gradient(145deg, #b71c1c, #d32f2f)',
              border: `2px solid ${isGameWon ? '#4caf50' : '#f44336'}`,
              boxShadow: `0 0 20px ${isGameWon ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
            }}>
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {isGameWon ? (
                    <EmojiEvents style={{ color: '#ffd700', fontSize: '40px' }} />
                  ) : (
                    <MoodBad style={{ color: '#f44336', fontSize: '40px' }} />
                  )}
                  <Typography variant="h4" style={{ 
                    color: isGameWon ? '#4caf50' : '#f44336',
                    fontWeight: 'bold'
                  }}>
                    {isGameWon ? '🎉 승리!' : '💥 게임 오버'}
                  </Typography>
                </div>
                <Typography variant="body1" color="text.secondary" className="mb-3">
                  {isGameWon 
                    ? `축하합니다! ${formatTime(timer)}만에 클리어했습니다!` 
                    : '지뢰를 밟았습니다. 다시 도전해보세요!'
                  }
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={() => handleStart(gameData.difficulty)}
                  style={{
                    background: isGameWon ? 
                      'linear-gradient(45deg, #4caf50, #66bb6a)' :
                      'linear-gradient(45deg, #9c27b0, #ba68c8)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  새 게임 시작
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 메인 게임 보드 */}
          {gameData ? (
            <Card style={{
              background: 'linear-gradient(145deg, #0a0a0a, #1a1a1a)',
              border: '2px solid #9c27b0',
              borderRadius: '16px',
              boxShadow: '0 0 30px rgba(156, 39, 176, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)'
            }}>
              <CardContent className="p-2">
                {renderGrid()}
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center" style={{
              background: 'linear-gradient(145deg, #1a1a1a, #2a2a2a)',
              border: '1px solid #9c27b0',
              boxShadow: '0 0 20px rgba(156, 39, 176, 0.2)'
            }}>
              <CardContent className="py-12">
                <div className="text-6xl mb-4">🎮</div>
                <Typography variant="h5" className="mb-4" color="text.primary">
                  게임을 시작해보세요!
                </Typography>
                <Typography variant="body1" color="text.secondary" className="mb-6">
                  난이도를 선택하고 새로운 게임을 시작하세요
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleStart('EASY')}
                  style={{
                    background: 'linear-gradient(45deg, #9c27b0, #ba68c8)',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)',
                    padding: '12px 32px'
                  }}
                >
                  게임 시작
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 푸터 */}
          <div className="text-center mt-12 pb-8">
            <Typography variant="body2" color="text.secondary">
              Django REST API + React로 구현된 지뢰찾기
            </Typography>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;