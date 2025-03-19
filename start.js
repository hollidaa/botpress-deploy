const fs = require('fs');
const path = require('path');
const https = require('https');
const { exec } = require('child_process');

// 다운로드할 Botpress 버전
const BOTPRESS_VERSION = 'v12.30.10';
const BOTPRESS_URL = `https://github.com/botpress/botpress/releases/download/${BOTPRESS_VERSION}/bp-${process.platform}-x64.zip`;

// 환경 변수 설정
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const EXTERNAL_URL = process.env.EXTERNAL_URL;
const PG_SSL = process.env.PG_SSL || 'true';

console.log('Starting Botpress deployment...');

// 이미 설치되어 있는지 확인
if (!fs.existsSync('./bp')) {
  console.log(`Downloading Botpress ${BOTPRESS_VERSION}...`);
  
  // 압축 파일 다운로드
  const file = fs.createWriteStream('botpress.zip');
  https.get(BOTPRESS_URL, (response) => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed. Extracting...');
      
      // 압축 해제
      exec('unzip botpress.zip && chmod +x ./bp', (error) => {
        if (error) {
          console.error('Error extracting Botpress:', error);
          return;
        }
        console.log('Extraction completed.');
        startBotpress();
      });
    });
  }).on('error', (err) => {
    fs.unlink('botpress.zip');
    console.error('Error downloading Botpress:', err);
  });
} else {
  console.log('Botpress is already installed.');
  startBotpress();
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
