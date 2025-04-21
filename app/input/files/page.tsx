import { Metadata } from 'next';
import FileUploader from '@/components/input/FileUploader';
import FileList from '@/components/input/FileList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: '文件管理 | PA个人助手',
  description: '上传、下载和管理您的文件',
};

export default function FilesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">文件管理</h1>
        <p className="text-muted-foreground">上传、下载和管理您的文件</p>
      </div>
      
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList>
          <TabsTrigger value="files">
            <FileText className="h-4 w-4 mr-2" />
            我的文件
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            上传文件
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>我的文件</CardTitle>
              <CardDescription>
                查看和管理您上传的所有文件
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>上传文件</CardTitle>
              <CardDescription>
                上传新文件到您的个人存储空间
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
