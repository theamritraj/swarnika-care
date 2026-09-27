const fs = require('fs');
const path = require('path');

const baseDir = '/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/frontend/care/src/app/(staff)/nurse';

const routes = {
    'shifts/page.tsx': `export default function ShiftsPage() { return <div><h1>My Shifts</h1></div>; }`,
    'roster/page.tsx': `export default function RosterPage() { return <div><h1>Roster</h1></div>; }`,
    'patients/[id]/page.tsx': `export default function PatientPage({ params }: { params: { id: string } }) { return <div><h1>Patient Chart {params.id}</h1></div>; }`,
    'assessments/page.tsx': `export default function AssessmentsPage() { return <div><h1>Nursing Assessments</h1></div>; }`,
    'notes/page.tsx': `export default function NotesPage() { return <div><h1>Nursing Notes</h1></div>; }`,
    'tasks/page.tsx': `export default function TasksPage() { return <div><h1>Care Tasks</h1></div>; }`,
    'medications/page.tsx': `export default function MedicationsPage() { return <div><h1>Medication Administration Record</h1></div>; }`,
    'handover/page.tsx': `export default function HandoverPage() { return <div><h1>Shift Handover</h1></div>; }`,
    'notifications/page.tsx': `export default function NotificationsPage() { return <div><h1>Notifications</h1></div>; }`,
    'profile/page.tsx': `export default function ProfilePage() { return <div><h1>My Profile</h1></div>; }`
};

for (const [route, content] of Object.entries(routes)) {
    const filePath = path.join(baseDir, route);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}
console.log('Frontend routes generated.');
