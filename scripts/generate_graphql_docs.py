import json
import os
import urllib.request

# Endpoint for GraphQL server
endpoint = os.environ.get("GRAPHQL_ENDPOINT", "http://localhost:4000/graphql")

INTROSPECTION_QUERY = """
query IntrospectionQuery {
  __schema {
    types {
      kind
      name
      description
      fields {
        name
        description
      }
    }
  }
}
"""

def fetch_schema(url: str) -> dict:
    data = json.dumps({"query": INTROSPECTION_QUERY}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as response:
        result = json.load(response)
    return result.get("data", {}).get("__schema", {})

def write_json(schema: dict, path: str) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(schema, fh, indent=2)

def write_markdown(schema: dict, path: str) -> None:
    lines = ["# GraphQL Schema", ""]
    for t in schema.get("types", []):
        fields = t.get("fields")
        if not fields:
            continue
        lines.append(f"## {t['name']} ({t['kind']})")
        if t.get("description"):
            lines.append(t["description"])
        for f in fields:
            desc = f.get("description", "")
            if desc:
                lines.append(f"- **{f['name']}**: {desc}")
            else:
                lines.append(f"- **{f['name']}**")
        lines.append("")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))

def main() -> None:
    try:
        schema = fetch_schema(endpoint)
    except Exception as e:
        raise SystemExit(f"Failed to fetch schema: {e}")

    os.makedirs("developer-portal", exist_ok=True)
    write_json(schema, "developer-portal/schema.json")
    write_markdown(schema, "developer-portal/schema.md")

if __name__ == "__main__":
    main()
