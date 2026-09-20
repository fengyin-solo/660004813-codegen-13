# 蛋白质折叠构象采样与Ramachandran图分析平台

基于Vue 3 + FastAPI，支持二面角空间采样、Ramachandran图、LJ势能计算与Three.js 3D骨架渲染。

## 目标用户
计算生物学家、药物设计研究者、结构生物学方向学生

## 技术栈
- 前端: Vue 3 + TypeScript + Vite + Pinia + Element Plus + ECharts + Three.js
- 后端: Python FastAPI + NumPy
- 数据库: SQLite

## 核心功能
1. 蛋白质骨架二面角空间随机采样
2. Ramachandran图Canvas 2D渲染
3. Lennard-Jones势能函数计算
4. Three.js 3D蛋白骨架球棍模型
5. 构象聚类分析
6. JSON/CSV导出
7. 采样批次本地归档（localStorage）：参数、完成时间与区域分布一并留存，清单按时间排列；支持从归档重新载入结果区、单批导出 JSON，同一批重复归档自动合并
