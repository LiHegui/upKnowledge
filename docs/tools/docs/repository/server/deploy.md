## 部署

### 简单、直接部署

build => 打包，然后将public目录复制到服务器上

## GitLab
>GitLab 是目前较为流行的代码托管平台之一，它不仅提供代码存储和版本管理功能，而且还支持自动化部署，方便开发者快速地将代码部署到服务器上进行测试和生产环境发布

**GitLab 自动化部署的实现需要依赖于 GitLab CI/CD（Continuous Integration/Continuous Deployment）功能，该功能是基于 CI/CD 流水线来实现自动化构建、测试和部署的**

### 使用Auto DevOps进行部署

```yml
# 阶段
stages
 - build
 - test
 - deploy
build
 - 
```
### 安装GitLab

