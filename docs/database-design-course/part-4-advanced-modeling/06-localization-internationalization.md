# 06. 多语言、地域化和国际化数据

国际化不是只把字符串翻译一下。数据库也要设计多语言和地域化数据。

## 简单字段

如果只支持一种语言：

```text
products.name
products.description
```

够用。

## 翻译表

支持多语言时：

```text
products
- id
- sku

product_translations
- product_id
- locale
- name
- description
```

约束：

```text
unique(product_id, locale)
```

## 默认语言

需要决定：

- 默认 locale 是什么
- 翻译缺失时是否 fallback
- slug 是否按语言不同

可能设计：

```text
product_translations.slug
unique(locale, slug)
```

## 地域化

地域化不只是语言，还包括：

- 货币
- 税率
- 日期格式
- 可售地区
- 法律条款

价格通常不能只翻译，要按地区建模：

```text
regional_prices
- product_id
- region
- currency
- amount_cents
```

## 时区

用户本地时间和业务结算时间要区分。

存储精确时刻用 timestamp with time zone。  
业务日期要明确使用哪个 timezone 计算。

## 本章原则

> 多语言内容用翻译表，地域化规则用地区维度建模；不要把语言、货币、税率和时区混成一个字符串字段。

