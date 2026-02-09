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
