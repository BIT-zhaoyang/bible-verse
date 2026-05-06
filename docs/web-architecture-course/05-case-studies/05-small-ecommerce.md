# 05. 案例：小型电商独立站

这个案例代表卖少量实物或数字商品的独立站。

## 一句话定义

```text
这是一个帮助小品牌展示商品、接收付款并管理订单的电商网站。
```

## 角色

```text
游客：浏览商品
买家：下单和查看订单
管理员：管理商品、订单和退款
支付平台：通知支付结果
物流服务：更新发货状态
```

## 核心资源

```text
Product
Sku
Inventory
Cart
Order
OrderItem
Payment
Shipment
Refund
Customer
```

## MVP 流程

```text
商品详情 -> 支付 -> Webhook 确认 -> 订单生成/更新 -> 管理员履约
```

如果商品少，可以先不做购物车，用单商品结账。

## 成熟流程

```text
商品列表
-> 搜索筛选
-> 购物车
-> 优惠券
-> 支付
-> 库存扣减
-> 发货
-> 物流通知
-> 售后退款
-> 评价
```

## 数据快照

订单项必须保存购买时快照：

```text
product_name
sku_name
unit_price
currency
quantity
```

不要只依赖商品当前价格。

## 状态机

订单：

```text
pending_payment -> paid -> fulfilled -> completed
pending_payment -> canceled
paid -> refund_pending -> refunded
```

支付：

```text
requires_payment -> succeeded/failed/refunded
```

发货：

```text
pending -> shipped -> delivered
```

## 常见坑

- 支付成功靠前端跳转
- 没有订单状态
- 没有价格快照
- 库存扣减时机混乱
- 退款没有记录
- 后台无法查看失败支付

## MVP 取舍

可以暂缓：

- 评论
- 推荐
- 会员积分
- 多仓库
- 自动物流

不能暂缓：

- 订单记录
- 支付 Webhook
- 支付状态
- 客户联系方式
- 履约标记

