# 03. 电商网站

电商网站的核心不是商品展示，而是交易闭环。

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
Coupon
Review
```

数字商品可以简化物流，但仍要处理支付、订单、交付和售后。

## 核心流程

```text
商品曝光 -> 商品详情 -> 加入购物车 -> 结算 -> 支付 -> 订单 -> 履约 -> 售后 -> 评价/复购
```

## 页面结构

公开侧：

```text
首页
商品列表
商品详情
购物车
结算页
支付成功页
订单详情
退换货说明
```

后台侧：

```text
商品管理
库存管理
订单管理
退款管理
优惠券
物流配置
销售看板
```

## MVP

最小交易闭环：

```text
用户能看到商品 -> 能付款 -> 商家知道买了什么 -> 用户拿到商品
```

极简版可以用：

- 商品详情页
- 支付链接或托管结账
- 订单记录
- 手工履约

可以暂缓：

- 购物车
- 优惠券
- 评价
- 推荐
- 复杂库存
- 自动物流

但不能省：

- 支付结果可信处理
- 订单状态
- 用户联系方式
- 退款处理路径

## 状态机

订单状态：

```text
created -> pending_payment -> paid -> fulfilled -> completed
pending_payment -> canceled
paid -> refund_pending -> refunded
```

库存状态：

```text
available
reserved
sold
returned
```

支付状态：

```text
requires_payment
succeeded
failed
refunded
```

订单、支付、库存不要混成一个状态字段。

## 支付和 Webhook

支付成功必须以后端 Webhook 为准。成功页只是用户体验。

流程：

```text
创建订单 -> 创建支付会话 -> 用户支付 -> Webhook 验签 -> 更新订单和支付 -> 触发履约
```

## 常见坑

第一，只做商品页，没有订单系统。

第二，支付成功靠前端跳转。

第三，不处理库存并发。

第四，没有退款状态。

第五，商品价格变化后订单没有价格快照。

## 数据建模提示

订单项要保存购买时快照：

```text
product_name
sku_name
unit_price
quantity
currency
```

不要只引用当前商品价格。商品价格未来可能变。

## 练习

设计一个卖数字模板的小电商。要求支持：

- 商品详情
- 一次性支付
- 支付后下载
- 退款
- 管理员上传模板文件

