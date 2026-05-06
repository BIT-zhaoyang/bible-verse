# 04. 层级、树和图关系

很多业务有层级结构：

- 评论回复
- 组织架构
- 商品分类
- 文件夹
- 地区
- 权限菜单

## Adjacency List

最简单模式：

```text
categories
- id
- parent_id -> categories.id
- name
```

优点：简单。  
缺点：查询整棵树或所有祖先较麻烦。

适合层级不深、数据量不大的场景。

## Materialized Path

保存路径：

```text
categories
- id
- path = "/1/4/9/"
```

查询子树：

```text
where path like '/1/4/%'
```

适合读多写少的树。

## Closure Table

保存所有祖先后代关系：

```text
category_closure
- ancestor_id
- descendant_id
- depth
```

优点：查询祖先和子孙很快。  
缺点：写入和移动节点复杂。

适合复杂层级查询。

## 图关系

社交关系、推荐关系、知识图谱更像图。

简单图可以用边表：

```text
relationships
- from_id
- to_id
- relationship_type
```

复杂图查询可能需要图数据库，但多数 Web 产品初期关系表足够。

## 本章原则

> 层级结构先用 adjacency list；当子树、祖先、移动节点成为核心需求时，再考虑 materialized path 或 closure table。

