import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

// 创建临时目录（如果不存在）
const tempDir = path.join(process.cwd(), "temp");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "未找到文件" },
        { status: 400 }
      );
    }

    // 获取文件扩展名
    const fileExt = path.extname(file.name).toLowerCase();

    // 创建唯一的文件名
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(tempDir, fileName);

    // 将文件保存到临时目录
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    // 根据文件类型处理内容
    let content = "";

    if (fileExt === ".txt" || fileExt === ".md") {
      // 文本文件直接读取
      content = fs.readFileSync(filePath, "utf-8");
    } else if (fileExt === ".pdf") {
      // PDF文件需要额外处理
      // 这里需要安装pdf-parse库
      // 简化起见，这里返回一个提示信息
      content = "PDF文件解析功能正在开发中...";
    } else if (fileExt === ".docx" || fileExt === ".doc") {
      // Word文件需要额外处理
      // 这里需要安装mammoth库
      // 简化起见，这里返回一个提示信息
      content = "Word文件解析功能正在开发中...";
    } else if (fileExt === ".csv") {
      // CSV文件需要额外处理
      // 简化起见，这里返回一个提示信息
      content = "CSV文件解析功能正在开发中...";
    } else if (fileExt === ".json") {
      // JSON文件解析
      try {
        const jsonContent = fs.readFileSync(filePath, "utf-8");
        const jsonData = JSON.parse(jsonContent);
        content = JSON.stringify(jsonData, null, 2);
      } catch (error) {
        content = "JSON文件解析失败，请检查文件格式。";
      }
    } else {
      content = "不支持的文件类型。目前支持 .txt, .md, .json 文件。";
    }

    // 删除临时文件
    fs.unlinkSync(filePath);

    return NextResponse.json(
      {
        success: true,
        content,
        fileName: file.name
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("文件处理失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
