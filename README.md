# Short Layer Cleaner (短图层清理)

[中文](#中文介绍) | [English](#english-introduction)

[![AE Version](https://img.shields.io/badge/After%20Effects-CC%202018+-blue.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

一款轻量、高效的 After Effects 脚本，专门用于快速清理时间轴上极短的无用图层，拯救你的项目整洁度与工作效率。

---

## 中文介绍

### 解决问题
“时间轴上出现只有一两帧长的图层，手动放大时间轴去一层层删麻烦问题。”  
在复杂的 AE 项目或导入外部序列时，手动清理这些“碎图层”不仅眼花缭乱，而且极其浪费时间。**本脚本旨在让繁琐的清理工作变成“一键操作”！**

### 支持功能
* **按帧数阈值清理：** 删除活动合成中帧数小于指定阈值的图层。
* **按图层类型筛选：** 支持勾选特定的图层类型进行清理，避免误删。

### 界面预览
| 中文 UI 界面 |
| :---: |
| ![Chinese UI](https://s1.img-e.com/20260515/6a05f8ea546e9.png) |

### 脚本处理对照图
| 清理前 | 清理后 |
| :---: | :---: |
| ![Before](https://s1.img-e.com/20260515/6a05faa71c74b.png) | ![After](https://s1.img-e.com/20260515/6a05f84100bae.png) |

### 安装使用
将 `.jsx` 文件丢进 AE 安装目录的 **Support Files/Scripts/ScriptUI Panels** 文件夹，重启 AE 后在顶部 **窗口 (Window)** 菜单底部打开即可。

---

## English Introduction

### The Problem
"The timeline has layers that are only one or two frames long, making it tedious to manually zoom in and delete them one by one."  
This script solves the efficiency bottleneck caused by fragmented layers in complex projects.

### Core Features
* **Threshold Cleanup:** Deletes layers in the active composition shorter than the specified number of frames.
* **Type Filtering:** Supports filtering by layer type to ensure precise cleanup without affecting important assets.

### UI Preview
| English UI Interface |
| :---: |
| ![English UI](https://s1.img-e.com/20260515/6a05f9d34ebae.png) |

### Comparison
| Before Cleanup | After Cleanup |
| :---: | :---: |
| ![Before](https://s1.img-e.com/20260515/6a05faa71c74b.png) | ![After](https://s1.img-e.com/20260515/6a05f84100bae.png) |

### Installation
Place the `.jsx` file into the After Effects installation directory:  
`Support Files/Scripts/ScriptUI Panels`.  
After restarting AE, you can find it at the bottom of the **Window** menu.

---

### Feedback / 反馈
If you encounter any issues, please open an "Issue" in this repository.  
如果在使用过程中遇到任何问题，请在本仓库提交 Issue。
