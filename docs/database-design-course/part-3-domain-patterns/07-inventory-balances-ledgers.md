# 07. 库存、余额和流水账

库存和余额系统不能只存一个当前数字。

如果只存：

```text
products.stock_quantity
```

你无法解释库存为什么变了，也无法可靠纠错。

## 当前余额

```text
inventory_balances
- product_id
- warehouse_id
- available_quantity
- reserved_quantity
```

当前余额服务快速读取。

## 库存流水

```text
inventory_movements
- id
- product_id
- warehouse_id
- movement_type
- quantity_delta
- reference_type
- reference_id
- created_at
```

movement_type：

```text
purchase_received
order_reserved
order_shipped
reservation_released
adjustment
```

流水解释余额变化。

## 余额和流水一致性

写库存变化时，应在同一事务里：

1. 插入 movement
2. 更新 balance

如果失败，两者都回滚。

## 预留库存

电商常需要 reserved quantity。

```text
available_quantity
reserved_quantity
```

下单时先 reserve，发货时扣减，取消时释放。

## 不可变流水

库存流水最好 append-only。错误时新增 adjustment，不要改旧流水。

## 本章原则

> 库存和余额要用“当前余额 + 不可变流水”建模；余额服务读取，流水服务解释和审计。

