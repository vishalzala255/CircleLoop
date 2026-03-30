"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactForm() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setStatus("");

        const formData = {
            name: e.target.name.value,
            email: e.target.email.value,
            phone: e.target.phone.value,
            message: e.target.message.value,
            // created_at is automatic in Supabase
        };

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert(formData);

            if (error) throw error;

            setStatus("success");
            e.target.reset();
        } catch (err) {
            console.error(err);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--light)', padding: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.4rem' }}>Send Us a Message</h3>

            {status === "success" && <div style={{ background: '#e5f0e0', color: '#2d5016', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>Message sent successfully!</div>}
            {status === "error" && <div style={{ background: '#ffe5e5', color: '#c1453d', padding: '10px', borderRadius: '5px', marginBottom: '20px', textAlign: 'center' }}>Error sending message. Try again.</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" required placeholder="Enter your full name" />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" required placeholder="your.email@example.com" />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" required placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" required placeholder="Tell us how we can help you..." style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--border)', borderRadius: '6px', minHeight: '120px' }}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? "Sending..." : "Send Message"}
                </button>
            </form>
        </div>
    );
}
