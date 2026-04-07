# Feature: User Management Page

> Issue: #6
> Status: Draft

## Problem Statement

The application currently lacks a centralized interface for managing users. Administrators and owners need the ability to:
- Invite new users to the platform
- Control user access levels through role assignment
- Manage user account status (enable/disable access)
- Remove users from the system when needed

Without this capability, user management must be done through other means (database access, scripts, etc.), which is error-prone, lacks audit trails, and is not accessible to non-technical administrators.

## User Stories

1. As an **Admin**, I want to add new users by email, so that I can onboard new team members to the platform.

2. As an **Owner**, I want to change a user's role, so that I can grant or revoke elevated permissions as organizational needs change.

3. As an **Admin**, I want to disable a user's login access, so that I can temporarily restrict access without deleting their account (e.g., during an investigation or leave of absence).

4. As an **Admin**, I want to re-enable a disabled user, so that I can restore their access when appropriate.

5. As an **Owner**, I want to permanently delete a user, so that I can remove users who are no longer part of the organization.

6. As a **Member**, I should NOT be able to access the user management page, so that the principle of least privilege is maintained.

## Functional Requirements

### Must Have

- [ ] **Access Control**: Page is accessible only to users with Admin or Owner roles
- [ ] **User List Display**: Display a list of all users with their email, role, and status (enabled/disabled)
- [ ] **Add User**: Ability to add a new user by email address
  - [ ] Validate email format before submission
  - [ ] New users default to "Member" role
  - [ ] Prevent adding duplicate email addresses
- [ ] **Change Role**: Ability to change a user's role
  - [ ] Available roles: Member, Admin, Owner
  - [ ] Only Owners can promote/demote to Owner role
  - [ ] Admins can assign Member or Admin roles
- [ ] **Enable/Disable User**: Ability to toggle a user's login access
  - [ ] Disabled users cannot log in
  - [ ] Disabled status is clearly visible in the user list
- [ ] **Delete User**: Ability to permanently remove a user
  - [ ] Require confirmation before deletion
  - [ ] Users cannot delete themselves

### Should Have

- [ ] **Search/Filter**: Ability to search users by email or filter by role/status
- [ ] **Pagination**: Handle large user lists with pagination
- [ ] **Self-Protection**: Prevent users from changing their own role or disabling themselves
- [ ] **Loading States**: Show appropriate loading indicators during async operations
- [ ] **Error Handling**: Display clear error messages when operations fail

### Nice to Have

- [ ] **Bulk Actions**: Select multiple users and perform batch enable/disable/delete
- [ ] **Audit Log**: Track who made what changes and when
- [ ] **Email Notifications**: Send welcome email to newly added users
- [ ] **Export**: Export user list to CSV

## Acceptance Criteria

- [ ] Verify that Members receive a 403 Forbidden or redirect when attempting to access the user management page
- [ ] Verify that Admins can view the user list, add users, change roles (except Owner), and enable/disable users
- [ ] Verify that Owners have full access to all user management capabilities including setting Owner role
- [ ] Verify that adding a user with an invalid email format shows a validation error
- [ ] Verify that adding a duplicate email shows an appropriate error message
- [ ] Verify that newly added users have the "Member" role by default
- [ ] Verify that disabled users are visually distinguished in the user list
- [ ] Verify that the delete action requires confirmation
- [ ] Verify that users cannot delete their own account from this page
- [ ] Verify that role changes take effect immediately (user sees updated permissions on next action)

## Out of Scope

The following are explicitly NOT part of this feature:

- **User Registration/Signup Flow**: Users are added by admins; no self-registration
- **Password Management**: This feature does not handle password reset or credential management
- **User Profile Editing**: Users editing their own profile (name, avatar, etc.) is a separate feature
- **Team/Group Management**: Organizing users into teams or groups
- **Permission Granularity**: Fine-grained permissions beyond the three roles (Member, Admin, Owner)
- **SSO/OAuth Integration**: Single sign-on or social login configuration
- **Session Management**: Viewing/revoking active user sessions

## Open Questions

1. **Invitation Flow**: When a user is added by email, should they receive an invitation email with a link to set their password, or should a temporary password be generated? (Recommend: invitation email flow)

2. **Owner Restrictions**: Should there be restrictions on the minimum number of Owners (e.g., cannot demote the last Owner)?

3. **Soft vs Hard Delete**: Should user deletion be soft (mark as deleted but retain data) or hard (permanently remove all data)?

4. **Disabled User Sessions**: When a user is disabled, should their active sessions be immediately invalidated?
