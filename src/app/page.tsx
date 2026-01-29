import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/Icons";

export default function Home() {
  return (
    <main style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section className="hero" style={{
        padding: '6rem 2rem',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-hero-gradient)',
        position: 'relative'
      }}>
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: '300px', height: '300px', background: 'var(--accent)', opacity: 0.05, borderRadius: '50%', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '400px', height: '400px', background: 'var(--primary)', opacity: 0.05, borderRadius: '50%', filter: 'blur(100px)' }} />

        <div className="container-max" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(1.5rem, 5vw, 5rem)',
          alignItems: 'center',
          width: '100%',
          zIndex: 2
        }}>
          <div>
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 1.2rem', background: 'rgba(45,80,22,0.1)', color: 'var(--primary)', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <Icon name="recycling" size={18} /> The Future of Recycling
              </span>
            </div>

            {/* Prominent E-Waste Management Title */}
            <div className="animate-slide-up" style={{ 
              animationDelay: '0.15s',
              marginBottom: '1rem'
            }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                E-Waste Management
              </h2>
            </div>

            <h1 className="animate-slide-up" style={{
              fontSize: 'clamp(2.2rem, 5vw, 4.2rem)',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              animationDelay: '0.2s',
              color: 'var(--text-main)'
            }}>
              Give Your E-Waste <br />
              <span style={{ color: 'var(--accent)' }}>A Second Life</span>
            </h1>

            <p className="animate-slide-up" style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'var(--text-secondary)',
              marginBottom: '2.5rem',
              maxWidth: '550px',
              animationDelay: '0.3s'
            }}>
              Don't let your old gadgets gather dust. Join the circular economy perfectly designed for modern needs. We verify, collect, and responsibly recycle.
            </p>

            <div className="animate-slide-up" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', animationDelay: '0.4s' }}>
              <Link href="/customer/register" className="btn btn-primary">Start Recycling Now</Link>
              <Link href="#process" className="btn btn-outline">See How It Works</Link>
            </div>

            <div className="animate-slide-up" style={{ marginTop: '3rem', display: 'flex', gap: '2rem', animationDelay: '0.5s', opacity: 0.8 }}>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>50k+</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Devices Saved</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary)' }}>100%</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Eco-Friendly</div>
              </div>
            </div>
          </div>

          <div className="animate-float" style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
            {/* Decorative Image Frame */}
            <div style={{
              position: 'relative',
              borderRadius: '30px',
              overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.05)',
              transform: 'rotate(-2deg)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1572297794853-70f2e8ff5b7f?q=80&w=987&auto=format&fit=crop"
                alt="E-Waste Recycling"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />

              {/* Floating Badge */}
              <div className="glass-card" style={{
                position: 'absolute',
                bottom: '20px',
                left: '10px',
                right: '10px',
                padding: '0.75rem 1rem',
                transform: 'rotate(2deg)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Weekly Impact</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--success)' }}>+2,403 kg collected</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="process" style={{ padding: 'clamp(4rem, 10vw, 8rem) 1rem', background: 'var(--bg-body)' }}>
        <div className="container-max">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 4rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Simple Steps to Sustainability</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>We've optimized the process to make recycling as easy as ordering a pizza.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <Step number="01" title="Schedule Pickup" desc="Log in, upload a photo, and schedule a pickup at your convenience." delay="0s" />
            <Step number="02" title="We Collect" desc="Our verified logistics partners arrive at your doorstep to collect the items." delay="0.1s" />
            <Step number="03" title="Assessment" desc="Items are verified for their condition and materials are categorized." delay="0.2s" />
            <Step number="04" title="Responsible Recycling" desc="Items are sent to authorized recyclers for zero-landfill processing." delay="0.3s" />
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 1rem', background: 'var(--bg-section-alt)', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100px', background: 'linear-gradient(to bottom, var(--bg-body), transparent)' }} />

        <div className="container-max">
          <h2 style={{ textAlign: 'center', marginBottom: '4rem', fontSize: 'clamp(1.8rem, 5vw, 2.5rem)' }}>Why It Matters</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
            <ImpactCard
              image="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=600&fit=crop"
              title="Green Jobs Creation"
              desc="Every 1,000 tons of electronics recycling creates 15 jobs and $110,000 in tax revenue."
            />
            <ImpactCard
              image="https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=800&h=600&fit=crop"
              title="Resource Recovery"
              desc="There is 100 times more gold in a ton of e-waste than in a ton of gold ore."
            />
          </div>

          <div style={{
            background: 'var(--bg-impact-card)',
            border: '2px solid var(--border-impact-card)',
            borderRadius: '24px',
            padding: 'clamp(2rem, 5vw, 4rem) 1.5rem',
            color: 'var(--text-impact-card)',
            textAlign: 'center',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', // Subtle texture pattern
            boxShadow: '0 20px 60px var(--shadow-color)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Glow effect for dark mode */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'var(--primary)', opacity: 0.1, pointerEvents: 'none' }}></div>

            <h2 style={{ color: 'var(--text-impact-card)', marginBottom: '3rem', position: 'relative', fontSize: 'clamp(1.6rem, 4vw, 2.22rem)' }}>Our Collective Impact</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', position: 'relative' }}>
              <div className="card-hover" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-impact-card)' }}>53.6<span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>M</span></div>
                <div style={{ opacity: 0.9, color: 'var(--text-impact-card)', fontSize: '0.9rem' }}>Tons E-Waste/Year</div>
              </div>
              <div className="card-hover" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-impact-card)' }}>17.4<span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>%</span></div>
                <div style={{ opacity: 0.9, color: 'var(--text-impact-card)', fontSize: '0.9rem' }}>Currently Recycled</div>
              </div>
              <div className="card-hover" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                <div style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-impact-card)' }}>$57<span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>B</span></div>
                <div style={{ opacity: 0.9, color: 'var(--text-impact-card)', fontSize: '0.9rem' }}>Lost Raw Material Value</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" style={{ padding: 'clamp(4rem, 10vw, 8rem) 1rem', background: 'var(--bg-body)' }}>
        <div className="container-max">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 4rem' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', marginBottom: '1rem' }}>Get In Touch</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Have questions? We are here to help you navigate your recycling journey.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            <ContactCard icon={<Icon name="phone" size={28} />} title="Call Us" desc="Mon-Fri, 9AM-6PM" link="+91 987-654-3210" href="tel:+919876543210" />
            <ContactCard icon={<Icon name="mail" size={28} />} title="Email Us" desc="24/7 Support" link="support@circleloop.com" href="mailto:support@circleloop.com" />
            <ContactCard icon={<Icon name="home" size={28} />} title="Visit Us" desc="Mumbai, Maharashtra" link="123 Green Street, Eco Park" />
          </div>

          <ContactForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Step({ number, title, desc, delay = "0s" }: { number: string, title: string, desc: string, delay?: string }) {
  return (
    <div className="card-hover animate-slide-up" style={{
      background: 'var(--bg-card)',
      padding: '2.5rem',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      position: 'relative',
      overflow: 'hidden',
      animationDelay: delay
    }}>
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        fontSize: '3.5rem',
        fontWeight: 700,
        color: 'var(--primary)',
        opacity: 0.2,
        marginBottom: '0.5rem',
        lineHeight: 1
      }}>{number}</div>

      <h3 style={{ color: 'var(--text-main)', fontSize: '1.4rem', marginBottom: '0.75rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{desc}</p>
    </div>
  );
}

function ImpactCard({ image, title, desc }: { image: string, title: string, desc: string }) {
  return (
    <div className="card-hover" style={{ background: 'var(--bg-card)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={title} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
      <div style={{ padding: '2rem' }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1.4rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>{desc}</p>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, link, href }: any) {
  return (
    <div className="card-hover glass-card" style={{ padding: '2.5rem', textAlign: 'center', background: 'var(--bg-card)' }}>
      <div style={{
        width: '70px', height: '70px', background: 'var(--bg-body)', color: 'var(--primary)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.8rem', margin: '0 auto 1.5rem',
        border: '1px solid var(--border-color)'
      }}>
        {icon}
      </div>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', fontSize: '1.3rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>{desc}</p>
      {href ? <Link href={href} style={{ color: 'var(--accent)', fontWeight: 600 }}>{link}</Link> : <span style={{ color: 'var(--text-secondary)' }}>{link}</span>}
    </div>
  );
}
