# Single Quantum Well Simulator

단일 양자 우물(Single Quantum Well)을 시뮬레이션하여 **에너지 준위**와 **파동 함수**를 시각화하는 웹 앱입니다.

- **잠재력**: 우물 너비(Å)와 깊이(eV)를 옹스트롬/ eV 단위로 입력
- **에너지 준위**: 유한 사각형 우물에서 bound state 에너지를 수치 해석으로 계산
- **파동 함수**: 각 에너지 준위에 대응하는 파동 함수를 우물과 겹치도록 그림

## 로컬 실행

정적 파일만 사용하므로 로컬 웹 서버로 열면 됩니다.

```bash
# Python 3
python -m http.server 8080

# Node (npx)
npx serve .

# 그 다음 브라우저에서 http://localhost:8080
```

## Git & Vercel 배포

1. **저장소에 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial: single quantum well simulator"
   git remote add origin https://github.com/YOUR_USERNAME/single-well.git
   git push -u origin main
   ```

2. **Vercel 배포**
   - [vercel.com](https://vercel.com) 로그인
   - "Add New Project" → GitHub 저장소 `single-well` 선택
   - Framework Preset: **Other**, Root Directory: `.` 그대로
   - Deploy 후 생성된 URL로 접속

## GitHub에서 수정 후 Vercel 다시 배포하기

Vercel을 GitHub 저장소와 연결해 두면 **main 브랜치에 푸시할 때마다 자동으로 다시 배포**됩니다.

### 1) 로컬에서 수정하고 GitHub에 반영

```bash
# 프로젝트 폴더로 이동
cd c:\Users\khkim\Documents\Cursor\single-well

# 변경된 파일 확인
git status

# 변경 사항 스테이징
git add .

# 커밋 (메시지는 수정 내용에 맞게)
git commit -m "그래프 눈금 및 색상 수정"

# GitHub로 푸시 (자동 재배포 트리거)
git push origin main
```

### 2) GitHub 웹에서 직접 수정하는 경우

1. [github.com](https://github.com) → 해당 저장소(`single-well`) 열기  
2. 수정할 파일 클릭 → 연필 아이콘 **Edit**  
3. 내용 수정 후 아래 **Commit changes** → **Commit directly to the main branch** → **Commit**  
4. 저장소를 Vercel에 연결해 두었다면 **몇 분 안에 자동으로 재배포**됨  

### 3) Vercel에서 배포 상태 확인

1. [vercel.com](https://vercel.com) 로그인 → 대시보드  
2. **single-well** 프로젝트 클릭  
3. **Deployments** 탭에서 최신 배포 상태 확인 (Building → Ready)  
4. **Visit** 또는 프로젝트 URL로 사이트 접속해 변경 사항 확인  

### 요약

| 하는 일 | 결과 |
|--------|------|
| 로컬에서 `git push origin main` | GitHub에 반영 + Vercel 자동 재배포 |
| GitHub 웹에서 파일 수정 후 Commit | GitHub에 반영 + Vercel 자동 재배포 |
| Vercel 대시보드 → Deployments | 배포 로그·상태 확인 |

처음 한 번만 Vercel에서 **GitHub 저장소 연결**을 해 두면, 이후에는 **코드를 GitHub에 올리는 것만으로** 다시 배포됩니다.

## 기술

- Vanilla HTML/CSS/JS (ES modules)
- 유한 사각형 우물의 경계 조건에서 에너지 방정식 비선형 해를 이분법으로 계산
- Canvas 2D로 잠재력, 에너지 준위, 파동 함수 동시 시각화

## 파일 구조

```
single-well/
├── index.html      # 진입점
├── css/style.css   # 스타일
├── js/
│   ├── app.js      # UI 및 캔버스 그리기
│   └── physics.js  # 양자 우물 물리 (에너지, 파동함수)
├── vercel.json     # Vercel 정적 배포 설정
├── package.json
├── .gitignore
└── README.md
```

## 물리 설정

- **잠재력**: \( V(x) = 0 \) (\( |x| \le L/2 \)), \( V(x) = V_0 \) (\( |x| > L/2 \))
- **단위**: 길이 Å, 에너지 eV, 전자 질량 사용
- Bound state는 \( 0 < E < V_0 \) 구간에서 짝수/홀수 해를 구해 에너지 준위와 파동 함수를 그림
