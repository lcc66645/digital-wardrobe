/**
 * 数字衣橱种子数据脚本
 * 运行：npm run seed（ts-node prisma/seed.ts）
 *
 * 幂等设计：仅以固定的 seed 手机号 / 设备 SN 为作用域，先清理上一轮 seed 数据
 * （用户删除走 onDelete 级联，设备按 SN 单独删除），再整体重建；
 * 不会触碰作用域之外的任何历史数据，可安全重复执行，结果确定。
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ---- 作用域标识（清理与重建都只认这些）----
const SEED_PHONES = [
  '13900000001',
  '13900000002',
  '13900000003',
  '13900000004',
  '13900000005',
];
const SEED_DEVICE_SNS = ['DW-SEED-001', 'DW-SEED-002', 'DW-SEED-003'];

const SEED_PASSWORD = '123456';
const BCRYPT_ROUNDS = 10;
const dayMs = 24 * 60 * 60 * 1000;
const daysAgo = (n: number): Date => new Date(Date.now() - n * dayMs);
const jarr = (v: unknown[]): string => JSON.stringify(v);
const img = (key: string): string =>
  `https://cdn.digital-wardrobe.local/seed/${key}.jpg`;

async function main(): Promise<void> {
  console.log('== 清理上一轮 seed 数据（作用域内）==');
  const deletedDevices = await prisma.device.deleteMany({
    where: { sn: { in: SEED_DEVICE_SNS } },
  });
  const deletedUsers = await prisma.user.deleteMany({
    where: { phone: { in: SEED_PHONES } },
  });
  console.log(
    `删除设备 ${deletedDevices.count} 台、用户 ${deletedUsers.count} 个（关联数据随级联清除）`,
  );

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS);

  // ---------------- 用户 ----------------
  console.log('== 创建用户 ==');
  const u1 = await prisma.user.create({
    data: {
      phone: '13900000001',
      nickname: '林小衣',
      passwordHash,
      avatar: img('avatar-1'),
      gender: 'FEMALE',
      signature: '把每件衣服都穿成喜欢的样子',
      city: '杭州',
      height: 165,
      style: '温柔通勤',
      status: 'ACTIVE',
    },
  });
  const u2 = await prisma.user.create({
    data: {
      phone: '13900000002',
      nickname: '陈穿搭',
      passwordHash,
      avatar: img('avatar-2'),
      gender: 'MALE',
      signature: '极简衣柜爱好者',
      city: '上海',
      height: 180,
      style: '极简机能',
      status: 'ACTIVE',
    },
  });
  const u3 = await prisma.user.create({
    data: {
      phone: '13900000003',
      nickname: '苏小格',
      passwordHash,
      avatar: img('avatar-3'),
      gender: 'FEMALE',
      signature: '色彩搭配实验中',
      city: '北京',
      height: 160,
      style: '复古甜酷',
      status: 'ACTIVE',
    },
  });
  const u4 = await prisma.user.create({
    data: {
      phone: '13900000004',
      nickname: '王衣橱',
      passwordHash,
      avatar: img('avatar-4'),
      gender: 'MALE',
      city: '广州',
      height: 175,
      status: 'ACTIVE',
    },
  });
  const u5 = await prisma.user.create({
    data: {
      phone: '13900000005',
      nickname: '违规测试用户',
      passwordHash,
      gender: 'UNKNOWN',
      city: '深圳',
      status: 'BANNED',
    },
  });

  // ---------------- 衣物 ----------------
  console.log('== 创建衣物 ==');
  const c1 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '奶白色针织开衫',
      category: 'TOP',
      color: '米白',
      seasons: jarr(['SPRING', 'AUTUMN']),
      occasion: 'WORK',
      imageUrl: img('c-knit'),
      purchasePrice: 299,
      wearCount: 23,
      status: 'IN_USE',
      tags: jarr(['通勤', '百搭']),
    },
  });
  const c2 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '高腰直筒牛仔裤',
      category: 'BOTTOM',
      color: '深蓝',
      seasons: jarr(['SPRING', 'AUTUMN', 'WINTER']),
      occasion: 'CASUAL',
      imageUrl: img('c-jeans'),
      purchasePrice: 359,
      wearCount: 41,
      status: 'IN_USE',
      tags: jarr(['显高']),
    },
  });
  const c3 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '驼色双面呢大衣',
      category: 'OUTERWEAR',
      color: '驼色',
      seasons: jarr(['WINTER']),
      occasion: 'FORMAL',
      imageUrl: img('c-coat'),
      purchasePrice: 1299,
      wearCount: 12,
      status: 'IN_USE',
      tags: jarr(['质感', '冬季']),
    },
  });
  const c4 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '碎花连衣裙',
      category: 'DRESS',
      color: '粉底碎花',
      seasons: jarr(['SPRING', 'SUMMER']),
      occasion: 'DATE',
      imageUrl: img('c-dress'),
      purchasePrice: 459,
      wearCount: 8,
      status: 'STORED',
      tags: jarr(['约会']),
    },
  });
  const c5 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '白色小白鞋',
      category: 'SHOES',
      color: '白',
      seasons: jarr(['SPRING', 'SUMMER', 'AUTUMN']),
      occasion: 'CASUAL',
      imageUrl: img('c-shoes'),
      purchasePrice: 399,
      wearCount: 56,
      status: 'IN_USE',
    },
  });
  const c6 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '旧帆布托特包',
      category: 'BAG',
      color: '卡其',
      seasons: jarr(['SPRING', 'SUMMER', 'AUTUMN']),
      occasion: 'CASUAL',
      imageUrl: img('c-bag'),
      purchasePrice: 159,
      wearCount: 33,
      status: 'DONATED',
    },
  });
  const c7 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '金属细框眼镜',
      category: 'ACCESSORY',
      color: '金',
      seasons: jarr(['SPRING', 'SUMMER', 'AUTUMN', 'WINTER']),
      occasion: 'WORK',
      imageUrl: img('c-glasses'),
      purchasePrice: 259,
      wearCount: 70,
      status: 'IN_USE',
    },
  });
  const c8 = await prisma.clothing.create({
    data: {
      userId: u1.id,
      name: '起球旧毛衣',
      category: 'TOP',
      color: '灰',
      seasons: jarr(['WINTER']),
      occasion: 'HOME',
      purchasePrice: 129,
      wearCount: 88,
      status: 'DISCARDED',
    },
  });

  // u2 衣物
  const b1 = await prisma.clothing.create({
    data: {
      userId: u2.id,
      name: '黑色机能冲锋衣',
      category: 'OUTERWEAR',
      color: '黑',
      seasons: jarr(['AUTUMN', 'WINTER']),
      occasion: 'SPORT',
      imageUrl: img('b-jacket'),
      purchasePrice: 899,
      wearCount: 15,
      status: 'IN_USE',
      tags: jarr(['机能', '防水']),
    },
  });
  const b2 = await prisma.clothing.create({
    data: {
      userId: u2.id,
      name: '灰色工装裤',
      category: 'BOTTOM',
      color: '灰',
      seasons: jarr(['SPRING', 'AUTUMN']),
      occasion: 'CASUAL',
      imageUrl: img('b-pants'),
      purchasePrice: 329,
      wearCount: 19,
      status: 'IN_USE',
    },
  });
  const b3 = await prisma.clothing.create({
    data: {
      userId: u2.id,
      name: '黑色跑鞋',
      category: 'SHOES',
      color: '黑',
      seasons: jarr(['SPRING', 'SUMMER', 'AUTUMN']),
      occasion: 'SPORT',
      imageUrl: img('b-shoes'),
      purchasePrice: 599,
      wearCount: 27,
      status: 'RESOLD',
    },
  });

  // u3 衣物
  const s1 = await prisma.clothing.create({
    data: {
      userId: u3.id,
      name: '复古格纹西装外套',
      category: 'OUTERWEAR',
      color: '格纹',
      seasons: jarr(['AUTUMN']),
      occasion: 'WORK',
      imageUrl: img('s-blazer'),
      purchasePrice: 699,
      wearCount: 9,
      status: 'IN_USE',
    },
  });
  const s2 = await prisma.clothing.create({
    data: {
      userId: u3.id,
      name: '百褶半裙',
      category: 'BOTTOM',
      color: '藏青',
      seasons: jarr(['SPRING', 'SUMMER']),
      occasion: 'DATE',
      imageUrl: img('s-skirt'),
      purchasePrice: 289,
      wearCount: 11,
      status: 'IN_USE',
    },
  });

  // u4 少量衣物
  const w1 = await prisma.clothing.create({
    data: {
      userId: u4.id,
      name: '基础白T恤',
      category: 'TOP',
      color: '白',
      seasons: jarr(['SUMMER']),
      occasion: 'CASUAL',
      purchasePrice: 99,
      wearCount: 30,
      status: 'IN_USE',
    },
  });

  // ---------------- 穿搭 + 单品关联 ----------------
  console.log('== 创建穿搭与单品关联 ==');
  const o1 = await prisma.outfit.create({
    data: {
      userId: u1.id,
      date: daysAgo(2),
      mood: 'HAPPY',
      imageUrl: img('o-1'),
      content: '通勤温柔感，开衫配牛仔裤真的很耐看',
      tags: jarr(['通勤', '温柔']),
      isPublished: true,
      auditStatus: 'APPROVED',
      likeCount: 2,
      commentCount: 3,
    },
  });
  await prisma.outfitItem.createMany({
    data: [
      { outfitId: o1.id, clothingId: c1.id },
      { outfitId: o1.id, clothingId: c2.id },
      { outfitId: o1.id, clothingId: c5.id },
    ],
  });

  const o2 = await prisma.outfit.create({
    data: {
      userId: u1.id,
      date: daysAgo(1),
      mood: 'CONFIDENT',
      imageUrl: img('o-2'),
      content: '正式场合的大衣气场',
      tags: jarr(['正式', '冬季']),
      isPublished: true,
      auditStatus: 'PENDING',
    },
  });
  await prisma.outfitItem.createMany({
    data: [
      { outfitId: o2.id, clothingId: c3.id },
      { outfitId: o2.id, clothingId: c7.id },
    ],
  });

  const o3 = await prisma.outfit.create({
    data: {
      userId: u1.id,
      date: daysAgo(0),
      mood: 'LAZY',
      imageUrl: img('o-3'),
      content: '居家随手记录（未发布）',
      tags: jarr(['居家']),
      isPublished: false,
      auditStatus: 'PENDING',
    },
  });
  await prisma.outfitItem.create({
    data: { outfitId: o3.id, clothingId: c8.id },
  });

  const o4 = await prisma.outfit.create({
    data: {
      userId: u2.id,
      date: daysAgo(3),
      mood: 'ENERGETIC',
      imageUrl: img('o-4'),
      content: '周末户外机能风',
      tags: jarr(['机能', '户外']),
      isPublished: true,
      auditStatus: 'APPROVED',
      likeCount: 1,
      commentCount: 0,
    },
  });
  await prisma.outfitItem.createMany({
    data: [
      { outfitId: o4.id, clothingId: b1.id },
      { outfitId: o4.id, clothingId: b2.id },
    ],
  });

  const o5 = await prisma.outfit.create({
    data: {
      userId: u3.id,
      date: daysAgo(4),
      mood: 'CALM',
      imageUrl: img('o-5'),
      content: '复古格纹的秋日通勤',
      tags: jarr(['复古', '通勤']),
      isPublished: true,
      auditStatus: 'APPROVED',
      commentCount: 0,
    },
  });
  await prisma.outfitItem.createMany({
    data: [
      { outfitId: o5.id, clothingId: s1.id },
      { outfitId: o5.id, clothingId: s2.id },
    ],
  });

  // ---------------- 评论（含二级回复） ----------------
  console.log('== 创建评论 ==');
  const cm1 = await prisma.comment.create({
    data: { outfitId: o1.id, userId: u2.id, content: '这套配色好舒服，求链接！' },
  });
  const cm2 = await prisma.comment.create({
    data: { outfitId: o1.id, userId: u3.id, content: '开衫和牛仔裤很显气质' },
  });
  await prisma.comment.create({
    data: {
      outfitId: o1.id,
      userId: u1.id,
      content: '谢谢喜欢～开衫是去年的款啦',
      parentId: cm1.id,
    },
  });

  // ---------------- 点赞 / 收藏 / 关注 ----------------
  console.log('== 创建互动关系 ==');
  await prisma.like.createMany({
    data: [
      { userId: u2.id, outfitId: o1.id },
      { userId: u3.id, outfitId: o1.id },
      { userId: u1.id, outfitId: o4.id },
    ],
  });
  await prisma.favorite.create({
    data: { userId: u3.id, outfitId: o1.id },
  });
  await prisma.follow.createMany({
    data: [
      { followerId: u2.id, followingId: u1.id },
      { followerId: u3.id, followingId: u1.id },
      { followerId: u1.id, followingId: u2.id },
    ],
  });

  // ---------------- 硬件设备 ----------------
  console.log('== 创建设备 ==');
  await prisma.device.create({
    data: {
      sn: 'DW-SEED-001',
      userId: u1.id,
      firmwareVersion: '1.4.2',
      battery: 86,
      onlineStatus: 'ONLINE',
      lastOnlineAt: daysAgo(0),
    },
  });
  await prisma.device.create({
    data: {
      sn: 'DW-SEED-002',
      userId: u2.id,
      firmwareVersion: '1.3.0',
      battery: 42,
      onlineStatus: 'OFFLINE',
      lastOnlineAt: daysAgo(5),
    },
  });
  // 未绑定的空闲设备（后台硬件列表需要展示无主设备）
  await prisma.device.create({
    data: {
      sn: 'DW-SEED-003',
      userId: null,
      firmwareVersion: '1.4.2',
      battery: 100,
      onlineStatus: 'OFFLINE',
      lastOnlineAt: null,
    },
  });

  // ---------------- 通知 ----------------
  console.log('== 创建通知 ==');
  await prisma.notification.createMany({
    data: [
      {
        userId: u1.id,
        type: 'INTERACTION',
        title: '陈穿搭 赞了你的穿搭',
        content: '通勤温柔感，开衫配牛仔裤真的很耐看',
        isRead: false,
      },
      {
        userId: u1.id,
        type: 'INTERACTION',
        title: '苏小格 评论了你',
        content: '开衫和牛仔裤很显气质',
        isRead: false,
      },
      {
        userId: u1.id,
        type: 'RECOMMEND',
        title: '今日穿搭推荐已生成',
        content: '根据天气与你的衣橱，为你准备了 3 套搭配',
        isRead: true,
      },
      {
        userId: u1.id,
        type: 'DEVICE',
        title: '智能硬件电量提醒',
        content: '你的拍照硬件电量低于 50%，建议及时充电',
        isRead: false,
      },
      {
        userId: u1.id,
        type: 'SYSTEM',
        title: '欢迎使用数字衣橱',
        content: '完成第一件衣物录入，开启智能穿搭之旅',
        isRead: true,
      },
    ],
  });

  // ---------------- 意见反馈 ----------------
  console.log('== 创建意见反馈 ==');
  await prisma.feedback.createMany({
    data: [
      {
        userId: u1.id,
        type: 'BUG',
        content: '拍照识别后点保存偶尔闪退',
        screenshot: img('fb-bug'),
        contact: '13900000001',
        handleStatus: 'PENDING',
      },
      {
        userId: u1.id,
        type: 'SUGGESTION',
        content: '希望增加按颜色筛选衣橱的功能',
        handleStatus: 'PROCESSING',
      },
      {
        userId: u1.id,
        type: 'COMPLAINT',
        content: '推荐内容重复度较高',
        handleStatus: 'RESOLVED',
      },
      {
        userId: u2.id,
        type: 'OTHER',
        content: '其他使用问题反馈',
        handleStatus: 'PENDING',
      },
    ],
  });

  // ---------------- 汇总 ----------------
  console.log('== 种子数据完成，各表计数 ==');
  const counts = {
    user: await prisma.user.count({ where: { phone: { in: SEED_PHONES } } }),
    clothing: await prisma.clothing.count({ where: { userId: u1.id } }),
    outfit: await prisma.outfit.count(),
    outfitItem: await prisma.outfitItem.count(),
    comment: await prisma.comment.count(),
    like: await prisma.like.count(),
    favorite: await prisma.favorite.count(),
    follow: await prisma.follow.count(),
    device: await prisma.device.count({ where: { sn: { in: SEED_DEVICE_SNS } } }),
    notification: await prisma.notification.count(),
    feedback: await prisma.feedback.count(),
  };
  console.log(JSON.stringify(counts, null, 2));
  console.log(`所有 seed 用户登录密码均为：${SEED_PASSWORD}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('种子数据执行失败：', e);
    await prisma.$disconnect();
    process.exit(1);
  });
