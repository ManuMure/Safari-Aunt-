import { connectDB } from "@/lib/db";
import Destination from "@/models/Destination";
import TourForm from "@/components/admin/TourForm";

export const dynamic = "force-dynamic";

export default async function NewTourPage() {
  await connectDB();
  const destinations = await Destination.find().select("name country").lean<any[]>();

  const destinationOptions = destinations.map((d) => ({
    _id: d._id.toString(),
    name: d.name,
    country: d.country,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl text-forest mb-8">New Tour</h1>
      <TourForm mode="create" destinations={destinationOptions} />
    </div>
  );
}