# 需求 

不使用关系型数据库进行开发实现逻辑。

需要使用redis进行实现。

1. 记录短剧的点赞数，浏览量，分享量，收藏量. (hash)
2. 记录短剧点赞用户id, 收藏用户id，转发用户id. (去重和计数，zset)
3. 缓存近期热帖内容，帖子内容的占用空间比较大，需要减少数据库压力。（hash）
4. 根剧内容 做推荐。(list)
5. 缓存用户行为历史，过滤恶意行为。(zset, hash)
6. 记录热门短剧列表，总榜，分类榜单。（zset）

功能层次：
1. 需要考虑vshorts项目中，哪些地方需要使用分布式锁的功能。

用户的签到状态
使用bitmap进行存储。一年的时间长度进行计算用户的位图数据逻辑。

#### koa-realize

https://github.com/koajs/koa/blob/master/docs/guide.md
https://github.com/koajs/koa/wiki

qs
@koa/router @types/koa__router
rate-limiter-flexible
koa-bodyparser vs @koa/bodyparser
@koa/send vs koa-static
koa-compress
koa-etag(!!)
koa-session(!!)
koa-passport(!!)
http-assert vs node asset module
koa-logger
koa-compose
koa-convert