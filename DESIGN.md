# Swarnika Care — Design System & UX

## 1. Design Philosophy

Swarnika Care is a healthcare product.

The design must communicate:

- Trust
- Safety
- Professionalism
- Clarity
- Reliability
- Calmness
- Efficiency

Avoid:

- Excessive decoration
- Unnecessary animations
- Visual noise
- Dense interfaces for patients
- Consumer-social-media patterns
- Excessive gradients
- Confusing navigation

---

# 2. Two Product Experiences

## Swarnika Hospitals

Public-facing experience.

Purpose:

- Hospital discovery
- Doctor discovery
- Services
- Departments
- Facilities
- Contact
- Appointment discovery

## Swarnika Care

Authenticated operational experience.

Purpose:

- Patient workflows
- Doctor workflows
- Staff workflows
- Administration

---

# 3. Care UX Principle

Every screen should answer:

"What is the most important thing this user should do next?"

Avoid unnecessary decision fatigue.

---

# 4. Role-Based UX

## Patient

Priorities:

1. Upcoming appointment
2. Doctor search
3. Medical information
4. Reports
5. Bills
6. Notifications

Patient interface should be simple and reassuring.

---

# 5. Doctor

Priorities:

1. Today's appointments
2. Patient queue
3. Consultation
4. Prescriptions
5. Lab orders
6. Availability

Doctor interface can be information-dense but must remain efficient.

---

# 6. Reception

Priorities:

1. Search patient
2. Register patient
3. Create appointment
4. Reschedule
5. Cancel
6. Check-in
7. Payment-related actions where authorized

Reception UX should optimize speed and keyboard/data-entry efficiency.

---

# 7. Nurse

Priorities:

1. Assigned patients
2. Nursing tasks
3. Observations
4. Patient status
5. Clinical workflow actions

---

# 8. Laboratory

Priorities:

1. Lab orders
2. Sample collection
3. Processing
4. Result entry
5. Report publication

---

# 9. Pharmacy

Priorities:

1. Prescription queue
2. Medication dispensing
3. Inventory
4. Orders

---

# 10. Billing

Priorities:

1. Pending invoices
2. Payments
3. Receipts
4. Refunds
5. Billing records
6. Financial reporting

---

# 11. Admin

Priorities:

1. Hospital overview
2. Users
3. Doctors
4. Staff
5. Departments
6. Appointments
7. Reports
8. Audit
9. Configuration

Admin UI may be denser than patient UI.

---

# 12. Navigation

Care should use consistent role-based navigation.

Patient:

Dashboard
Appointments
Medical Records
Prescriptions
Lab Reports
Bills & Payments
Insurance
Family
Notifications
Profile
Help
Logout

Doctor:

Dashboard
Appointments
My Patients
Consultation
Prescriptions
Lab Orders
Availability
Notifications
Profile
Logout

Admin:

Dashboard
Hospitals
Departments
Users
Doctors
Staff
Patients
Appointments
Availability
Roles
Reports
Audit Logs
Settings
Logout

Actual navigation must be verified against the current frontend.

---

# 13. Component Principles

Components should be:

- Reusable
- Accessible
- Responsive
- Predictable
- Consistent

Core components:

- Button
- Input
- Select
- Date picker
- Time picker
- Modal
- Drawer
- Card
- Table
- Badge
- Tabs
- Dropdown
- Toast
- Alert
- Pagination
- Search
- Filter
- Form

---

# 14. State Design

Every data-driven page should account for:

Loading
Empty
Success
Error
Permission Denied

Do not show blank screens during loading.

---

# 15. Form Design

Forms should:

- Group related information
- Clearly mark required fields
- Validate inline
- Provide meaningful error messages
- Preserve user input where possible
- Avoid unnecessary fields

Doctor onboarding should be divided into logical sections:

1. Basic Information
2. Professional Information
3. Specialization
4. Hospital Assignment
5. Consultation Configuration
6. Availability
7. Public Profile

---

# 16. Doctor Public Profile UX

Public profile should show:

- Doctor name
- Professional title
- Photo
- Specialty
- Qualifications
- Experience
- Expertise
- Hospital
- Department
- Consultation information
- Availability
- Book Appointment

Only published information should appear.

---

# 17. Appointment UX

Appointment flow:

Select Hospital
 ↓
Select Department
 ↓
Select Doctor
 ↓
Select Date
 ↓
Select Available Slot
 ↓
Review
 ↓
Confirm
 ↓
Appointment Confirmation

The interface must clearly communicate:

- Doctor
- Hospital
- Date
- Time
- Location
- Status

---

# 18. Responsive Design

The application must support:

- Desktop
- Laptop
- Tablet
- Mobile

Patient experiences should be especially mobile-friendly.

Operational staff interfaces may prioritize desktop/tablet depending on workflow.

---

# 19. Accessibility

Design should support:

- Keyboard navigation
- Clear focus states
- Semantic HTML
- Accessible labels
- Sufficient contrast
- Screen-reader-friendly controls
- Meaningful error messages

---

# 20. Status Design

Use consistent semantic states:

Success
Warning
Error
Information
Neutral

Do not rely only on color to communicate state.

---

# 21. Dashboard Design

Dashboards should prioritize:

- Important metrics
- Pending work
- Upcoming actions
- Alerts
- Recent activity

Avoid dashboards that exist only to display decorative charts.

---

# 22. Tables

Tables should support where appropriate:

- Search
- Filtering
- Sorting
- Pagination
- Row actions
- Status indicators

Mobile layouts should transform tables appropriately rather than forcing unreadable horizontal layouts.

---

# 23. Public Website Design

Public website should emphasize:

- Trust
- Hospital credibility
- Doctor discovery
- Services
- Locations
- Contact
- Appointment discovery

SEO and accessibility should be considered from the beginning.

---

# 24. Security UX

Never display:

- JWT
- OTP hashes
- Internal secrets
- Internal permission metadata

Unauthorized users should receive clear but non-sensitive messages.

---

# 25. Design Anti-Patterns

Avoid:

- Different button styles for the same action
- Inconsistent terminology
- Hidden destructive actions
- Long forms without grouping
- Unclear loading states
- Empty blank pages
- Overuse of modals
- Excessive animations
- Inaccessible forms
- UI-only authorization

## Employee Model
- Employee: associates userId, hospitalId, departmentId, designationId, positionId, reportingManagerId.
- Designation: code, name, functionalArea.
- Position: hospitalId, departmentId, designationId, code, title, reportsToPositionId.


## Physical Infrastructure Phase 2
Physical Hospital Infrastructure is IMPLEMENTED in organization-service.
The hierarchy is Hospital -> Building -> Floor -> Unit -> Room -> Bed, and Unit -> NursingStation.
Validation is robust and cascade delete is intentionally avoided.
