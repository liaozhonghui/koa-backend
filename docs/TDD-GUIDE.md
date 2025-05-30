# TDD 开发指南

## 🧪 测试驱动开发（TDD）流程

### 三步循环：Red-Green-Refactor

1. **🔴 Red**: 编写失败的测试
2. **🟢 Green**: 编写最少代码使测试通过
3. **🔵 Refactor**: 重构代码，保持测试通过

## 📁 测试文件结构

```
test/
├── setup.ts           # 测试环境设置
├── api.test.ts        # API集成测试
├── users.test.ts      # 用户路由单元测试
└── utils.test.ts      # 工具函数单元测试
```

## 🚀 快速开始

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式 (推荐TDD使用)
npm run test:watch

# 测试覆盖率
npm run test:coverage

# CI模式
npm run test:ci
```

### TDD 示例工作流

1. **编写失败测试** (Red)

```typescript
// test/new-feature.test.ts
describe("新功能", () => {
  it("应该做某事", () => {
    const result = newFunction();
    expect(result).toBe("期望结果");
  });
});
```

2. **运行测试** (确认失败)

```bash
npm run test:watch
```

3. **编写最少代码** (Green)

```typescript
// src/new-feature.ts
export function newFunction() {
  return "期望结果";
}
```

4. **确认测试通过**

5. **重构代码** (Refactor)

```typescript
// 改进实现，保持测试通过
export function newFunction(): string {
  // 更好的实现
  return calculateResult();
}
```

## 📋 测试类型

### 1. 单元测试

- 测试单个函数或类方法
- 快速执行
- 独立于外部依赖

### 2. 集成测试

- 测试多个组件的交互
- 测试 API 端点
- 包含数据库或外部服务

### 3. 端到端测试

- 测试完整的用户流程
- 从用户界面到数据库

## 🎯 测试最佳实践

### 1. 测试命名

```typescript
describe("UserService", () => {
  describe("validateEmail", () => {
    it("should return true for valid email", () => {
      // 测试代码
    });

    it("should return false for invalid email", () => {
      // 测试代码
    });
  });
});
```

### 2. 测试结构 (AAA Pattern)

```typescript
it("should create user successfully", () => {
  // Arrange - 准备测试数据
  const userData = { name: "John", email: "john@example.com" };

  // Act - 执行被测试的代码
  const result = createUser(userData);

  // Assert - 验证结果
  expect(result.success).toBe(true);
  expect(result.data.name).toBe("John");
});
```

### 3. 模拟和存根

```typescript
// 模拟外部依赖
jest.mock("../database");

// 使用存根
const mockDatabase = database as jest.Mocked<typeof database>;
mockDatabase.save.mockResolvedValue({ id: 1 });
```

## 🔧 调试测试

### 1. 单独运行测试文件

```bash
npx jest test/users.test.ts
```

### 2. 运行特定测试

```bash
npx jest --testNamePattern="should create user"
```

### 3. 调试模式

```bash
npx jest --runInBand --no-cache test/users.test.ts
```

## 📊 覆盖率目标

- **语句覆盖率**: > 90%
- **分支覆盖率**: > 80%
- **函数覆盖率**: > 95%
- **行覆盖率**: > 90%

## 🤝 团队协作

### 1. 提交前运行测试

```bash
npm run test:ci
```

### 2. 每次提交包含测试

- 新功能必须有对应测试
- Bug 修复必须有回归测试

### 3. 代码审查检查点

- [ ] 测试是否充分覆盖新代码
- [ ] 测试是否易于理解
- [ ] 测试是否独立且可重复

## 🎓 学习资源

- [Jest 官方文档](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [TDD 入门指南](https://martinfowler.com/articles/practical-test-pyramid.html)
