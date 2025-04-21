import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';

// OSS客户端配置
let ossClient: OSS | null = null;

// 初始化OSS客户端
export function initOssClient() {
  if (ossClient) return ossClient;
  
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
  const region = process.env.OSS_REGION;
  const bucket = process.env.OSS_BUCKET;
  
  if (!accessKeyId || !accessKeySecret || !region || !bucket) {
    throw new Error('OSS configuration is missing');
  }
  
  ossClient = new OSS({
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
  });
  
  return ossClient;
}

// 生成OSS存储路径
export function generateOssPath(userId: string, fileName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const uniqueId = uuidv4();
  const extension = fileName.split('.').pop() || '';
  
  return `users/${userId}/${year}/${month}/${day}/${uniqueId}.${extension}`;
}

// 上传文件到OSS
export async function uploadToOss(
  buffer: Buffer,
  ossPath: string,
  mimeType: string
): Promise<string> {
  try {
    const client = initOssClient();
    
    const result = await client.put(ossPath, buffer, {
      mime: mimeType,
    });
    
    return result.url; // 返回文件URL
  } catch (error) {
    console.error('OSS upload error:', error);
    throw new Error('Failed to upload file to OSS');
  }
}

// 获取文件下载URL（带签名的临时URL）
export async function getDownloadUrl(ossPath: string): Promise<string> {
  try {
    const client = initOssClient();
    
    // 生成一个有效期为1小时的签名URL
    const url = client.signatureUrl(ossPath, {
      expires: 3600, // 1小时有效期
      response: {
        'content-disposition': `attachment`,
      },
    });
    
    return url;
  } catch (error) {
    console.error('OSS get download URL error:', error);
    throw new Error('Failed to generate download URL');
  }
}

// 删除OSS文件
export async function deleteFromOss(ossPath: string): Promise<void> {
  try {
    const client = initOssClient();
    await client.delete(ossPath);
  } catch (error) {
    console.error('OSS delete error:', error);
    throw new Error('Failed to delete file from OSS');
  }
}
