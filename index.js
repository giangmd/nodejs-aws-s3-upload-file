// import các gói cài đặt cần thiết
const fs = require("fs");
const AWS = require("aws-sdk");
const path = require("path");
const mime = require("mime");
const { v4: uuidv4 } = require('uuid');

// config AWS S3 info
const BUCKET_NAME = "bucket_name";
const IAM_USER_KEY = "iam_user_key";
const IAM_USER_SECRET = "iam_secret_key";

// Cấu hình để có thể đọc được file upload lên. Có thể xem thêm ở https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html
const FILE_PERMISSION = 'public-read';

const s3bucket = new AWS.S3({
  accessKeyId: IAM_USER_KEY,
  secretAccessKey: IAM_USER_SECRET
});

const uploadToS3 = (fileName) => {
  // dùng fs đọc file và upload
  fs.readFile(fileName, (err, data) => {
    if (err) throw err; // dừng chương trình khi fs đọc file có lỗi

    const readStream = fs.createReadStream(fileName); // kiểu dữ liệu upload lên được đọc từ stream
    const params = {
      Bucket: BUCKET_NAME,
      Key: uuidv4() + path.extname(fileName), // file sau khi upload thành công lên S3 sẽ có dạng BUCKET_NAME/[random_uuid] + [phần mở rộng của file upload]
      Body: readStream,
      ContentType: mime.getType(fileName), // chú ý param này để file có thể mở xem trực tiếp từ trình duyệt
      ACL: FILE_PERMISSION
    };

    // Dùng promise để upload
    return new Promise((resolve, reject) => {
      s3bucket.upload(params, function(err, data) {
        readStream.destroy();

        if (err) {
          return reject(err);
        }

        console.log(`File uploaded successfully at ${data.Location}`);
        return resolve(data);
      }); //end upload
    }); //end promise

  });
};

// gọi hàm chạy test
const fileName = path.basename("aws-s3.png");
uploadToS3(fileName);