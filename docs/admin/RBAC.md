# Multi-Tenant Role-Based Access Control (RBAC)

## Overview

Role-Based Access Control (RBAC) is a method of restricting system access based on roles assigned to users. In a multi-tenant system, each tenant has a separate environment with its own users, roles, and permissions. This document outlines the structure, roles, and permissions for a multi-tenant RBAC model.

---

## Hierarchical Structure

1. **Tenant (Global Admin)**
   - The highest level of the hierarchy.
   - Each tenant represents an independent entity (e.g., a company or organization).
   - The Global Admin has full control over all groups, organizations, and roles within the tenant.

2. **Group**
   - A logical collection of organizations under the tenant.
   - Example: "Tata" as the parent group.

3. **Organization**
   - Represents different business units or subsidiaries within a group.
   - Example: "TCS," "Tata Salt," "Tata Steel."

4. **Department**
   - Departments within an organization that handle specific functions.
   - Example: "HR," "DevOps," "Sales," "Marketing."

5. **Squad (Channel)**
   - A sub-unit within a department that focuses on specific tasks or teams.
   - Example: "HR" squad within the "HR Department."

6. **Roles & Users**
   - Users are assigned roles within squads, departments, or organizations.
   - Roles define the level of access and permissions users have.
   - Example: "HR Manager," "Developer," "Sales Executive."

7. **Permissions**
   - Defines what actions a user can perform based on their role.
   - Example: "View Employee Records," "Edit Payroll Information," "Approve Sales Deals."

---

## Example RBAC Model

### **Tenant: Tata (Global Admin)**

- **Group:** Tata
  - **Organization:** TCS, Tata Salt, Tata Steel
    - **Department:** HR, DevOps, Sales, Marketing
      - **Squad:** HR
        - **Users:** Employees within HR
        - **Roles:** HR Manager, Recruiter, Payroll Admin
        - **Permissions:**
          - HR Manager: Full access to HR data
          - Recruiter: View & edit job postings
          - Payroll Admin: View & process payroll

---

## Role-Based Permissions Table

| Role            | Create | Read | Update | Delete |
|----------------|--------|------|--------|--------|
| Global Admin   | ✅     | ✅   | ✅     | ✅     |
| Org Admin      | ✅     | ✅   | ✅     | ❌     |
| Department Head| ✅     | ✅   | ✅     | ❌     |
| Squad Leader   | ✅     | ✅   | ❌     | ❌     |
| User           | ❌     | ✅   | ❌     | ❌     |

---

## Conclusion

This RBAC model ensures secure, structured access control across multiple tenants, organizations, and user roles. It provides scalability while maintaining clear permission boundaries based on user responsibilities.
