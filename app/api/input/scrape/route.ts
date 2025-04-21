import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "未授权访问" },
        { status: 401 }
      );
    }

    const { url, extractImages, extractLinks } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL不能为空" },
        { status: 400 }
      );
    }

    // 抓取网页内容
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: "无法访问该URL" },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 提取标题
    const title = $("title").text().trim();

    // 移除不需要的元素
    $("script, style, nav, footer, header, aside, iframe, noscript").remove();

    // 处理图片
    if (!extractImages) {
      $("img").remove();
    } else {
      $("img").each((_, el) => {
        const img = $(el);
        const src = img.attr("src");
        const alt = img.attr("alt") || "";

        if (src) {
          // 转换为绝对URL
          let absoluteSrc = src;
          if (src.startsWith("/")) {
            const urlObj = new URL(url);
            absoluteSrc = `${urlObj.origin}${src}`;
          } else if (!src.startsWith("http")) {
            absoluteSrc = new URL(src, url).href;
          }

          img.replaceWith(`![${alt}](${absoluteSrc})`);
        } else {
          img.remove();
        }
      });
    }

    // 处理链接
    if (!extractLinks) {
      $("a").each((_, el) => {
        const a = $(el);
        a.replaceWith(a.text());
      });
    } else {
      $("a").each((_, el) => {
        const a = $(el);
        const href = a.attr("href");
        const text = a.text().trim();

        if (href && text) {
          // 转换为绝对URL
          let absoluteHref = href;
          if (href.startsWith("/")) {
            const urlObj = new URL(url);
            absoluteHref = `${urlObj.origin}${href}`;
          } else if (!href.startsWith("http") && !href.startsWith("#") && !href.startsWith("mailto:")) {
            absoluteHref = new URL(href, url).href;
          }

          a.replaceWith(`[${text}](${absoluteHref})`);
        } else {
          a.replaceWith(text);
        }
      });
    }

    // 提取正文内容
    let content = "";

    // 尝试找到主要内容区域
    const mainContent = $("main, article, #content, .content, .article, .post");

    if (mainContent.length > 0) {
      content = mainContent.first().text().trim();
    } else {
      // 如果找不到主要内容区域，则使用body
      content = $("body").text().trim();
    }

    // 清理内容
    content = content
      .replace(/\\s+/g, " ")
      .replace(/\\n+/g, "\\n")
      .trim();

    return NextResponse.json(
      {
        title,
        content,
        url
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("网页抓取失败:", error);
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    );
  }
}
