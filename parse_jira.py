import json
import sys

def parse_doc(doc):
    if not isinstance(doc, dict):
        return str(doc)

    out = ""

    if doc.get("type") == "text":
        text = doc.get("text", "")
        marks = doc.get("marks", [])
        for mark in marks:
            if mark["type"] == "strong":
                text = f"**{text}**"
            elif mark["type"] == "em":
                text = f"_{text}_"
            elif mark["type"] == "link":
                text = f"[{text}]({mark['attrs']['href']})"
            elif mark["type"] == "code":
                text = f"`{text}`"
        return text

    if "content" in doc:
        for child in doc["content"]:
            out += parse_doc(child)

    if doc.get("type") == "paragraph":
        return out + "\n\n"
    elif doc.get("type") == "heading":
        level = doc.get("attrs", {}).get("level", 1)
        return f"{'#' * level} {out}\n\n"
    elif doc.get("type") == "bulletList":
        return out + "\n"
    elif doc.get("type") == "orderedList":
        return out + "\n"
    elif doc.get("type") == "listItem":
        return f"* {out}"
    elif doc.get("type") == "codeBlock":
        return f"```\n{out}\n```\n\n"

    return out

with open('stories.json') as f:
    data = json.load(f)

for issue in data['issues']:
    print(f"=============================")
    print(f"{issue['key']}: {issue['fields']['summary']}")
    print(f"=============================\n")
    if issue['fields']['description']:
        print(parse_doc(issue['fields']['description']))
    print("\n")
