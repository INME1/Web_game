const questions = [
    {
      id: 1,
      question: "친구가 갑자기 의식을 잃고 쓰러졌습니다. 당신은?",
      options: [
        { text: "즉시 119에 신고하고 의식 확인을 한다.", score: 3 },
        { text: "물을 뿌리며 친구를 깨운다.", score: 1 },
        { text: "친구를 흔들며 소리를 지른다.", score: 2 },
      ],
    },
    {
      id: 2,
      question: "친구가 전기 코드에 손을 대고 감전된 것 같습니다. 당신은?",
      options: [
        { text: "전원을 먼저 끄고 친구를 확인한다.", score: 3 },
        { text: "친구를 당겨서 떨어뜨린다.", score: 1 },
        { text: "그냥 놀라서 도망친다.", score: 0 },
      ],
    },
    {
      id: 3,
      question: "친구가 갑자기 코피를 흘립니다. 당신은?",
      options: [
        { text: "고개를 숙이게 하고 콧잔등을 눌러준다.", score: 3 },
        { text: "고개를 뒤로 젖히게 한다.", score: 1 },
        { text: "그냥 휴지를 주고 멀찍이 떨어진다.", score: 0 },
      ],
    },
    {
      id: 4,
      question: "누군가 뜨거운 물에 화상을 입었습니다. 당신은?",
      options: [
        { text: "찬물에 충분히 식히고 병원으로 간다.", score: 3 },
        { text: "연고를 잔뜩 바른다.", score: 1 },
        { text: "얼음을 대고 참게 한다.", score: 2 },
      ],
    },
    {
      id: 5,
      question: "친구가 팔을 부여잡고 “움직일 수 없어”라고 말합니다. 당신은?",
      options: [
        { text: "움직이지 않도록 고정하고 병원으로 데려간다.", score: 3 },
        { text: "괜찮은지 확인하며 손목을 살짝 흔든다.", score: 1 },
        { text: "일단 눕히고 쉬게 한다.", score: 2 },
      ],
    },
    {
      id: 6,
      question: "친구가 실수로 약을 많이 먹은 것 같습니다. 당신은?",
      options: [
        { text: "토하게 하지 말고 즉시 119에 신고한다.", score: 3 },
        { text: "억지로 토하게 만든다.", score: 1 },
        { text: "물을 많이 마시게 한다.", score: 2 },
      ],
    },
    {
      id: 7,
      question: "여름 야외 행사에서 친구가 어지럽다고 쓰러졌습니다. 당신은?",
      options: [
        { text: "시원한 곳으로 옮기고 수분을 공급한다.", score: 3 },
        { text: "그냥 누워서 쉬라고 한다.", score: 1 },
        { text: "부채로 바람을 쐰다.", score: 2 },
      ],
    },
    {
      id: 8,
      question: "응급상황이 발생했을 때 당신은 보통 어떤 편인가요?",
      options: [
        { text: "머릿속으로 매뉴얼처럼 생각하고 움직인다.", score: 3 },
        { text: "누가 시키면 잘 따라한다.", score: 2 },
        { text: "당황은 하지만, 몸이 먼저 반응한다.", score: 1 },
      ],
    },
  ];
  
  export default questions;
  