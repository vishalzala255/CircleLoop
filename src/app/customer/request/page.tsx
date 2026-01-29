"use client";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RequestPickup() {
    const { user, loading } = useAuth(true);
    const router = useRouter();
    const [wasteType, setWasteType] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState("");
    const [pickupAddress, setPickupAddress] = useState("");
    const [pickupDate, setPickupDate] = useState("");
    const [pickupTime, setPickupTime] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);

        try {
            // Generate legacy-style ID: EW-YYYYMMDD-RAND
            const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randPart = Math.floor(1000 + Math.random() * 9000);
            const requestId = `EW-${datePart}-${randPart}`;

            let imageUrl = "";
            if (file) {
                // Upload to Supabase Storage 'uploads' bucket
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('uploads')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('uploads')
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }

            // Insert into pickup_requests table (using legacy-aligned column names)
            const { error: dbError } = await supabase
                .from('pickup_requests')
                .insert({
                    request_id: requestId,
                    user_id: user.id,
                    ewaste_type: wasteType,
                    description: description,
                    qty: Number(quantity),
                    pickup_address: pickupAddress,
                    pickup_date: pickupDate,
                    pickup_time: pickupTime,
                    image_url: imageUrl,
                    status: "Pending"
                });

            if (dbError) throw dbError;

            alert(`Request submitted! Your ID is: ${requestId}`);
            router.push("/customer/dashboard");

        } catch (error: any) {
            console.error(error);
            alert("Error submitting request: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !user) return <div>Loading...</div>;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-body)', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{
                maxWidth: '600px',
                width: '100%',
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 20px 60px var(--shadow-color)',
                border: '1px solid var(--border-color)'
            }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.8rem' }}>Schedule Pickup</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>Fill in the details for your e-waste collection.</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="wasteType">Type of Electronic Waste</label>
                        <select id="wasteType" value={wasteType} onChange={(e) => setWasteType(e.target.value)} required style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}>
                            <option value="">-- Select Type --</option>
                            <option value="Mobile/Tablet">Mobile/Tablet</option>
                            <option value="Laptop/Computer">Laptop/Computer</option>
                            <option value="Home Appliance">Home Appliance (TV, Fridge, etc.)</option>
                            <option value="Accessories">Accessories (Cables, Chargers)</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Details about the condition, model, etc."
                            style={{ background: 'var(--bg-card)', color: 'var(--text-main)', minHeight: '100px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Pickup Address</label>
                        <textarea
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            required
                            placeholder="Full address where items should be collected"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-main)', minHeight: '80px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label htmlFor="pickupDate">Pickup Date</label>
                            <input
                                id="pickupDate"
                                type="date"
                                value={pickupDate}
                                onChange={(e) => setPickupDate(e.target.value)}
                                required
                                style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pickupTime">Preferred Time</label>
                            <select
                                id="pickupTime"
                                value={pickupTime}
                                onChange={(e) => setPickupTime(e.target.value)}
                                required
                                style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}
                            >
                                <option value="">-- Select Time --</option>
                                <option value="Morning (9AM-12PM)">Morning (9AM-12PM)</option>
                                <option value="Afternoon (12PM-4PM)">Afternoon (12PM-4PM)</option>
                                <option value="Evening (4PM-7PM)">Evening (4PM-7PM)</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Quantity (Number of Items)</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            placeholder="e.g. 1, 5, 10"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-main)' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="photoUpload">Upload Photo (Optional)</label>
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '10px', padding: '1.5rem', textAlign: 'center', background: 'var(--bg-body)' }}>
                            <input id="photoUpload" type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} style={{ width: 'auto', border: 'none', background: 'transparent' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: '50px' }} disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit Request"}
                        </button>
                        <Link href="/customer/dashboard" className="btn btn-outline" style={{ flex: 1, textAlign: 'center', borderRadius: '50px' }}>Cancel</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
