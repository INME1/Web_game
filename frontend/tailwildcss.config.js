/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  important: '#root', // Material-UI와 충돌 방지
  theme: {
    extend: {
      colors: {
        // 커스텀 게임 색상
        minesweeper: {
          // 셀 상태별 색상
          unopened: '#c0c0c0',
          opened: '#f5f5f5',
          mine: '#ff4444',
          flag: '#ff6b6b',
          // 숫자별 색상
          number1: '#0000ff',
          number2: '#008000',
          number3: '#ff0000',
          number4: '#800080',
          number5: '#800000',
          number6: '#008080',
          number7: '#000000',
          number8: '#808080',
        },
        // 난이도별 테마 색상
        difficulty: {
          easy: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
          },
          medium: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
          },
          hard: {
            50: '#fef2f2',
            100: '#fee2e2',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
          }
        }
      },
      fontFamily: {
        'game': ['Roboto Mono', 'Consolas', 'Monaco', 'monospace'],
        'display': ['Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'cell-easy': '0.875rem',
        'cell-medium': '0.75rem',
        'cell-hard': '0.625rem',
      },
      spacing: {
        'cell-easy': '2.5rem',
        'cell-medium': '2rem',
        'cell-hard': '1.5rem',
      },
      borderRadius: {
        'cell': '0.375rem',
      },
      boxShadow: {
        'cell': '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'cell-hover': '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
        'cell-pressed': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
        'game-board': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'game': '10px',
      },
      animation: {
        'cell-reveal': 'cellReveal 0.3s ease-out forwards',
        'mine-explode': 'mineExplode 0.5s ease-out forwards',
        'flag-wave': 'flagWave 0.6s ease-in-out forwards',
        'victory': 'victory 1s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        cellReveal: {
          '0%': { 
            transform: 'scale(1) rotateY(0deg)',
            backgroundColor: '#c0c0c0'
          },
          '50%': { 
            transform: 'scale(0.9) rotateY(90deg)',
          },
          '100%': { 
            transform: 'scale(1) rotateY(0deg)',
            backgroundColor: '#f5f5f5'
          }
        },
        mineExplode: {
          '0%': { 
            transform: 'scale(1)',
            backgroundColor: '#ff4444'
          },
          '50%': { 
            transform: 'scale(1.2)',
            backgroundColor: '#ff0000'
          },
          '100%': { 
            transform: 'scale(1.1)',
            backgroundColor: '#cc0000'
          }
        },
        flagWave: {
          '0%, 100%': { 
            transform: 'rotate(0deg) scale(1)'
          },
          '25%': { 
            transform: 'rotate(5deg) scale(1.1)'
          },
          '75%': { 
            transform: 'rotate(-5deg) scale(1.1)'
          }
        },
        victory: {
          '0%, 100%': { 
            transform: 'scale(1)',
            filter: 'brightness(1)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            filter: 'brightness(1.2)'
          }
        },
        bounceGentle: {
          '0%, 100%': {
            transform: 'translateY(0)',
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
          },
          '50%': {
            transform: 'translateY(-10px)',
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
          }
        },
        glow: {
          '0%': {
            boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.6)',
          }
        }
      },
      transitionProperty: {
        'cell': 'all',
      },
      transitionDuration: {
        'cell': '150ms',
      },
      transitionTimingFunction: {
        'cell': 'cubic-bezier(0.4, 0, 0.2, 1)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // 커스텀 플러그인 - 게임 유틸리티 클래스
    function({ addUtilities, theme }) {
      const newUtilities = {
        // 셀 상태별 유틸리티
        '.cell-unopened': {
          backgroundColor: theme('colors.gray.300'),
          borderColor: theme('colors.gray.400'),
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: theme('colors.gray.200'),
            transform: 'scale(1.05)',
          }
        },
        '.cell-opened': {
          backgroundColor: theme('colors.white'),
          borderColor: theme('colors.gray.300'),
          cursor: 'default',
          boxShadow: theme('boxShadow.cell-pressed'),
        },
        '.cell-flagged': {
          backgroundColor: theme('colors.red.200'),
          borderColor: theme('colors.red.300'),
          animation: theme('animation.flag-wave'),
        },
        '.cell-mine': {
          backgroundColor: theme('colors.red.500'),
          borderColor: theme('colors.red.600'),
          color: 'white',
          animation: theme('animation.mine-explode'),
        },
        
        // 난이도별 그리드 유틸리티
        '.grid-easy': {
          gridTemplateColumns: 'repeat(9, 1fr)',
          gap: theme('spacing.2'),
          maxWidth: '28rem',
        },
        '.grid-medium': {
          gridTemplateColumns: 'repeat(16, 1fr)',
          gap: theme('spacing.1'),
          maxWidth: '40rem',
        },
        '.grid-hard': {
          gridTemplateColumns: 'repeat(30, 1fr)',
          gap: theme('spacing.0.5'),
          maxWidth: '60rem',
        },
        
        // 유리 형태 효과
        '.glass-morphism': {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: theme('borderRadius.lg'),
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: theme('boxShadow.glass'),
        },
        
        // 게임 보드 그라디언트
        '.game-board-gradient': {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
        
        // 성공/실패 상태
        '.state-victory': {
          backgroundColor: theme('colors.green.100'),
          borderColor: theme('colors.green.300'),
          color: theme('colors.green.800'),
          animation: theme('animation.victory'),
        },
        '.state-defeat': {
          backgroundColor: theme('colors.red.100'),
          borderColor: theme('colors.red.300'),
          color: theme('colors.red.800'),
        }
      }
      
      addUtilities(newUtilities)
    }
  ],
  // Material-UI와의 호환성을 위한 중요도 설정
  corePlugins: {
    preflight: false, // Material-UI의 기본 스타일과 충돌 방지
  }
}