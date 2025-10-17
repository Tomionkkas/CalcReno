# Schema Separation Plan: From Monolith to Modular Schemas

## Overview

This document outlines the migration strategy from a single shared schema to separate, focused schemas for the RenoScout ecosystem applications within the same Supabase project.

### Current State
- **Single Schema**: 40+ tables in `public` schema serving 3 applications
- **Complex Dependencies**: Cross-app data relationships in same schema
- **Performance Issues**: Shared resources causing bottlenecks
- **Maintenance Challenges**: Difficult to optimize for specific app needs

### Target State
- **4 Separate Schemas**: Built-in auth + shared + 3 app schemas
- **Shared Authentication**: Uses Supabase's built-in `auth` schema
- **Clean Boundaries**: Clear separation of concerns within same project
- **Optimized Performance**: Each app optimized for its specific needs

## Architecture Design

### Schema Separation
```
┌─────────────────────────────────────────────────────────────┐
│                    Single Supabase Project                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   auth (built-in)│  │ shared_schema  │  │ renoscout_schema│  │
│  │                 │  │                 │  │                 │  │
│  │ • users         │  │ • profiles      │  │ • properties    │  │
│  │ • sessions      │  │ • app_preferences│  │ • ai_analysis   │  │
│  │ • refresh_tokens│  │ • user_roles    │  │ • market_data   │  │
│  │ • identities    │  │ • audit_log     │  │ • watchlists    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                     │
│  │ calcreno_schema │  │renotimeline_schema│                     │
│  │                 │  │                 │                     │
│  │ • projects      │  │ • projects      │                     │
│  │ • rooms         │  │ • tasks         │                     │
│  │ • elements      │  │ • workflows     │                     │
│  │ • calculations  │  │ • timelines     │                     │
│  └─────────────────┘  └─────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### Cross-Schema Integration
- **Authentication**: All apps use built-in `auth` schema
- **Shared Data**: Cross-app user data in `shared_schema`
- **Data Export**: `calcreno_schema` → `renotimeline_schema` (one-way)
- **User Context**: Seamless user experience across schemas

## Implementation Phases

### Phase 1: Foundation Setup ✅ COMPLETED
**Duration**: 1 week
**Goal**: Establish shared authentication and cross-app data schema

#### 1.1 Create Shared Schema ✅
- ✅ Create `shared_schema` in current Supabase project
- ✅ Set up cross-app user data tables (profiles, app_preferences, user_roles, audit_log, guest_sessions, user_push_tokens)
- ✅ Configure RLS policies for shared schema
- ✅ Use built-in `auth` schema for authentication
- ✅ Test user registration and login
- ✅ Document shared schema API endpoints

#### 1.2 Update Auth Configuration
- [ ] Update all apps to use built-in `auth` schema
- [ ] Update all apps to use `shared_schema` for cross-app data
- [ ] Test authentication flow across all apps
- [ ] Verify user session management
- [ ] Test logout and session cleanup

### Phase 2: Application Schema Migration (One App at a Time)
**Duration**: 1-2 weeks per app
**Goal**: Migrate each app to its own schema

#### 2.1 RenoScout Schema Migration
**Priority**: High (No dependencies)
- [ ] Create `renoscout_schema` in current project
- [ ] Design and create database schema
- [ ] Migrate property analysis data from `public` schema
- [ ] Set up indexes and optimizations
- [ ] Update RenoScout app connections
- [ ] Test all RenoScout functionality
- [ ] Verify performance improvements

#### 2.2 CalcrReno Schema Migration
**Priority**: Medium (Has export functionality)
- [ ] Create `calcreno_schema` in current project
- [ ] Design and create database schema
- [ ] Migrate calculation and project data from `public` schema
- [ ] Set up indexes and optimizations
- [ ] Update CalcrReno app connections
- [ ] Test all CalcrReno functionality
- [ ] Verify calculation accuracy

#### 2.3 RenoTimeline Schema Migration
**Priority**: Medium (Receives data from CalcrReno)
- [ ] Create `renotimeline_schema` in current project
- [ ] Design and create database schema
- [ ] Migrate project management data from `public` schema
- [ ] Set up indexes and optimizations
- [ ] Update RenoTimeline app connections
- [ ] Test all RenoTimeline functionality
- [ ] Verify workflow management

### Phase 3: Cross-Schema Integration
**Duration**: 1 week
**Goal**: Implement data flow between schemas

#### 3.1 CalcrReno → RenoTimeline Export
- [ ] Design cross-schema export functionality
- [ ] Implement data transformation logic
- [ ] Create project mapping system
- [ ] Test export functionality
- [ ] Verify data integrity
- [ ] Add error handling and retry logic

#### 3.2 Integration Testing
- [ ] Test complete user workflows
- [ ] Verify cross-schema data consistency
- [ ] Test error scenarios
- [ ] Performance testing
- [ ] Security validation

### Phase 4: Optimization & Cleanup
**Duration**: 1 week
**Goal**: Optimize performance and clean up old data

#### 4.1 Performance Optimization
- [ ] Analyze query performance across schemas
- [ ] Add missing indexes
- [ ] Optimize database functions
- [ ] Implement caching strategies
- [ ] Monitor resource usage

#### 4.2 Data Cleanup
- [ ] Archive old `public` schema tables
- [ ] Remove unused tables
- [ ] Clean up temporary data
- [ ] Update documentation
- [ ] Create backup strategies

## Database Schema Design

### Built-in Auth Schema (`auth`)
```sql
-- Supabase built-in authentication
auth.users
auth.sessions
auth.refresh_tokens
auth.identities
-- ... and more
```

### Shared Schema (`shared_schema`)
```sql
-- Cross-app user data
profiles (extends auth.users)
app_preferences (per-app settings)
user_roles (cross-app role management)
audit_log (security logging)
guest_sessions (anonymous users)
user_push_tokens (notifications)
```

### RenoScout Schema (`renoscout_schema`)
```sql
-- Core property data
properties
ai_property_analysis
market_analysis
government_data_cache

-- User preferences
user_watchlists
search_alerts
renoscout_preferences

-- Analysis tracking
analysis_job_queue
analysis_feedback
```

### CalcrReno Schema (`calcreno_schema`)
```sql
-- Project management
calcreno_projects
calcreno_rooms
calcreno_room_elements

-- Export functionality
project_exports
export_queue
export_mappings
```

### RenoTimeline Schema (`renotimeline_schema`)
```sql
-- Project management
projects
tasks
subtasks
workflow_definitions
workflow_executions

-- Import functionality
imported_projects
project_mappings
import_history
```

## Migration Strategy

### Data Extraction from Public Schema
1. **Identify app-specific data** using source_app columns or table ownership
2. **Extract data** with proper relationships intact
3. **Transform data** to match new schema requirements
4. **Validate data integrity** before migration

### Schema Migration Process
1. **Create new schemas** with proper table structures
2. **Migrate data** in dependency order
3. **Verify data integrity** and relationships
4. **Update application connections**
5. **Test functionality** thoroughly

### Rollback Plan
1. **Keep public schema** as backup during migration
2. **Maintain old connection strings** as fallback
3. **Test rollback procedures** before migration
4. **Document rollback steps** for each phase

## Testing Strategy

### Unit Testing
- [ ] Test each schema connection independently
- [ ] Verify all CRUD operations work correctly
- [ ] Test authentication flows
- [ ] Validate data constraints and relationships

### Integration Testing
- [ ] Test cross-schema data flow
- [ ] Verify export/import functionality
- [ ] Test user workflows across schemas
- [ ] Validate error handling

### Performance Testing
- [ ] Benchmark query performance across schemas
- [ ] Test concurrent user scenarios
- [ ] Monitor resource usage
- [ ] Validate scalability

### Security Testing
- [ ] Verify RLS policies work correctly across schemas
- [ ] Test authentication security
- [ ] Validate data access controls
- [ ] Check for security vulnerabilities

## Risk Mitigation

### High-Risk Scenarios
1. **Data loss during migration**
   - Mitigation: Multiple backups, test migrations
2. **Application downtime**
   - Mitigation: Gradual migration, rollback procedures
3. **Performance degradation**
   - Mitigation: Performance testing, optimization
4. **Authentication issues**
   - Mitigation: Thorough testing, fallback auth

### Contingency Plans
1. **Migration failure**: Rollback to public schema
2. **Performance issues**: Optimize queries and indexes
3. **Data corruption**: Restore from backup
4. **Authentication problems**: Revert to old auth system

## Success Criteria

### Technical Success
- [ ] All applications work with new schemas
- [ ] Cross-schema integration functions correctly
- [ ] Performance meets or exceeds current levels
- [ ] No data loss or corruption
- [ ] Security policies properly enforced

### Business Success
- [ ] Users can seamlessly use all three apps
- [ ] Export functionality works as expected
- [ ] No disruption to user workflows
- [ ] Improved system reliability
- [ ] Better scalability for future growth

## Timeline Summary

| Phase | Duration | Key Deliverables | Status |
|-------|----------|------------------|---------|
| Phase 1 | 1 week | Shared auth & data schema | ✅ COMPLETED |
| Phase 2 | 3-6 weeks | Three separate schemas | 🔄 IN PROGRESS |
| Phase 3 | 1 week | Cross-schema integration | ⏳ PENDING |
| Phase 4 | 1 week | Optimization & cleanup | ⏳ PENDING |
| **Total** | **6-9 weeks** | **Complete migration** | **25% Complete** |

## Implementation Details

### Schema Creation Commands
```sql
-- Create schemas
CREATE SCHEMA shared_schema;
CREATE SCHEMA renoscout_schema;
CREATE SCHEMA calcreno_schema;
CREATE SCHEMA renotimeline_schema;

-- Set up permissions
GRANT USAGE ON SCHEMA shared_schema TO authenticated;
GRANT USAGE ON SCHEMA renoscout_schema TO authenticated;
GRANT USAGE ON SCHEMA calcreno_schema TO authenticated;
GRANT USAGE ON SCHEMA renotimeline_schema TO authenticated;
```

### Cross-Schema Access
```sql
-- Enable cross-schema access for authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA shared_schema TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA renoscout_schema TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA calcreno_schema TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA renotimeline_schema TO authenticated;
```

### Application Connection Updates
```javascript
// Update Supabase client configuration
const supabase = createClient(
  'your-project-url',
  'your-anon-key',
  {
    db: {
      schema: 'renoscout_schema' // or appropriate schema
    }
  }
);

// For authentication, use built-in auth schema
// For cross-app data, use shared_schema
```

## Next Steps

1. **Complete Phase 1.2** - Update application configurations
2. **Begin Phase 2.1** - RenoScout schema migration
3. **Set up monitoring** and testing environments
4. **Start migration** following the phased approach

## Notes

- This plan uses the same Supabase project to avoid additional costs
- Schema separation provides similar benefits to separate projects
- Migration is less risky since we're working within the same database
- Can later migrate to separate projects if needed
- Regular backups and testing are critical throughout the process
- **CORRECTED**: Using built-in `auth` schema instead of custom auth_schema
