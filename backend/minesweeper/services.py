import random
from .models import Game, Cell

import random
from .models import Game, Cell

import random
from .models import Game, Cell

def start_game(difficulty):
    if difficulty == 'EASY':
        grid_size = 9
        mine_count = 10
    elif difficulty == 'MEDIUM':
        grid_size = 16
        mine_count = 40
    else:
        grid_size = 20
        mine_count = 99

    # 게임 객체 생성
    game = Game.objects.create(difficulty=difficulty, grid_size=grid_size, mine_count=mine_count, is_active=True)

    cells = []
    for x in range(grid_size):
        for y in range(grid_size):
            cells.append(Cell(game=game, x=x, y=y))

    # 셀 맵을 만들어서 지뢰 배치 및 인접 지뢰 개수 설정
    cell_map = {(cell.x, cell.y): cell for cell in cells}

    # 지뢰 배치
    mines = random.sample(cells, mine_count)
    for mine in mines:
        mine.is_mine = True

    # 인접 지뢰 개수 계산
    for cell in cells:
        if not cell.is_mine:
            cell.adjacent_mines = sum(
                1 for dx in [-1, 0, 1] for dy in [-1, 0, 1]
                if (dx != 0 or dy != 0) and (cell.x + dx, cell.y + dy) in cell_map
                and cell_map[(cell.x + dx, cell.y + dy)].is_mine
            )

    # DB에 한 번에 셀 저장
    Cell.objects.bulk_create(cells)
    return game



def get_adjacent_coords(x, y, grid_size):
    return [
        (x + dx, y + dy)
        for dx in [-1, 0, 1] for dy in [-1, 0, 1]
        if not (dx == 0 and dy == 0)
        and 0 <= x + dx < grid_size
        and 0 <= y + dy < grid_size
    ]

from .models import Cell

def open_cell(game, x, y, flag=False):
    print(f"open_cell 진입 - x:{x}, y:{y}, game_id: {game.id}, flag: {flag}")

    # 게임이 비활성화된 경우
    if not game.is_active:
        print("게임 비활성 상태")
        return None

    try:
        # game과 x, y를 통해 셀 찾기
        cell = Cell.objects.get(game=game, x=x, y=y)
    except Cell.DoesNotExist:
        print(f"셀을 찾을 수 없음: game_id={game.id}, x={x}, y={y}")
        return None

    print(f"Cell 정보: {cell}")

    # 셀이 이미 열려있다면
    if cell.is_open:
        # 숫자가 적혀있는 셀이라면, 해당 숫자만큼 주변에 깃발이 꽂혀있는지 확인
        if cell.adjacent_mines > 0:
            flagged_count = 0
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < game.grid_size and 0 <= ny < game.grid_size:
                        adjacent_cell = Cell.objects.get(game=game, x=nx, y=ny)
                        if adjacent_cell.is_flagged:
                            flagged_count += 1
            # 주변 셀에 깃발 개수가 해당 셀의 숫자와 맞지 않으면 클릭 불가능
            if flagged_count != cell.adjacent_mines:
                print(f"주변 셀에 깃발이 {flagged_count}개로, {cell.adjacent_mines}개여야만 셀을 열 수 있습니다.")
                return game

            # 깃발이 정확하게 맞다면, 주변 셀을 연다
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < game.grid_size and 0 <= ny < game.grid_size:
                        # 인접한 셀 열기
                        adjacent_cell = Cell.objects.get(game=game, x=nx, y=ny)
                        if not adjacent_cell.is_open and not adjacent_cell.is_flagged:
                            open_cell(game, nx, ny)
                            
        return game
    if cell.is_flagged:
        print(f"셀 ({x}, {y}) 은 깃발이 꽂혀 있어서 열 수 없습니다.")
        return game

    # 셀을 열기 처리
    cell.is_open = True
    cell.save()

    if cell.is_mine:
        for mine_cell in Cell.objects.filter(game=game, is_mine=True):
            mine_cell.is_open = True
            mine_cell.save()
        game.is_lost = True
        game.is_active = False
        game.save()
        return game
    
    # 인접 셀을 여는 재귀 처리
    if cell.adjacent_mines == 0:
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if 0 <= nx < game.grid_size and 0 <= ny < game.grid_size:
                    # 인접한 셀 열기
                    open_cell(game, nx, ny)

    # 게임 승리 여부 확인
    if all(cell.is_open or cell.is_mine for cell in game.cells.all()):
        game.is_won = True
        game.is_active = False
        game.save()

    # 게임 패배 여부 확인
    if cell.is_mine:
        game.is_lost = True
        game.is_active = False
        game.save()

    return game





def flag_cell(game, x, y):
    print(f"flag_cell 진입 - x:{x}, y:{y}, game_id: {game.id}")

    # 게임이 비활성화된 경우
    if not game.is_active:
        print("게임 비활성 상태")
        return None

    try:
        # game과 x, y를 통해 셀 찾기
        cell = Cell.objects.get(game=game, x=x, y=y)
    except Cell.DoesNotExist:
        print(f"셀을 찾을 수 없음: game_id={game.id}, x={x}, y={y}")
        return None

    # 셀의 플래그 상태를 토글
    cell.is_flagged = not cell.is_flagged
    cell.save()

    return game
