# -*- coding: utf-8 -*-
"""
Google 搜索 API 服务 (FastAPI)

启动:
    python api.py                       # 默认 127.0.0.1:8000
    python api.py --host 0.0.0.0 --port 8001

接口:
    GET /search?q=python+教程&page=1
    GET /meta                            -> 机制/语法矩阵/依赖说明
"""
from __future__ import annotations

import argparse
import os
import time
from typing import Dict, List, Optional

from fastapi import FastAPI, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from google_search import GoogleSearch, GoogleSearchError

app = FastAPI(title="Google Search API", version="1.0.0",
              description="免密钥 Google 搜索接口: 纯协议 + 挑战自动求解 + 翻页 + 搜索语法")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# 简单 TTL 结果缓存(避免穿透 + 限流保护)
_CACHE: Dict[str, tuple] = {}
_CACHE_TTL = 60.0
_SESSION: Optional[GoogleSearch] = None

GLOBAL_PROXY_ENV = os.environ.get("GOOGLE_PROXY", "")


def _get_session(proxy: Optional[str], cookie: Optional[str]) -> GoogleSearch:
    global _SESSION
    proxy = proxy or GLOBAL_PROXY_ENV or "http://127.0.0.1:7897"  # 默认本地钉死出口
    key = f"{proxy or ''}|{hash(cookie or '')}"
    if _SESSION is None:
        _SESSION = GoogleSearch(proxy=proxy, cookies=cookie or None)
        # 启动默认注入信任会话(如有)
        default_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.txt")
        if not cookie and os.path.exists(default_file):
            _SESSION.set_cookies("@" + default_file)
    elif cookie:
        try:
            _SESSION.set_cookies(cookie)
        except Exception:
            pass
    if proxy:
        _SESSION.proxy = proxy
        _SESSION._sess.proxies = {"http": proxy, "https": proxy}
    return _SESSION


def _cache_get(key: str):
    hit = _CACHE.get(key)
    if hit and time.time() - hit[0] < _CACHE_TTL:
        return hit[1]
    return None


def _cache_put(key: str, payload: Dict):
    _CACHE[key] = (time.time(), payload)
    if len(_CACHE) > 500:
        for k in list(_CACHE.keys())[:200]:
            _CACHE.pop(k, None)


@app.get("/search")
def search(
    q: str = Query(..., min_length=1, description="搜索词"),
    page: int = Query(1, ge=1, le=50, description="页码, 1 起 (start=(page-1)*10)"),
    hl: str = Query("zh-CN", description="界面语言, 如 zh-CN / en-US"),
    proxy: Optional[str] = Query(None, description="本次请求使用的代理地址"),
    cache: bool = Query(True, description="是否使用 60s 结果缓存"),
    x_google_cookie: Optional[str] = Header(None, description="注入浏览器 Cookie(信任会话)"),
):
    key = f"{q}|{page}|{hl}|{proxy or ''}|{hash(x_google_cookie or '')}"
    if cache:
        hit = _cache_get(key)
        if hit:
            hit = dict(hit)
            hit["meta"] = dict(hit["meta"], cached=True)
            return JSONResponse(hit)
    try:
        gs = _get_session(proxy, x_google_cookie)
        data = gs.search(q, page=page)
    except GoogleSearchError as e:
        return JSONResponse({"error": str(e)}, status_code=502)
    payload = {
        "query": q,
        "page": page,
        "verdict": data["verdict"],
        "total_count": data["total_count"],
        "has_next": data["has_next"],
        "results": [r.as_dict() for r in data["results"]],
        "meta": {
            "took_ms": data["meta"]["took_ms"],
            "solved": data["meta"]["solved"],
            "solve_count": data["meta"]["solve_count"],
            "note": data["meta"]["note"],
            "hl": hl,
        },
    }
    if cache:
        _cache_put(key, payload)
    return JSONResponse(payload)


@app.get("/meta")
def meta():
    return {
        "engine": "google.com.hk (纯协议, 无浏览器)",
        "mechanism": {
            "挑战自动求解": "无信任会话被发 knitsail 挑战页时, 自动调 solver.js "
                       "(Node, core 已内置, 结构对齐真 Chrome155) 离线解出 SG_SS 回放升级",
            "翻页": "start=(page-1)*10, 服务端真实翻页",
            "出口要求": "钉死单一可达出口节点; 商宽/被标记 IP 会在 solve 验收层被拒(与客户端无关)",
            "cookie": "信任会话 cookie(如浏览器导出的 NID/AEC) 直出 SERP; "
                      "cookies.txt 为默认身份, promote 后自动回写",
        },
        "syntax_matrix": {
            '"精确短语"': "✅ 实测有效",
            "site:": "✅ 实测有效 (cite 符合率 20/20)",
            "-词 / -site:": "✅ 实测有效 (对照 6→0)",
            "filetype:": "✅ 实测有效",
            "after:/before:": "✅ 实测有效 (结果集随区间变化)",
            "intitle:/OR/related:/cache:/+": "❌ Google 2026 官方文档已移除, 不背书",
        },
        "limitations": [
            "results[].url 为 /goto 加密跳转原链(解密器在页面 JS 内, 协议端不可解)",
            "部分结果(如 StackOverflow)的 cite 渲染为回答数/日期而非域名",
            "请求频率建议 4s+ 间隔(人类节奏), 共用信任会话时与浏览器端共享同一计数器",
        ],
        "dependencies": {
            "python": "curl_cffi(必需) / fastapi+uvicorn(服务)",
            "challenge求解": "Node.js（core 已内置）",
        },
    }


def _main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=8000)
    a = ap.parse_args()
    import uvicorn
    uvicorn.run(app, host=a.host, port=a.port)


if __name__ == "__main__":
    _main()
