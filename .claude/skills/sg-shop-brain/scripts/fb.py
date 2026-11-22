#!/usr/bin/env python3
"""Small Facebook Graph API client for the Sunnah Gallery skills. Standard library only.

The page access token is NOT stored anywhere in the repo. In the cloud session it
is saved as a network secret for graph.facebook.com, and the network proxy adds
it to every request automatically. If FB_TOKEN is set (e.g. on a local machine),
it is sent instead.

Usage:
  fb.py get  <path> [key=value ...]          e.g. fb.py get me/accounts
  fb.py all  <path> [key=value ...]          follows paging, prints one JSON list
  fb.py post <path> [key=value ...]          e.g. fb.py post 123_456/comments message="..."
  fb.py upload <page_id> <image> caption=... [published=false]   photo post from a local file

Values starting with @ are read from a file (handy for long Bangla text):
  fb.py post 123_456/comments message=@reply.txt
Prints JSON. Exits 1 and prints the Graph error on failure.
"""
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid

HERE = os.path.dirname(os.path.abspath(__file__))
CONFIG = os.path.join(HERE, "..", "config.json")


def version():
    try:
        with open(CONFIG, encoding="utf-8") as f:
            return json.load(f)["facebook"]["graph_version"]
    except Exception:
        return "v23.0"


def base(path):
    if path.startswith("https://"):
        return path
    return f"https://graph.facebook.com/{version()}/{path.lstrip('/')}"


def headers():
    h = {"User-Agent": "sg-skills/1.0"}
    tok = os.environ.get("FB_TOKEN")
    if tok:
        h["Authorization"] = f"Bearer {tok}"
    return h


def parse_kv(items):
    out = {}
    for it in items:
        if "=" not in it:
            sys.exit(f"bad argument (want key=value): {it}")
        k, v = it.split("=", 1)
        if v.startswith("@"):
            with open(v[1:], encoding="utf-8") as f:
                v = f.read().strip()
        out[k] = v
    return out


def call(req):
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace")
        print(body, file=sys.stderr)
        try:
            err = json.loads(body).get("error", {})
            hint = {
                190: "token missing/expired: ask the owner to save a new page token for graph.facebook.com",
                10: "permission missing on the Meta app/token",
                200: "permission missing on the Meta app/token",
                100: "bad id or field: check page_id / ad_account_id in config.json",
                4: "rate limited: wait and retry later",
                17: "rate limited: wait and retry later",
                32: "rate limited: wait and retry later",
            }.get(err.get("code"))
            if hint:
                print("HINT:", hint, file=sys.stderr)
        except Exception:
            pass
        sys.exit(1)


def get(path, params):
    url = base(path)
    if params:
        url += ("&" if "?" in url else "?") + urllib.parse.urlencode(params)
    return call(urllib.request.Request(url, headers=headers()))


def post(path, params):
    data = urllib.parse.urlencode(params).encode("utf-8")
    return call(urllib.request.Request(base(path), data=data, headers=headers(), method="POST"))


def upload(page_id, image, params):
    boundary = uuid.uuid4().hex
    parts = []
    for k, v in params.items():
        parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode("utf-8"))
    ctype = mimetypes.guess_type(image)[0] or "image/jpeg"
    with open(image, "rb") as f:
        blob = f.read()
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="source"; filename="{os.path.basename(image)}"\r\n'
        f"Content-Type: {ctype}\r\n\r\n".encode("utf-8") + blob + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode("utf-8"))
    h = headers()
    h["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    return call(urllib.request.Request(base(f"{page_id}/photos"), data=b"".join(parts), headers=h, method="POST"))


def main(argv):
    if len(argv) < 3 or argv[1] not in ("get", "all", "post", "upload"):
        print(__doc__)
        sys.exit(2)
    cmd = argv[1]
    if cmd == "upload":
        if len(argv) < 4:
            sys.exit("upload needs <page_id> <image>")
        res = upload(argv[2], argv[3], parse_kv(argv[4:]))
    elif cmd == "post":
        res = post(argv[2], parse_kv(argv[3:]))
    elif cmd == "get":
        res = get(argv[2], parse_kv(argv[3:]))
    else:
        page = get(argv[2], parse_kv(argv[3:]))
        res = list(page.get("data", []))
        while page.get("paging", {}).get("next") and len(res) < 5000:
            page = get(page["paging"]["next"], {})
            res.extend(page.get("data", []))
    print(json.dumps(res, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main(sys.argv)
