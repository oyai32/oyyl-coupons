## 功能说明

#### 分享方：
+ 分享优惠券信息，请好友帮忙助力（授权登录后可操作）
+ 若邀请人数不足，则提示还差多少人
+ 若邀请人数满足，则可使用该券

> 注：不含使用优惠券相关功能

#### 助力方：
+ 点击好友发送的分享信息框进入小程序
+ 点击助力按钮，即可帮好友助力（助力即授权登录）
+ 若助力成功，则提示助力成功
+ 若好友已助力完毕，则提示助力已满

## 数据库设计
+ user 用户表，存用户信息
+ coupons 优惠券表，存优惠券信息
+ user-coupons 用户的优惠券表，存用户与优惠券的对应关系（只要用户操作过该优惠券，如：领取、分享，则回插上一条数据）

## 运行配置

+ mainifest.json 配置自己小程序的appId

+ 若不能直接识别到云服务器，则需手动将uniCloud下对应的云函数剪切到自己的云数据库目录下

+ 修改 common/wx-auth/index.js 里的wxConfigMp，并上传所有云函数 

+ 使用db_init.json 初始化数据库 【试运行前请勿删除数据库初始数据】

> 注：使用阿里云和腾讯云都可以，直接复制云函数就行 （本例使用的是阿里云）


## 编译说明

+ 普通编译：正常运行，默认进入优惠券列表
+ help编译：模拟助力方，默认打开助力弹窗

> pages.json 中已配置好condition，其中userCouponId=60277ef080533800016504b0为oyyl-user-coupons表中的_id

