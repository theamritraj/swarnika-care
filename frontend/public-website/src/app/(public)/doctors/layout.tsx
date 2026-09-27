import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Find a Doctor | Book Doctor Appointment",
  },
  description: "Find the best doctors at Swarnika Hospital and book your appointment online instantly.",
};

export default function DoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
