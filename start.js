const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 환경 변수 설정
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const EXTERNAL_URL = process.env.EXTERNAL_URL || `http://localhost:${PORT}`;

// 간단한 HTTP 서버 시작
const server = http.createServer(handleRequest);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});

// 요청 처리 함수
function handleRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <html>
      <head>
        <title>Botpress Installation</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #333; }
          pre { background: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Botpress Installation Status</h1>
        <p>This server is running on port ${PORT}.</p>
        <p>Please check the logs for installation progress.</p>
        <p>Database URL: ${DATABASE_URL ? 'Configured' : 'Not configured'}</p>
        <p>External URL: ${EXTERNAL_URL}</p>
      </body>
    </html>
  `);
}

console.log('Server is setting up...');
console.log(`Port: ${PORT}`);
console.log(`Database URL: ${DATABASE_URL ? 'Set' : 'Not set'}`);
console.log(`External URL: ${EXTERNAL_URL}`);

// 서비스 상태 출력
console.log('This is a placeholder service for Botpress.');
console.log('Please follow the installation instructions below:');
console.log(`
1. Download Botpress from: https://github.com/botpress/botpress/releases
2. Extract the files
3. Configure your database connection
4. Run the Botpress server
`);

// 시스템 정보 출력
exec('uname -a && node -v && npm -v', (error, stdout) => {
  if (!error) {
    console.log('System information:');
    console.log(stdout);
  }
});
