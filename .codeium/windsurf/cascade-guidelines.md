# Cascade Guidelines

## Documentation Priority Order

When working with this codebase, Cascade AI should review documentation in the following order:

1. `cascade-guidelines.md` - For understanding interaction parameters
2. `project-overview.md` - For high-level context
3. `SRS.md` - For understanding requirements
4. `SDD.md` - For implementation details
5. `API.md` - For interface specifications
6. Other documents as needed

## Key Implementation Notes

1. **MCP Integration**
   - All AI interactions follow the Model Context Protocol
   - Refer to SDD.md for detailed MCP architecture
   - Check API.md for MCP-specific endpoints

2. **UI Implementation**
   - Follow AIM-inspired design while incorporating modern practices
   - Use design assets as reference for layout and styling
   - Maintain consistent look and feel across all views

3. **Security Considerations**
   - Implement MCP security best practices
   - Follow authentication flow in SDD.md
   - Adhere to access control specifications

4. **Testing Requirements**
   - Follow test cases in TestPlan.md
   - Ensure MCP compliance testing
   - Validate against UI reference designs

## Document Updates

When updating documentation:
1. Maintain consistent formatting
2. Update related documents when making changes
3. Keep cross-references accurate
4. Preserve MCP compliance requirements

## Version Control

This documentation follows semantic versioning:
- Major version: Significant architectural changes
- Minor version: Feature additions or updates
- Patch version: Bug fixes and minor updates


---


Current Version: 1.0.0
Last Updated: 2025-02-17