// 检查数据库结构的脚本
const { PrismaClient } = require('../app/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // 尝试获取数据库中的表信息
    console.log('检查数据库连接...');
    
    // 尝试查询用户表
    const usersCount = await prisma.user.count();
    console.log(`用户表中有 ${usersCount} 条记录`);
    
    // 尝试查询目标表
    const goalsCount = await prisma.goal.count();
    console.log(`目标表中有 ${goalsCount} 条记录`);
    
    // 尝试查询没有父目标的目标
    const topLevelGoals = await prisma.goal.count({
      where: {
        parentId: null
      }
    });
    console.log(`没有父目标的目标数量: ${topLevelGoals}`);
    
    // 尝试创建一个没有父目标的测试目标
    console.log('尝试创建一个没有父目标的测试目标...');
    const testGoal = await prisma.goal.create({
      data: {
        title: 'Test Goal Without Parent',
        description: 'This is a test goal created by the check-db script',
        level: 'MONTHLY',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30天后
        userId: await getFirstUserId(), // 获取第一个用户的ID
        priority: 1,
        weight: 1.0,
      }
    });
    console.log('成功创建测试目标:', testGoal.id);
    
    // 删除测试目标
    await prisma.goal.delete({
      where: {
        id: testGoal.id
      }
    });
    console.log('已删除测试目标');
    
  } catch (error) {
    console.error('数据库检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function getFirstUserId() {
  const firstUser = await prisma.user.findFirst();
  if (!firstUser) {
    throw new Error('没有找到任何用户');
  }
  return firstUser.id;
}

main()
  .then(() => console.log('数据库检查完成'))
  .catch(e => console.error('脚本执行失败:', e));
