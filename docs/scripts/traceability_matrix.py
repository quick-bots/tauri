import os
import re
import json
from typing import Dict, List, Set, Optional
from datetime import datetime

class TraceabilityAnalyzer:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.planning_docs = {
            "SRS": os.path.join(base_path, "docs", "planning", "SRS.md"),
            "SDD": os.path.join(base_path, "docs", "planning", "SDD.md"),
            "SDP": os.path.join(base_path, "docs", "planning", "SDP.md"),
            "TestPlan": os.path.join(base_path, "docs", "planning", "TestPlan.md"),
            "API": os.path.join(base_path, "docs", "planning", "API.md")
        }
        self.requirements: Dict[str, Dict] = {}

    def read_file(self, filepath: str) -> str:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return ""

    def extract_requirements(self, content: str) -> List[Dict]:
        """Extract requirements and their descriptions from content."""
        requirements = []
        
        # Match requirement patterns like REQ-F001, REQ-NF001, etc.
        req_pattern = r'(REQ-[A-Z]+[0-9]+)[\s:]+([^\n]+)'
        matches = re.finditer(req_pattern, content)
        
        for match in matches:
            req_id = match.group(1)
            description = match.group(2).strip()
            requirements.append({
                "id": req_id,
                "description": description
            })
        
        return requirements

    def find_requirement_references(self, content: str, req_id: str) -> List[str]:
        """Find section references for a requirement in document content."""
        references = []
        
        # Look for section numbers (e.g., Section 3.1.2)
        section_pattern = f"{req_id}.*?(?:Section|§)\\s+([0-9.]+)"
        section_matches = re.finditer(section_pattern, content, re.IGNORECASE)
        references.extend(match.group(1) for match in section_matches)
        
        # Look for heading references
        heading_pattern = f"{req_id}.*?(?:in|under)\\s+[\"']([^\"']+)[\"']"
        heading_matches = re.finditer(heading_pattern, content, re.IGNORECASE)
        references.extend(match.group(1) for match in heading_matches)
        
        return references

    def analyze_coverage(self, req_id: str, doc_content: str) -> str:
        """Determine coverage status for a requirement in a document."""
        if req_id not in doc_content:
            return "❌"  # Not covered
        
        # Check for implementation details
        impl_indicators = [
            r"implement",
            r"provid",
            r"ensur",
            r"handle",
            r"process",
            r"support"
        ]
        
        impl_pattern = f"{req_id}.*?({'|'.join(impl_indicators)})"
        if re.search(impl_pattern, doc_content, re.IGNORECASE):
            return "✅"  # Fully covered
        
        return "⚠️"  # Partially covered

    def generate_matrix(self) -> Dict:
        matrix = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "documents_analyzed": list(self.planning_docs.keys())
            },
            "requirements": {}
        }

        # First pass - collect all requirements
        for doc_name, doc_path in self.planning_docs.items():
            content = self.read_file(doc_path)
            requirements = self.extract_requirements(content)
            
            for req in requirements:
                if req["id"] not in matrix["requirements"]:
                    matrix["requirements"][req["id"]] = {
                        "description": req["description"],
                        "coverage": {},
                        "references": {}
                    }

        # Second pass - analyze coverage and references
        for req_id in matrix["requirements"].keys():
            for doc_name, doc_path in self.planning_docs.items():
                content = self.read_file(doc_path)
                
                matrix["requirements"][req_id]["coverage"][doc_name] = self.analyze_coverage(req_id, content)
                matrix["requirements"][req_id]["references"][doc_name] = self.find_requirement_references(content, req_id)

        return matrix

    def generate_report(self, matrix: Dict) -> str:
        report = f"""# Traceability Matrix
Generated: {matrix['metadata']['timestamp']}

This matrix maps requirements to their implementation across planning documents.

| Requirement ID | Description | {' | '.join(matrix['metadata']['documents_analyzed'])} |
|---------------|-------------|{' | '.join(['---' for _ in matrix['metadata']['documents_analyzed']])} |
"""

        for req_id, details in sorted(matrix["requirements"].items()):
            coverage_cells = []
            for doc in matrix['metadata']['documents_analyzed']:
                coverage = details["coverage"][doc]
                references = details["references"][doc]
                cell_content = f"{coverage}"
                if references:
                    cell_content += f" ({', '.join(references)})"
                coverage_cells.append(cell_content)
            
            report += f"| {req_id} | {details['description']} | {' | '.join(coverage_cells)} |\n"

        report += """
## Coverage Legend
- ✅ Fully covered
- ⚠️ Partially covered
- ❌ Not covered
"""
        return report

def main():
    # Get the repository root path
    repo_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Initialize analyzer
    analyzer = TraceabilityAnalyzer(repo_path)
    
    # Generate matrix
    matrix = analyzer.generate_matrix()
    
    # Generate and save report
    report = analyzer.generate_report(matrix)
    report_path = os.path.join(repo_path, "docs", "traceability", "traceability_matrix.md")
    
    # Ensure traceability directory exists
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    # Save report
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # Save raw matrix as JSON for further processing
    matrix_path = os.path.join(repo_path, "docs", "traceability", "traceability_matrix.json")
    with open(matrix_path, 'w', encoding='utf-8') as f:
        json.dump(matrix, f, indent=2)
    
    print(f"Matrix report generated: {report_path}")
    print(f"Matrix data saved: {matrix_path}")

if __name__ == "__main__":
    main()
