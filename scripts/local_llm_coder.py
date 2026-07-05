import argparse
import json
import urllib.request
import urllib.error
import os

def call_ollama(prompt, system_prompt, model="qwen2.5", host="http://localhost:11434"):
    url = f"{host}/api/chat"
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "options": {
            "temperature": 0.1
        }
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            return res_data["message"]["content"]
    except urllib.error.URLError as e:
        print(f"Ollama connection error: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Zero-dependency Local LLM Coder using Ollama")
    parser.add_argument("--file", required=True, help="Path to the file to edit")
    parser.add_argument("--instruction", required=True, help="Instructions for editing the file")
    parser.add_argument("--start-line", type=int, help="Optional start line range (1-indexed)")
    parser.add_argument("--end-line", type=int, help="Optional end line range (1-indexed)")
    parser.add_argument("--model", default="qwen2.5", help="Ollama model name")
    parser.add_argument("--host", default="http://localhost:11434", help="Ollama host URL")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.file):
        print(f"Error: file {args.file} does not exist.")
        return
        
    with open(args.file, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    start_idx = (args.start_line - 1) if args.start_line else 0
    end_idx = args.end_line if args.end_line else len(lines)
    
    target_content = "".join(lines[start_idx:end_idx])
    
    system_prompt = (
        "You are an expert React/TypeScript software engineer. Your task is to modify the provided code segment "
        "according to the user instruction. Return ONLY the modified code segment. Do not include markdown code fence formatting "
        "like ```typescript, do not include explanations, and do not add any surrounding conversational text. "
        "Maintain the exact indentation and style of the original code."
    )
    
    prompt = (
        f"Original Code Segment:\n"
        f"```\n"
        f"{target_content}\n"
        f"```\n\n"
        f"Instruction: {args.instruction}\n\n"
        f"Modified Code Segment:"
    )
    
    print(f"Sending request to local model {args.model} on {args.host}...")
    modified_code = call_ollama(prompt, system_prompt, model=args.model, host=args.host)
    
    if not modified_code:
        print("Failed to get response from local LLM.")
        return
        
    # Strip optional markdown formatting if the model included it anyway
    modified_code = modified_code.strip()
    if modified_code.startswith("```"):
        parts = modified_code.split("\n")
        if parts[0].startswith("```"):
            parts = parts[1:]
        if parts[-1].startswith("```"):
            parts = parts[:-1]
        modified_code = "\n".join(parts)
        
    new_lines = lines[:start_idx] + [modified_code + "\n"] + lines[end_idx:]
    
    with open(args.file, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
        
    print(f"Successfully edited {args.file}.")

if __name__ == "__main__":
    main()
