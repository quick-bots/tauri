import os
import re
import json
from datetime import datetime
from typing import Dict, List, Set, Tuple

class DocAnalyzer:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.planning_docs = {
            "SRS": os.path.join(base_path, "docs", "planning", "SRS.md"),
            "SDD": os.path.join(base_path, "docs", "planning", "SDD.md"),
            "SDP": os.path.join(base_path, "docs", "planning", "SDP.md"),
            "TestPlan": os.path.join(base_path, "docs", "planning", "TestPlan.md"),
            "API": os.path.join(base_path, "docs", "planning", "API.md")
        }
        
    def read_file(self, filepath: str) -> str:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return ""

    def extract_version_info(self, content: str) -> str:
        version_match = re.search(r'version[:\s]+([0-9]+\.[0-9]+\.[0-9]+)', content, re.IGNORECASE)
        return version_match.group(1) if version_match else "Unknown"

    def extract_key_elements(self, content: str) -> Tuple[Set[str], Set[str], Set[str]]:
        # Extract capitalized terms (excluding common words)
        common_words = {'The', 'A', 'An', 'In', 'On', 'At', 'To', 'For', 'And', 'Or'}
        key_terms = set(term for term in re.findall(r'\b[A-Z][A-Za-z0-9_]+\b', content)
                       if term not in common_words)
        
        # Extract quoted phrases
        quoted_phrases = set(re.findall(r'"([^"]*)"', content))
        
        # Extract requirement-like patterns (REQ-XXX)
        requirements = set(re.findall(r'REQ-[A-Z0-9]+', content))
        
        return key_terms, quoted_phrases, requirements

    def analyze_documents(self) -> Dict:
        results = {
            "metadata": {
                "timestamp": datetime.now().isoformat(),
                "documents_analyzed": list(self.planning_docs.keys())
            },
            "version_analysis": {},
            "consistency_analysis": {},
            "requirements_coverage": {}
        }

        # First pass - collect all unique elements
        all_terms = set()
        all_phrases = set()
        all_requirements = set()
        
        for doc_name, doc_path in self.planning_docs.items():
            content = self.read_file(doc_path)
            version = self.extract_version_info(content)
            terms, phrases, reqs = self.extract_key_elements(content)
            
            results["version_analysis"][doc_name] = version
            all_terms.update(terms)
            all_phrases.update(phrases)
            all_requirements.update(reqs)

        # Second pass - analyze coverage
        for doc_name, doc_path in self.planning_docs.items():
            content = self.read_file(doc_path)
            doc_terms, doc_phrases, doc_reqs = self.extract_key_elements(content)
            
            results["consistency_analysis"][doc_name] = {
                "missing_terms": sorted(list(all_terms - doc_terms)),
                "missing_phrases": sorted(list(all_phrases - doc_phrases)),
                "missing_requirements": sorted(list(all_requirements - doc_reqs))
            }
            
            # Calculate coverage percentages
            total_terms = len(all_terms)
            total_phrases = len(all_phrases)
            total_reqs = len(all_requirements)
            
            results["requirements_coverage"][doc_name] = {
                "terms_coverage": round((len(doc_terms) / total_terms * 100) if total_terms > 0 else 100, 2),
                "phrases_coverage": round((len(doc_phrases) / total_phrases * 100) if total_phrases > 0 else 100, 2),
                "requirements_coverage": round((len(doc_reqs) / total_reqs * 100) if total_reqs > 0 else 100, 2)
            }

        return results

    def generate_report(self, results: Dict) -> str:
        report = f"""# Documentation Consistency Report
Generated: {results['metadata']['timestamp']}

## Version Analysis
| Document | Version |
|----------|---------|
"""
        for doc, version in results["version_analysis"].items():
            report += f"| {doc} | {version} |\n"

        report += "\n## Coverage Summary\n"
        report += "| Document | Terms Coverage | Phrases Coverage | Requirements Coverage |\n"
        report += "|----------|----------------|------------------|---------------------|\n"
        
        for doc, coverage in results["requirements_coverage"].items():
            report += f"| {doc} | {coverage['terms_coverage']}% | {coverage['phrases_coverage']}% | {coverage['requirements_coverage']}% |\n"

        report += "\n## Detailed Analysis\n"
        for doc, analysis in results["consistency_analysis"].items():
            report += f"\n### {doc}\n"
            
            if analysis["missing_terms"]:
                report += "\n#### Missing Terms\n"
                for term in analysis["missing_terms"]:
                    report += f"- `{term}`\n"
            
            if analysis["missing_phrases"]:
                report += "\n#### Missing Phrases\n"
                for phrase in analysis["missing_phrases"]:
                    report += f"- \"{phrase}\"\n"
            
            if analysis["missing_requirements"]:
                report += "\n#### Missing Requirements\n"
                for req in analysis["missing_requirements"]:
                    report += f"- {req}\n"

        return report

def main():
    # Get the repository root path
    repo_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    # Initialize analyzer
    analyzer = DocAnalyzer(repo_path)
    
    # Run analysis
    results = analyzer.analyze_documents()
    
    # Generate and save report
    report = analyzer.generate_report(results)
    report_path = os.path.join(repo_path, "docs", "traceability", "consistency_report.md")
    
    # Ensure traceability directory exists
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    # Save report
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    # Save raw results as JSON for further processing
    results_path = os.path.join(repo_path, "docs", "traceability", "consistency_results.json")
    with open(results_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2)
    
    print(f"Report generated: {report_path}")
    print(f"Results saved: {results_path}")

if __name__ == "__main__":
    main()
