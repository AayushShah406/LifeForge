import urllib.request
import json
import time

def main():
    # 1. Create Goal
    goal_payload = {
        "raw_prompt": "Create a plan for garbage management system",
        "category": "general"
    }
    req = urllib.request.Request(
        "http://localhost:8001/api/goals",
        data=json.dumps(goal_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    goal = json.loads(res.read().decode())
    print("1. GOAL CREATED:")
    print("   ID:", goal["id"])
    print("   TITLE:", goal["title"])
    print("   CATEGORY:", goal["category"])

    # 2. Spawn Workflow
    wf_payload = {
        "goal_prompt": goal["raw_prompt"],
        "goal_id": goal["id"],
        "title": goal["title"]
    }
    req = urllib.request.Request(
        "http://localhost:8001/api/workflows",
        data=json.dumps(wf_payload).encode(),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    wf = json.loads(res.read().decode())
    wf_id = wf["id"]
    print("\n2. WORKFLOW SPAWNED:")
    print("   ID:", wf_id)
    print("   STATUS:", wf["status"])

    # 3. Poll for plan & execution
    print("\n3. POLLING FOR EXECUTION & PLAN...")
    for _ in range(8):
        time.sleep(2)
        req = urllib.request.Request(f"http://localhost:8001/api/workflows/{wf_id}")
        res = urllib.request.urlopen(req)
        curr = json.loads(res.read().decode())
        print(f"   Status: {curr['status']}, Steps in DB: {len(curr.get('steps', []))}")
        if curr["status"] in ("completed", "awaiting_approval"):
            break

    print("\n4. FINAL WORKFLOW DETAILS:")
    print("   Status:", curr["status"])
    print("   Workflow Type:", curr.get("plan", {}).get("workflow_type"))
    print("   Plan Steps:")
    for s in curr.get("plan", {}).get("steps", []):
        print(f"     * [{s.get('agent')}] {s.get('id')}: {s.get('title') or s.get('description')}")
    print("   DB Persisted Steps:", len(curr.get("steps", [])))
    print("   Final Result Present:", bool(curr.get("final_result")))

if __name__ == "__main__":
    main()
