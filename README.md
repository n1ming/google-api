# 🔍 Google Search API

[![Python](https://img.shields.io/badge/Python-3.8%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![API Key](https://img.shields.io/badge/API%20Key-不需要-success)]()

免密钥的 Google 搜索接口。纯协议实现（无浏览器），支持**挑战自动求解**、
**真实翻页**、**搜索语法**，提供 HTTP API、Python 客户端与 CLI 三种使用方式。

## ✨ 特性

- 🔑 **无需 API Key**，开箱即用（信任会话 cookie 可选注入，冷会话自动求解升级）
- 🛡️ **挑战自动求解**：无信任会话被发 knitsail 挑战页时，自动调 Node 求解器离线解出
  `SG_SS` 并回放升级（需 Node.js，core 已内置，零配置）
- 📄 **真实翻页**：`page` 参数直达任意页码（`start=(page-1)*10`）
- 🧭 **搜索语法**：`"精确短语"` `site:` `-排除` `filetype:` `after:/before:` 全部实测有效
- 📊 结果含标题、摘要、来源 cite、结果总量（与浏览器端同值）
- 📌 单一出口节点 + 人类节奏（4s±）下实测：**100 查 / 100 SERP（96.2%）**

## 📦 安装

```bash
pip install -r requirements.txt
```

### 挑战求解依赖（可选但强烈建议）

冷会话（无信任 cookie）会被 Google 发挑战页，此时需要 Node.js（core 已内置仓库，
无需额外安装；自备 core 时可用环境变量覆盖）。

若已有信任会话 cookie，可跳过求解依赖直接使用。

## 🚀 快速开始

### 启动 HTTP 服务

```bash
python api.py --port 8000
```

启动后访问 `http://127.0.0.1:8000/docs` 查看交互式文档。

### CLI

```bash
python google_search.py "python 教程"                    # 第一页
python google_search.py "transformer attention" --page 2  # 第二页
python google_search.py "test" --cookies "@cookies.txt"   # 注入信任会话
```

### Python

```python
from google_search import GoogleSearch

gs = GoogleSearch(proxy="http://127.0.0.1:7897")
gs.set_cookies("@cookies.txt")          # 可选: 信任会话
data = gs.search("python 教程", page=1)

for r in data["results"]:
    print(r.rank, r.title, r.cite)
    print("   ", r.snippet[:80])
```

## 📡 HTTP API

### `GET /search`

执行一次搜索。

#### 请求参数

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `q` | string | **必填** | 搜索词 |
| `page` | int | `1` | 页码，1 起（`start=(page-1)*10` 真实翻页） |
| `hl` | string | `zh-CN` | 界面语言，如 `en-US` |
| `proxy` | string | - | 本次请求使用的代理地址 |
| `cache` | bool | `true` | 是否使用 60s 结果缓存 |

#### 请求头

| Header | 说明 |
|---|---|
| `X-Google-Cookie` | 可选。注入浏览器 Cookie（复用信任会话/自定义身份） |

#### 请求示例

```bash
# 第一页
curl "http://127.0.0.1:8000/search?q=python+%E6%95%99%E7%A8%8B"

# 第二页
curl "http://127.0.0.1:8000/search?q=transformer+attention&page=2"
```

#### 响应示例

```json
{
  "query": "transformer attention",
  "page": 1,
  "verdict": "serp",
  "total_count": "213",
  "has_next": true,
  "results": [
    {
      "rank": 1,
      "title": "Attention Is All You Need",
      "url": "https://www.google.com.hk/goto?url=CAES…&ved=…",
      "snippet": "我们提出了新的简单网络架构 Transformer…",
      "cite": "arxiv.org",
      "page": 1
    }
  ],
  "meta": {
    "took_ms": 436,
    "solved": false,
    "solve_count": 0,
    "note": "",
    "hl": "zh-CN"
  }
}
```

#### 响应字段

| 字段 | 说明 |
|---|---|
| `results[].url` | `/goto` 加密跳转原链（解密器在页面 JS 内，协议端不可解，见注意事项） |
| `results[].snippet` | 摘要 |
| `results[].cite` | 页面展示的来源（部分结果渲染为回答数/日期而非域名） |
| `meta.solved` | 本次请求是否经历了挑战自动求解 |
| `meta.solve_count` | 会话累计求解次数 |
| `has_next` | 是否存在下一页 |

### `GET /meta`

返回机制说明、语法矩阵、限制与依赖（自我描述接口，无需参数）。

## 🐍 Python 客户端

### `GoogleSearch`

```python
GoogleSearch(
    proxy=None,           # 代理地址；缺省读环境变量 GOOGLE_PROXY
    timeout=60,           # 单请求超时（秒）
    hl="zh-CN",           # 界面语言
    cookies=None,         # 注入 Cookie: "K1=V1; K2=V2" / @cookies.txt / dict
    solver=True,          # 挑战自动求解开关（需 Node 依赖）
    cookie_file=None,     # cookie 文件路径（等价 cookies="@路径"）
)
```

### `search()`

```python
gs.search(
    query,                # 搜索词（语法直接写在里面: site:/"/"/-/filetype:/after:)
    page=1,               # 页码
)
```

返回 `dict`：`query` / `page` / `verdict` / `total_count` / `results` / `has_next` / `meta`；
`results` 为 `GoogleResult` 列表，字段同上方响应表，`.as_dict()` 可直接序列化。

### `set_cookies()`

动态注入/更新 Cookie，三种形式均可：

```python
gs.set_cookies({"NID": "..."})     # dict
gs.set_cookies("K1=V1; K2=V2")     # 浏览器复制的字符串
gs.set_cookies("@cookies.txt")     # cookies 文件
```

## 🧭 搜索语法（当前索引实测）

语法直接写在 `q` 里即可：

| 语法 | 示例 | 状态 |
|---|---|---|
| `site:` | `site:github.com x64` | ✅ 实测有效（cite 10/10，266 万条） |
| `"精确短语"` | `"to be or not to be"` | ✅ 实测有效 |
| `-词 / -site:` | `awesome python -github` | ✅ 实测有效（github 来源 6→0） |
| `filetype:` | `deep learning book filetype:pdf` | ✅ 实测有效 |
| `after:` / `before:` | `world cup final after:2022-01-01 before:2022-12-31` | ✅ 实测有效 |
| `intitle:` / `OR` / `related:` / `cache:` / `+` | - | ❌ Google 2026 官方文档已移除，不再背书 |

> ⚠️ **必须带 `udm=14`**（客户端已默认加）：Google 会把部分查询路由进「新搜索体验/AI 模式」，
> 该页面**静默丢弃 `site:` 等操作符**并返回垃圾结果簇；`udm=14` 强制经典网页版 SERP 后操作符全部生效。
> （2026-10-22 实测：同一查询加 udm=14 前后，site: 结果 0/10 → 10/10）

> 以上矩阵在本项目会话（chrome131 TLS 仿真 + 信任会话 cookie + 单一出口节点）下实测。
> 结果判据为语义级：site 全域符合、排除前后来源清零、时间区间改变结果集。

## ⚙️ 配置

### 环境变量

| 变量 | 说明 |
|---|---|
| `GOOGLE_PROXY` | 代理地址，如 `http://127.0.0.1:7897` |

### 会话与出口说明

| 条件 | 行为 |
|---|---|
| 信任会话 cookie（`cookies.txt`） | 直出 SERP，无需求解 |
| 无信任 cookie | 首查遇挑战页 → 自动求解升级 → 后续正常查询 |
| 出口节点被 Google 打标 | solve 后仍被拒（429/reCAPTCHA），与客户端无关——换节点 |

> **重要**：请钉死单一出口节点（关闭代理软件的连接级负载均衡）。
> 会话信任绑定「cookie × 出口 IP」，出口漂移会导致无上下文的 429。

## ⚠️ 注意事项

- `results[].url` 为 Google `/goto` 加密跳转原链，解密器位于页面 JS 内，协议端不可解；
  需要真实落地 URL 时请由浏览器端点击获取
- 每页结果条数由 Google 服务端决定（约 8–10 条）
- 结果仅供个人非商业用途，请控制请求频率（建议 ≥4s 间隔/查询，人类节奏），
  遵守 Google 服务条款；信任会话与浏览器端共享同一计数器
- 仅支持 Python 3.8+；挑战求解需 Node.js 16+
