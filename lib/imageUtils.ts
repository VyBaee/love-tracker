import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 0.2, // Nén xuống tối đa 200KB
    maxWidthOrHeight: 1080, // Chiều rộng/cao tối đa 1080px
    useWebWorker: true,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(`Đã nén từ ${file.size / 1024 / 1024}MB xuống ${compressedFile.size / 1024 / 1024}MB`);
    return compressedFile;
  } catch (error) {
    console.error("Lỗi khi nén ảnh:", error);
    return file; // Nếu lỗi thì trả về file gốc để không làm gián đoạn upload
  }
};