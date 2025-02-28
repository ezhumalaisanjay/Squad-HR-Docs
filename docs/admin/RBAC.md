# Multi-Tenant Role-Based Access Control (RBAC)

import { Users, Building, Briefcase, Layers, Grid, UsersCog } from 'lucide-react';

## Overview

:::note
Role-Based Access Control (RBAC) is a security model that restricts access based on user roles within a system. In a **multi-tenant** architecture, each tenant has a hierarchical structure defining organizations, departments, squads (channels), and users with specific roles and permissions.
:::

## Hierarchical Structure

### <UsersCog size={20} /> Tenant (Global Admin)

- The highest level in the hierarchy.
- Controls the overall system and manages multiple groups.
- Can create and manage organizations under different groups.

### <Building size={20} /> Group

- Represents a high-level entity, such as a **parent company** or a **holding group**.
- Can contain multiple organizations.
- Managed by **Group Administrators**.

### <Briefcase size={20} /> Organization

- A subdivision of a group, representing specific **companies** or **business units**.
- Managed by **Organization Admins**.
- Contains multiple **departments**.

### <Layers size={20} /> Department

- Represents functional units within an organization (e.g., HR, DevOps, Sales, Marketing).
- Each department has **Squads (Channels)** for better organization.

### <Grid size={20} /> Squad (Channel)

- A subunit of a department that groups users based on specific activities or tasks.
- Examples: HR-Squad, DevOps-Squad, Sales-Squad.

### <Users size={20} /> Users and Roles

- Each user is assigned a **role** within a specific squad, department, or organization.
- Roles define what actions users can perform.

## Example Structure

### Tenant: **Tata (Global Admin)**

- **Group:** Tata Group
  - **Organization:** TCS, Tata Salt, Tata Steel
    - **Department:** HR, DevOps, Sales, Marketing
      - **Squad (Channel):** HR-Squad, DevOps-Squad, Sales-Squad
        - **Users:** Employees, Managers

## Role & Permission Model

### **Roles**

- **Global Admin**: Manages all tenants, groups, and organizations.
- **Group Admin**: Manages an entire group and its organizations.
- **Organization Admin**: Manages an organization and its departments.
- **Department Admin**: Manages specific departments.
- **Squad Leader**: Manages squads within a department.
- **User**: General role assigned to employees.

### **Permissions**

```mdx-code-block
import { Check, X } from 'lucide-react';
```

| Role                 | Create <Check size={16} /> | Read <Check size={16} /> | Update <Check size={16} /> | Delete <X size={16} /> |
|----------------------|----------------|------|--------|--------|
| Global Admin        | ✅      | ✅    | ✅      | ✅      |
| Group Admin        | ✅      | ✅    | ✅      | ✅      |
| Organization Admin | ✅      | ✅    | ✅      | ❌      |
| Department Admin   | ✅      | ✅    | ✅      | ❌      |
| Squad Leader      | ✅      | ✅    | ❌      | ❌      |
| User              | ❌      | ✅    | ❌      | ❌      |

## Summary

This **multi-tenant RBAC** system ensures granular access control, allowing different levels of users to manage their respective scopes efficiently while ensuring security and compliance.
