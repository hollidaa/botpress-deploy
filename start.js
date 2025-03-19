const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { exec } = require('child_process');

// 다운로드할 Botpress 버전
const BOTPRESS_VERSION = 'v12.30.10';
const BOTPRESS_URL = `https://s3.amazonaws.com/botpress-binaries/botpress-${BOTPRESS_VERSION}-darwin-x64.zip`;

// 환경 변수 설정
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const EXTERNAL_URL = process.env.EXTERNAL_URL;
const PG_SSL = process.env.PG_SSL || 'true';

console.log('Starting Botpress deployment...');
console.log(`Using URL: ${BOTPRESS_URL}`);

// HTTP 서버 시작
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Botpress is starting...');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server listening on port ${PORT}`);
});

// 이미 설치되어 있는지 확인
if (!fs.existsSync('./bp')) {
  console.log(`Downloading Botpress ${BOTPRESS_VERSION}...`);
  
  // 압축 파일 다운로드
  const file = fs.createWriteStream('botpress.zip');
  https.get(BOTPRESS_URL, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download: Status code ${response.statusCode}`);
      console.log('Trying alternative URL...');
      file.close();
      fs.unlinkSync('botpress.zip');
      
      // 대체 URL 시도
      const alternativeURL = `https://github.com/botpress/botpress/releases/download/${BOTPRESS_VERSION}/bp-linux-x64.zip`;
      console.log(`Using alternative URL: ${alternativeURL}`);
      
      const file2 = fs.createWriteStream('botpress.zip');
      https.get(alternativeURL, (response2) => {
        response2.pipe(file2);
        file2.on('finish', () => {
          file2.close();
          extractAndStart();
        });
      }).on('error', logError);
      
      return;
    }
    
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      extractAndStart();
    });
  }).on('error', logError);
} else {
  console.log('Botpress is already installed.');
  startBotpress();
}

function extractAndStart() {
  console.log('Download completed. Extracting...');
  // 파일 크기 확인
  const stats = fs.statSync('botpress.zip');
  console.log(`Downloaded file size: ${stats.size} bytes`);
  
  // 압축 해제
  exec('unzip -o botpress.zip && chmod +x ./bp', (error) => {
    if (error) {
      console.error('Error extracting Botpress:', error);
      console.log('Listing directory contents:');
      exec('ls -la', (err, stdout) => {
        if (!err) console.log(stdout);
        
        // 직접 바이너리 다운로드 시도
        console.log('Trying to download binary directly...');
        const binaryUrl = `https://github.com/botpress/botpress/releases/download/${BOTPRESS_VERSION}/bp-linux-x64`;
        const binaryFile = fs.createWriteStream('bp');
        https.get(binaryUrl, (response) => {
          response.pipe(binaryFile);
          binaryFile.on('finish', () => {
            binaryFile.close();
            exec('chmod +x ./bp', (err) => {
              if (err) console.error('Error setting permissions:', err);
              startBotpress();
            });
          });
        }).on('error', logError);
      });
      return;
    }
    console.log('Extraction completed.');
    startBotpress();
  });
}

function startBotpress() {
  console.log('Starting Botpress server...');
  console.log(`Port: ${PORT}`);
  console.log(`Database URL: ${DATABASE_URL ? 'Set' : 'Not set'}`);
  console.log(`External URL: ${EXTERNAL_URL ? 'Set' : 'Not set'}`);
  
  // Botpress 시작
  const botpress = exec(`./bp --port ${PORT}`);
  
  botpress.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  
  botpress.stderr.on('data', (data) => {
    console.error(data.toString());
  });
  
  botpress.on('close', (code) => {
    console.log(`Botpress process exited with code ${code}`);
  });
}

function logError(err) {
  console.error('Error downloading Botpress:', err);
  fs.unlink('botpress.zip', () => {});
}
