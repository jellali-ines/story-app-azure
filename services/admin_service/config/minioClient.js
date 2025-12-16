const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',   // ton hôte MinIO
  port: 9000,              // port MinIO
  useSSL: false,           // true si tu utilises https
  accessKey: 'minio',
  secretKey: 'minio12345',
});

module.exports = minioClient;
