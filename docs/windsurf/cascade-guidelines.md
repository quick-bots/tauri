
## Codeium Windsurf & Cascade AI Integration

To maximize the efficiency of Cascade AI within the Windsurf IDE, we will incorporate special documentation patterns, triggers, and files. 

These references guide Cascade in code generation, testing, security validation, and architectural consistency.


### 1. AI-Optimized Documentation
Certain tags and directives can help Cascade parse project requirements and generate code more effectively:

- `@plan`: Summarizes high-level objectives or features
- `@phase`: Marks implementation milestones
- `@validate`: Specifies validation requirements (e.g., `@validate PCI-Compliance`)
- `@enforce`: Declares mandatory rules or guidelines (e.g., code style, security protocols)
- `<!-- cascade-run: ... -->`: Tells Cascade to run a particular check or step (lint, vulnerability scan, etc.)
- `<!-- cascade-target: ... -->`: Indicates the next AI-based generation target or step


For example:
``` md
@plan Core Objectives
- Implement secure user authentication by Q2
<!-- cascade-target: auth_module -->
- Success Metric: @track(auth_success_rate > 99.9%)
```

### 2. Memory Configuration & Rules
Use a Memory Configuration Profile (e.g., `memory-config.windsurf`) to direct Cascade’s attention to specific code paths and to suppress legacy/experimental code. 

A minimal sample:
``` yaml
core_context:
  attention_zones:
    - "src/auth/**/*.ts"
    - "backend/rust_ai/*.rs"

suppression_rules:
  - "legacy/v1/*"
  - "experimental/untested"
```

In addition, define a project-wide rules file (e.g., `.windsurfrules`) to enforce coding standards:
``` yaml
## React Standards
@enforce:
  - Functional components with hooks
  - TypeScript strict mode

## API Constraints
@enforce:
  - Rate limiting: 1000 RPM
  - Deprecation policy: 6 months
```

### 3. Code Generation & Error Handling Protocols
All major components and features should have an **Error Handling Protocol (EHP)**. 

You can define a short “Recovery Matrix” that triggers Cascade’s fallback logic:
``` markdown
## Error Handling Protocol
| Severity  | Cascade Action                  |
|-----------|---------------------------------|
| Critical  | <!-- revert-step --> + @alert   |
| High      | .retry + @senior-review         |
| Medium    | .retry                          |
```

Coupled with `<!-- cascade-enforce: test_coverage(>=80%) -->` and other triggers, Cascade can automatically verify coverage and revert changes if thresholds are not met.

### 4. Review Workflow & Security Manifesto

#### Review Workflow
Cascade can automate code scans, run lint checks, and assign human reviewers:
``` markdown
## Code Review Protocol
1. AI Pre-Check:
   <!-- cascade-run:
   - lint-check
   - vulnerability-scan
   -->
2. Human Review:
   - @assign: staff-engineer
   - SLA: 2hr
```

#### Security Manifesto
You can store a “Security Manifesto” section (or a dedicated `.md` file) that includes:
``` markdown
## Data Protection
<!-- cascade-enforce: gdpr-2025 -->
- Encryption: <!-- @validate key_rotation -->
- Access Logs: @audit weekly
```