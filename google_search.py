# -*- coding: utf-8 -*-
"""
Google 搜索核心模块：免密钥纯协议搜索客户端。

实测结论(2026-10-21/22, 单一出口节点钉死 + 信任 cookie 会话):
  1. 检测分四层, 决定能否拿到真 SERP 的是「cookie 身份的服务端信任分 + 出口 IP 信誉」,
     不是 sg_ss 也不是 TLS 指纹(裸 curl OpenSSL 指纹带信任 cookie 照样 200 SERP)。
  2. 无信任会话会被发 challenge 页(内嵌 knitsail VM 采集环境快拍)。
     本模块自动调 solver.js(Node + mini_browser 环境)离线解出 SG_SS,
     带 &sg_ss=&sei= 回放 = 会话升级(promote), 之后可连续正常查询。
  3. performance.now 精度必须与 UA 声称的浏览器族一致(Chrome=0.1ms 量化),
     solver 环境由 harmonize.js 按 baselines.json(真 Chrome155 结构快照)对齐。
  4. 翻页: start=10,20,... 每页计一次请求; 挑战对翻页同样自动求解。
  5. 结果链接为 /goto?url=CAES... 加密跳转链(解密器在页面 JS 内, 协议端不可解),
     url 字段返回跳转原链; title/snippet/cite 可直接使用。

用法:
    python google_search.py "python 教程" --page 2
"""
from __future__ import annotations

import base64
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional
from urllib.parse import quote

from curl_cffi import requests as _creq

UA = ("Mozilla/5.0 (Windows NT 10.0; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36")
BASE = "https://www.google.com.hk"

_SOLVER_JS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "solver.js")

_HEADERS = {
    "upgrade-insecure-requests": "1",
    "user-agent": UA,
    "accept": ("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,"
               "image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"),
    "sec-ch-ua": '"Google Chrome";v="155", "Chromium";v="155", "Not(A:Brand";v="24"',
    "sec-ch-ua-mobile": "?0", "sec-ch-ua-platform": '"Windows"',
                                                "sec-fetch-site": "same-origin", "sec-fetch-mode": "navigate",
    "sec-fetch-user": "?1", "sec-fetch-dest": "document",
    "accept-encoding": "gzip, deflate, br, zstd",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
    "priority": "u=0, i",
}

_TAG_RE = re.compile(r"<[^>]+>")
_ENT_RE = re.compile(r"&(?:quot|#39|amp|lt|gt|nbsp|#x[0-9a-fA-F]+|[0-9]+);")
_STATS_RE = re.compile(r"(?:About|约)\s*([\d,\.]+)\s*(?:results|条结果)")
_H3_RE = re.compile(r"<h3[^>]*>(.*?)</h3>", re.S)
_SNIPPET_RES = [
    # 经典布局(VwiC3b)与 udm=14 新布局(q0vns)两代摘要容器
    re.compile(r'<div[^>]*class="[^"]*VwiC3b[^"]*"[^>]*>(.*?)</div>', re.S),
    re.compile(r'<div[^>]*class="[^"]*q0vns[^"]*"[^>]*>(.*?)</div>', re.S),
]
_CITE_RE = re.compile(r"<cite[^>]*>(.*?)</cite>", re.S)


class GoogleSearchError(Exception):
    pass


@dataclass
class GoogleResult:
    rank: int
    title: str
    url: str
    snippet: str
    cite: str
    page: int

    def as_dict(self) -> Dict:
        return asdict(self)


def _clean(text: str) -> str:
    return _ENT_RE.sub(lambda m: {"&quot;": '"', "&#39;": "'", "&amp;": "&",
                                  "&lt;": "<", "&gt;": ">", "&nbsp;": " "}.get(
                                      m.group(0), " "), _TAG_RE.sub("", text)).strip()


def classify(text: str):
    """→ (verdict, h3_count)。verdict ∈ serp / sorry / challenge / other"""
    n_h3 = len(re.findall(r"<h3[ >]", text))
    head = text[:20000]
    if ("/sorry/" in head or "unusual traffic" in head or "g-recaptcha" in head
            or "captcha-form" in head or "检测到您的计算机网络" in head):
        return "sorry", n_h3
    if "knitsail" in text:
        return "challenge", n_h3
    if n_h3 >= 3 or 'id="search"' in text:
        return "serp", n_h3
    return "other", n_h3


def _parse_results(html: str, page: int) -> List[GoogleResult]:
    results: List[GoogleResult] = []
    h3s = list(_H3_RE.finditer(html))
    for rank, m in enumerate(h3s, 1):
        title = _clean(m.group(1))
        # 结果链接: h3 前最近的 <a href>
        back = html[max(0, m.start() - 2000): m.start()]
        hrefs = re.findall(r'<a[^>]+href="([^"]+)"', back)
        href = hrefs[-1] if hrefs else ""
        if href.startswith("/"):
            href = "https://www.google.com.hk" + href
        # 摘要: h3 之后的 VwiC3b 块
        fwd = html[m.end(): m.end() + 4000]
        snippet = ""
        for sr in _SNIPPET_RES:
            sm = sr.search(fwd)
            if sm:
                snippet = _clean(sm.group(1))
                break
        cm = _CITE_RE.search(fwd)
        cite = _clean(cm.group(1))[:120] if cm else ""
        results.append(GoogleResult(rank, title, href, snippet, cite, page))
    return results


class GoogleSearch:
    """免密钥 Google 搜索客户端(纯协议, 无浏览器)。

    cookies      信任身份:"K1=V1; K2=V2" / @cookies.txt / dict。
                 有信任 cookie → 直出 SERP; 无 → 自动走挑战求解(promote)。
    proxy        代理地址(建议钉死单一出口节点); 缺省读环境变量 GOOGLE_PROXY。
    solver       挑战自动求解开关。需要 Node + mini_browser core(环境变量
                 MINI_BROWSER_ROOT, 缺省 E:\\AI\\tools\\风华佬\\core)。
    """

    def __init__(self, proxy: Optional[str] = None, timeout: int = 60, hl: str = "zh-CN",
                 cookies: Optional[str] = None, solver: bool = True, cookie_file: Optional[str] = None):
        self.proxy = proxy or os.environ.get("GOOGLE_PROXY", "") or None
        self.timeout = timeout
        self.hl = hl
        self.solver_enabled = solver
        self.solve_count = 0
        self._sess = _creq.Session(impersonate="chrome131")
        if self.proxy:
            self._sess.proxies = {"http": self.proxy, "https": self.proxy}
        self._sess.headers.update(_HEADERS)
        self._sess.headers["referer"] = BASE + "/"
        if cookies:
            self.set_cookies(cookies)
        elif cookie_file and os.path.exists(cookie_file):
            self.set_cookies("@" + cookie_file)

    # -------------------------------------------------- cookies
    def set_cookies(self, src) -> None:
        """三种形式: dict / "K1=V1; K2=V2" / "@cookies.txt"（@ 前缀为文件路径）"""
        if isinstance(src, dict):
            pairs = src
        elif isinstance(src, str) and src.startswith("@"):
            pairs = dict(p.strip().partition("=")[::2]
                         for p in open(src[1:], encoding="utf-8").read().split(";") if "=" in p)
        elif isinstance(src, str):
            pairs = dict(p.strip().partition("=")[::2] for p in src.split(";") if "=" in p)
        else:
            return
        pairs = {k: v for k, v in pairs.items() if k and v}
        self._sess.cookies.update(pairs)

    # -------------------------------------------------- challenge
    def _solve(self, page_url: str, html: str) -> Optional[str]:
        if not self.solver_enabled or not os.path.exists(_SOLVER_JS):
            return None
        payload = {
            "pageURL": page_url,
            "pageHTML": html,
            "userAgent": UA,
            "cookieSeed": "; ".join(f"{k}={v}" for k, v in
                                    (dict(self._sess.cookies.items()).items())),
            "waitMs": 2500,
            "elapsedMs": 14500,
        }
        try:
            p = subprocess.run(["node", _SOLVER_JS], input=json.dumps(payload).encode("utf-8"),
                               capture_output=True, timeout=60)
        except Exception:
            return None
        m = re.search(r":::RESULT_BASE64:([A-Za-z0-9+/=]+):::", p.stdout.decode("utf-8", "replace"))
        if not m:
            return None
        res = json.loads(base64.b64decode(m.group(1)).decode("utf-8", "replace"))
        return res.get("sgss")

    def _fetch(self, url: str):
        last = None
        for _ in range(3):
            try:
                return self._sess.get(url, timeout=self.timeout)
            except Exception as e:
                last = e
                time.sleep(3)
        raise GoogleSearchError(f"请求失败: {type(last).__name__}: {last}")

    # -------------------------------------------------- search
    def search(self, query: str, page: int = 1) -> Dict:
        """搜索一页。page 从 1 开始(服务端 start=(page-1)*10)。

        返回 dict: query / page / verdict / total_count / results[] / has_next /
        meta{solved, took_ms, note}
        """
        t0 = time.time()
        # udm=14: 强制经典网页版 SERP。不加时 Google 可能路由进新搜索体验(AI 模式),
        # 该页面会静默丢弃 site:/排除等操作符(2026-10-22 实测)
        url = (BASE + "/search?q=" + quote(query) + "&hl=" + self.hl + "&udm=14"
               + (f"&start={(page - 1) * 10}" if page > 1 else ""))
        r = self._fetch(url)
        v, _ = classify(r.text)
        note = ""
        solved = False
        if v == "challenge":
            tok = self._solve(url, r.text)
            if not tok:
                raise GoogleSearchError("遇到挑战页且求解失败(需 Node + mini_browser core, "
                                        "或注入信任 cookie)")
            self.solve_count += 1
            self._sess.cookies.update({"SG_SS": tok})
            me = re.search(r"var\s+eid='([^']*)'", r.text)
            r = self._fetch(url + "&sg_ss=" + tok + (f"&sei={me.group(1)}" if me else ""))
            v, _ = classify(r.text)
            solved = True
            note = "challenge 已自动求解并回放"
        if v == "sorry":
            raise GoogleSearchError("出口 IP 处于 429/reCAPTCHA 层: 更换/钉死出口节点, "
                                    "或注入信任 cookie 后重试")
        if v != "serp":
            raise GoogleSearchError(f"非预期响应: {v} ({len(r.text)} bytes)")
        results = _parse_results(r.text, page)
        mm = _STATS_RE.search(r.text)
        return {
            "query": query,
            "page": page,
            "verdict": v,
            "total_count": mm.group(1) if mm else None,
            "results": results,
            "has_next": 'id="pnnext"' in r.text,
            "meta": {
                "solved": solved,
                "solve_count": self.solve_count,
                "took_ms": int((time.time() - t0) * 1000),
                "note": note,
            },
        }


# ---------------------------------------------------------------- CLI
def _cli():
    import argparse
    ap = argparse.ArgumentParser(description="免密钥 Google 搜索(纯协议)")
    ap.add_argument("query")
    ap.add_argument("--page", type=int, default=1)
    ap.add_argument("--proxy", default=(os.environ.get("GOOGLE_PROXY") or "http://127.0.0.1:7897"),
                    help="代理地址；缺省本地钉死出口，可用 --proxy direct 直连")
    ap.add_argument("--cookies", default=None, help='"K=V; ..." / @cookies.txt')
    ap.add_argument("--no-solver", action="store_true")
    a = ap.parse_args()
    gs = GoogleSearch(proxy=a.proxy, cookies=a.cookies, solver=not a.no_solver)
    data = gs.search(a.query, page=a.page)
    out = {**{k: v for k, v in data.items() if k != "results"},
           "results": [r.as_dict() for r in data["results"]]}
    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    _cli()
