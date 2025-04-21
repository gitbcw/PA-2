import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateOssPath, uploadToOss } from '@/lib/oss';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // 验证用户会话
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 解析multipart表单数据
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string || '';
    const tagsString = formData.get('tags') as string || '';
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()) : [];

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 读取文件内容
    const buffer = Buffer.from(await file.arrayBuffer());

    // 生成OSS路径
    const ossPath = generateOssPath(userId, file.name);

    // 上传到OSS
    await uploadToOss(buffer, ossPath, file.type);

    // 在数据库中创建记录
    const importedFile = await prisma.importedFile.create({
      data: {
        userId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        ossPath,
        description,
        tags,
      },
    });

    return NextResponse.json({
      success: true,
      file: importedFile
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
