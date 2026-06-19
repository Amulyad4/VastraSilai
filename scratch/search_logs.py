import json

log_path = r"C:\Users\allah\.gemini\antigravity\brain\056036ac-85a2-4abc-88b5-5f957f49d32a\.system_generated\logs\transcript_full.jsonl"
with open(log_path, "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        data = json.loads(line)
        # Check if this step is a planner response with tool calls
        if data.get("type") == "PLANNER_RESPONSE" and "tool_calls" in data:
            for tc in data["tool_calls"]:
                name = tc.get("name")
                args = tc.get("args", {})
                target = args.get("TargetFile") or args.get("Target") or ""
                if "Home.jsx" in target:
                    print(f"Line {i}: Tool {name} on {target}")
                    if name == "write_to_file":
                        print("Found write_to_file content snippet:")
                        print(args.get("CodeContent", "")[:500])
                    elif name == "replace_file_content":
                        print("Found replace_file_content Instruction:", args.get("Instruction"))
                        print("ReplacementContent snippet:")
                        print(args.get("ReplacementContent", "")[:500])
                    print("---")
